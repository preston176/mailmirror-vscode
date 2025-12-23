import * as vscode from 'vscode';
import * as QRCode from 'qrcode';

export class PreviewPanelProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private previewUrl?: string;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    this.updateView();
  }

  setPreviewUrl(url: string) {
    this.previewUrl = url;
    this.updateView();
  }

  clearPreviewUrl() {
    this.previewUrl = undefined;
    this.updateView();
  }

  private async updateView() {
    if (!this.view) return;

    if (!this.previewUrl) {
      this.view.webview.html = this.getNoPreviewHtml();
      return;
    }

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(this.previewUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      this.view.webview.html = this.getPreviewHtml(this.previewUrl, qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      this.view.webview.html = this.getErrorHtml(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private getNoPreviewHtml(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          padding: 20px;
          font-family: var(--vscode-font-family);
          color: var(--vscode-foreground);
        }
        .container {
          text-align: center;
        }
        .empty-state {
          margin-top: 40px;
        }
        h2 {
          color: var(--vscode-foreground);
          margin-bottom: 10px;
        }
        p {
          color: var(--vscode-descriptionForeground);
          line-height: 1.6;
        }
        .instructions {
          margin-top: 20px;
          text-align: left;
          padding: 15px;
          background: var(--vscode-textBlockQuote-background);
          border-left: 3px solid var(--vscode-textLink-foreground);
          border-radius: 4px;
        }
        .instructions ol {
          margin: 10px 0;
          padding-left: 20px;
        }
        .instructions li {
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="empty-state">
          <h2>Mobile Preview</h2>
          <p>No preview is currently running.</p>

          <div class="instructions">
            <strong>To start:</strong>
            <ol>
              <li>Open an email template (.mjml or .html)</li>
              <li>Run command: <strong>MailSync: Start Mobile Preview</strong></li>
              <li>Scan the QR code with your phone</li>
            </ol>
          </div>
        </div>
      </div>
    </body>
    </html>`;
  }

  private getPreviewHtml(url: string, qrCodeDataUrl: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          padding: 20px;
          font-family: var(--vscode-font-family);
          color: var(--vscode-foreground);
        }
        .container {
          text-align: center;
        }
        h2 {
          color: var(--vscode-foreground);
          margin-bottom: 10px;
        }
        .status {
          display: inline-block;
          padding: 4px 12px;
          background: var(--vscode-testing-iconPassed);
          color: white;
          border-radius: 12px;
          font-size: 12px;
          margin-bottom: 20px;
        }
        .qr-code {
          margin: 20px 0;
          padding: 20px;
          background: white;
          border-radius: 8px;
          display: inline-block;
        }
        .qr-code img {
          display: block;
        }
        .url {
          margin-top: 20px;
          padding: 12px;
          background: var(--vscode-input-background);
          border: 1px solid var(--vscode-input-border);
          border-radius: 4px;
          font-family: var(--vscode-editor-font-family);
          font-size: 12px;
          word-break: break-all;
          cursor: pointer;
        }
        .url:hover {
          background: var(--vscode-list-hoverBackground);
        }
        .help-text {
          margin-top: 20px;
          color: var(--vscode-descriptionForeground);
          font-size: 13px;
          line-height: 1.6;
        }
        .copy-btn {
          margin-top: 10px;
          padding: 8px 16px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--vscode-font-family);
        }
        .copy-btn:hover {
          background: var(--vscode-button-hoverBackground);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Mobile Preview</h2>
        <div class="status">⚡ Live</div>

        <div class="qr-code">
          <img src="${qrCodeDataUrl}" alt="QR Code" />
        </div>

        <p class="help-text">Scan this QR code with your phone to preview</p>

        <div class="url" onclick="copyUrl()" title="Click to copy">
          ${url}
        </div>

        <button class="copy-btn" onclick="copyUrl()">Copy URL</button>

        <p class="help-text">
          Any changes to your email template will automatically reload on your device.
        </p>
      </div>

      <script>
        function copyUrl() {
          const url = '${url}';
          navigator.clipboard.writeText(url).then(() => {
            const btn = document.querySelector('.copy-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
              btn.textContent = originalText;
            }, 2000);
          });
        }
      </script>
    </body>
    </html>`;
  }

  private getErrorHtml(error: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          padding: 20px;
          font-family: var(--vscode-font-family);
          color: var(--vscode-errorForeground);
        }
      </style>
    </head>
    <body>
      <h2>Error</h2>
      <p>${error}</p>
    </body>
    </html>`;
  }
}
