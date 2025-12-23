import { spawn, ChildProcess } from 'child_process';
import * as vscode from 'vscode';

export class TunnelManager {
  private process: ChildProcess | undefined;
  private publicUrl: string | undefined;

  async start(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if cloudflared is installed
      const checkProcess = spawn('which', ['cloudflared']);

      checkProcess.on('close', (code) => {
        if (code !== 0) {
          const message =
            'Cloudflare Tunnel (cloudflared) is not installed.\n\n' +
            'To install:\n' +
            '• macOS: brew install cloudflared\n' +
            '• Linux: Follow instructions at https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/\n' +
            '• Windows: Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/';

          vscode.window.showErrorMessage(message, 'Open Installation Guide').then(selection => {
            if (selection === 'Open Installation Guide') {
              vscode.env.openExternal(
                vscode.Uri.parse('https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/')
              );
            }
          });

          reject(new Error('cloudflared not installed'));
          return;
        }

        // Start the tunnel
        this.process = spawn('cloudflared', [
          'tunnel',
          '--url',
          `http://localhost:${port}`,
          '--no-autoupdate'
        ]);

        let urlFound = false;

        this.process.stdout?.on('data', (data) => {
          const output = data.toString();
          console.log('Cloudflared:', output);

          // Extract the public URL from cloudflared output
          const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
          if (urlMatch && !urlFound) {
            this.publicUrl = urlMatch[0];
            urlFound = true;
            console.log('Tunnel URL:', this.publicUrl);
            vscode.window.showInformationMessage(
              `Public URL: ${this.publicUrl}`
            );
            resolve();
          }
        });

        this.process.stderr?.on('data', (data) => {
          console.error('Cloudflared error:', data.toString());
        });

        this.process.on('error', (error) => {
          console.error('Failed to start cloudflared:', error);
          reject(error);
        });

        this.process.on('close', (code) => {
          console.log(`Cloudflared exited with code ${code}`);
          this.publicUrl = undefined;
        });

        // Timeout after 30 seconds if URL not found
        setTimeout(() => {
          if (!urlFound) {
            reject(new Error('Timeout waiting for tunnel URL'));
          }
        }, 30000);
      });
    });
  }

  getPublicUrl(): string | undefined {
    return this.publicUrl;
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = undefined;
      this.publicUrl = undefined;
    }
  }
}
