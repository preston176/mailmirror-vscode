import * as vscode from 'vscode';
import express, { Express, Response } from 'express';
import { Server } from 'http';
import * as chokidar from 'chokidar';
import * as fs from 'fs/promises';
import * as path from 'path';
import { compileEmail } from '@mailmirror/renderer';
import { TunnelManager } from './TunnelManager';

export class PreviewServer {
  private app: Express;
  private server: Server | undefined;
  private clients: Map<number, Response> = new Map();
  private watcher: chokidar.FSWatcher | undefined;
  private tunnelManager: TunnelManager;
  private currentFile: string | undefined;
  private compiledHtml: string = '';
  private port: number = 3000;

  constructor(private context: vscode.ExtensionContext) {
    this.app = express();
    this.tunnelManager = new TunnelManager();
    this.setupRoutes();
  }

  private setupRoutes() {
    // Serve the compiled HTML
    this.app.get('/', (req, res) => {
      res.send(this.compiledHtml || '<h1>No email template loaded</h1>');
    });

    // Server-Sent Events endpoint for hot reload
    this.app.get('/events', (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Send initial connection message
      res.write('data: connected\n\n');

      // Store client connection
      const clientId = Date.now();
      const clients = this.clients as any;
      clients.set(clientId, res);

      // Clean up on close
      req.on('close', () => {
        clients.delete(clientId);
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  }

  async start(filePath: string) {
    this.currentFile = filePath;

    // Initial compilation
    await this.compileAndUpdate();

    // Start HTTP server
    this.server = this.app.listen(this.port, () => {
      console.log(`Preview server running on port ${this.port}`);
    });

    // Start Cloudflare Tunnel
    await this.tunnelManager.start(this.port);

    // Watch for file changes
    this.watcher = chokidar.watch(filePath, {
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', async () => {
      console.log('File changed, recompiling...');
      await this.compileAndUpdate();
      this.broadcastReload();
    });
  }

  private async compileAndUpdate() {
    if (!this.currentFile) return;

    try {
      const content = await fs.readFile(this.currentFile, 'utf-8');
      const result = await compileEmail(content);

      if (result.errors.length > 0) {
        console.error('Compilation errors:', result.errors);
        vscode.window.showWarningMessage(
          `Compilation warnings: ${result.errors.join(', ')}`
        );
      }

      // Inject WebSocket client for hot reload
      this.compiledHtml = this.injectWebSocketClient(result.html);
    } catch (error) {
      console.error('Compilation failed:', error);
      vscode.window.showErrorMessage(
        `Failed to compile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private injectWebSocketClient(html: string): string {
    const sseScript = `
      <script>
        (function() {
          const eventSource = new EventSource(window.location.origin + '/events');

          eventSource.onmessage = function(event) {
            if (event.data === 'reload') {
              console.log('Reloading page...');
              window.location.reload();
            }
          };

          eventSource.onerror = function(error) {
            console.log('SSE connection error, retrying...');
            eventSource.close();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          };

          console.log('MailMirror: Hot reload connected');
        })();
      </script>
    `;

    // Inject before closing </body> tag, or at the end if no body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${sseScript}</body>`);
    }
    return html + sseScript;
  }

  private broadcastReload() {
    this.clients.forEach(client => {
      try {
        client.write('data: reload\n\n');
      } catch (error) {
        console.error('Failed to send reload event:', error);
      }
    });
    console.log(`Broadcasted reload to ${this.clients.size} clients`);
  }

  getPublicUrl(): string | undefined {
    return this.tunnelManager.getPublicUrl();
  }

  async stop() {
    // Stop file watcher
    if (this.watcher) {
      await this.watcher.close();
    }

    // Close SSE connections
    this.clients.forEach(client => {
      try {
        client.end();
      } catch (error) {
        // Ignore errors on close
      }
    });
    this.clients.clear();

    // Stop HTTP server
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
    }

    // Stop tunnel
    await this.tunnelManager.stop();

    console.log('Preview server stopped');
  }
}
