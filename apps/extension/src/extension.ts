import * as vscode from 'vscode';
import { PreviewServer } from './PreviewServer';
import { PreviewPanelProvider } from './PreviewPanelProvider';
import { OutlookFixer } from './OutlookFixer';

let previewServer: PreviewServer | undefined;
let previewPanel: PreviewPanelProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('MailMirror extension is now active');

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

        vscode.window.showInformationMessage('Mobile preview started!');
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

        vscode.window.showInformationMessage('Code fixed for Outlook compatibility!');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to fix code: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  context.subscriptions.push(
    startPreviewCommand,
    stopPreviewCommand,
    fixOutlookCommand
  );
}

export function deactivate() {
  if (previewServer) {
    previewServer.stop();
  }
}
