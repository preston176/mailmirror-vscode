import * as vscode from 'vscode';
import express, { Express } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import * as chokidar from 'chokidar';
import * as fs from 'fs/promises';
import * as path from 'path';
import { compileEmail } from '@mailmirror/renderer';
import { TunnelManager } from './TunnelManager';

export class PreviewServer {
  private app: Express;
  private server: Server | undefined;
  private wss: WebSocketServer | undefined;
  private clients: Set<WebSocket> = new Set();
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

    // Start WebSocket server
    this.wss = new WebSocketServer({ server: this.server });
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('WebSocket client connected');

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('WebSocket client disconnected');
      });
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
    const wsScript = `
      <script>
        (function() {
          const ws = new WebSocket('ws://' + window.location.host);
          ws.onmessage = function(event) {
            if (event.data === 'reload') {
              window.location.reload();
            }
          };
          ws.onclose = function() {
            console.log('WebSocket connection closed');
          };
        })();
      </script>
    `;

    // Inject before closing </body> tag, or at the end if no body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${wsScript}</body>`);
    }
    return html + wsScript;
  }

  private broadcastReload() {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('reload');
      }
    });
  }

  getPublicUrl(): string | undefined {
    return this.tunnelManager.getPublicUrl();
  }

  async stop() {
    // Stop file watcher
    if (this.watcher) {
      await this.watcher.close();
    }

    // Close WebSocket connections
    this.clients.forEach(client => client.close());
    this.clients.clear();

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }

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
