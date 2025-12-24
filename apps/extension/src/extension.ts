import * as vscode from 'vscode';
import { PreviewServer } from './PreviewServer';
import { PreviewPanelProvider } from './PreviewPanelProvider';
import { OutlookFixer } from './OutlookFixer';

let previewServer: PreviewServer | undefined;
let previewPanel: PreviewPanelProvider | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('MailMirror extension is now active');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'mailmirror.showQR';
  context.subscriptions.push(statusBarItem);

  // Create the preview panel provider
  previewPanel = new PreviewPanelProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'mailmirror.previewPanel',
      previewPanel
    )
  );

  // Start Preview Command
  const startPreviewCommand = vscode.commands.registerCommand(
    'mailmirror.startPreview',
    async () => {
      if (previewServer) {
        vscode.window.showInformationMessage('Preview server is already running');
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
      }

      try {
        previewServer = new PreviewServer(context);
        await previewServer.start(editor.document.fileName);

        const url = previewServer.getPublicUrl();
        if (url && previewPanel) {
          previewPanel.setPreviewUrl(url);
        }

        if (url) {
          // Update status bar
          if (statusBarItem) {
            statusBarItem.text = '$(device-mobile) Preview Active';
            statusBarItem.tooltip = `Click to show QR code\n${url}`;
            statusBarItem.show();
          }

          vscode.window.showInformationMessage('Mobile preview started!', 'Open in Browser', 'Copy URL')
            .then(selection => {
              if (selection === 'Open in Browser') {
                vscode.env.openExternal(vscode.Uri.parse(url));
              } else if (selection === 'Copy URL') {
                vscode.env.clipboard.writeText(url);
                vscode.window.showInformationMessage('URL copied to clipboard!');
              }
            });
        } else {
          vscode.window.showInformationMessage('Mobile preview started!');
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to start preview: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  // Stop Preview Command
  const stopPreviewCommand = vscode.commands.registerCommand(
    'mailmirror.stopPreview',
    async () => {
      if (previewServer) {
        await previewServer.stop();
        previewServer = undefined;
        if (previewPanel) {
          previewPanel.clearPreviewUrl();
        }
        if (statusBarItem) {
          statusBarItem.hide();
        }
        vscode.window.showInformationMessage('Preview stopped');
      }
    }
  );

  // Fix for Outlook Command
  const fixOutlookCommand = vscode.commands.registerCommand(
    'mailmirror.fixForOutlook',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      if (!selectedText) {
        vscode.window.showWarningMessage('Please select HTML code to fix for Outlook');
        return;
      }

      try {
        const fixer = new OutlookFixer();
        const fixedCode = await fixer.fixForOutlook(selectedText);

        await editor.edit(editBuilder => {
          editBuilder.replace(selection, fixedCode);
        });

        vscode.window.showInformationMessage('Code fixed for Outlook compatibility!', 'Learn More')
          .then(selection => {
            if (selection === 'Learn More') {
              vscode.env.openExternal(vscode.Uri.parse('https://www.campaignmonitor.com/css/'));
            }
          });
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to fix code: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  // Show QR Code Command (triggered by status bar click)
  const showQRCommand = vscode.commands.registerCommand(
    'mailmirror.showQR',
    async () => {
      const url = previewServer?.getPublicUrl();
      if (!url) {
        vscode.window.showWarningMessage('No preview is running');
        return;
      }

      const action = await vscode.window.showQuickPick(
        ['Show QR Code', 'Open in Browser', 'Copy URL'],
        { placeHolder: `Preview URL: ${url}` }
      );

      if (action === 'Show QR Code') {
        // Open sidebar panel with QR code
        vscode.commands.executeCommand('mailmirror.previewPanel.focus');
      } else if (action === 'Open in Browser') {
        vscode.env.openExternal(vscode.Uri.parse(url));
      } else if (action === 'Copy URL') {
        vscode.env.clipboard.writeText(url);
        vscode.window.showInformationMessage('URL copied!');
      }
    }
  );

  context.subscriptions.push(
    startPreviewCommand,
    stopPreviewCommand,
    fixOutlookCommand,
    showQRCommand
  );
}

export function deactivate() {
  if (previewServer) {
    previewServer.stop();
  }
}
