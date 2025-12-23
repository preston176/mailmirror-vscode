# MailMirror - Email Development Platform

A modern email development platform consisting of a VS Code extension for mobile preview and a web-based dashboard for email testing.

## Project Structure

This is a monorepo managed with Turborepo:

```
mailmirror-platform/
├── apps/
│   ├── extension/     # VS Code extension for mobile preview
│   └── web/           # Next.js web dashboard (coming soon)
└── packages/
    └── renderer/      # Shared MJML & Maizzle compilation engine
```

## Features

### VS Code Extension - Mobile Preview

- **Live Mobile Preview**: Preview your email templates on your phone in real-time
- **Auto Hot Reload**: Changes automatically update on your device
- **QR Code Access**: Simple QR code scanning to access preview
- **Cloudflare Tunnel**: Secure public URL without ngrok/localtunnel
- **Outlook Fixer**: AI-powered tool to fix Outlook compatibility issues (coming soon)

### Renderer Package (`@mailmirror/renderer`)

- MJML compilation
- Maizzle template support
- Auto-detection of template format
- Shared across extension and web platform

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Cloudflare Tunnel CLI (`cloudflared`)

### Installing Cloudflare Tunnel

**macOS:**
```bash
brew install cloudflared
```

**Linux:**
Follow instructions at https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

**Windows:**
Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build all packages:**
   ```bash
   npm run build
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Develop the extension:**
   ```bash
   cd apps/extension
   npm run dev
   ```
   Then press F5 in VS Code to launch the extension development host.

5. **Develop the web app:**
   ```bash
   cd apps/web
   npm run dev
   ```

## Using the VS Code Extension

1. Open an email template file (`.mjml` or `.html`)
2. Run command: `MailMirror: Start Mobile Preview` (Cmd/Ctrl + Shift + P)
3. A QR code will appear in the MailMirror sidebar
4. Scan the QR code with your phone
5. Edit your template - changes auto-reload on your device!

### Fix for Outlook

1. Select HTML code that needs Outlook compatibility fixes
2. Run command: `MailMirror: Fix for Outlook`
3. The selected code will be transformed for Outlook compatibility

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

This starts all packages in watch mode.

### Building for Production

```bash
npm run build
```

### Package the VS Code Extension

```bash
cd apps/extension
npm run package
```

This creates a `.vsix` file you can install or publish to the marketplace.

## Architecture

### Renderer Package (`@mailsync/renderer`)

The core IP - handles compilation of MJML and Maizzle templates. Shared between the VS Code extension and web platform to ensure consistent rendering.

### VS Code Extension

- Express server serves compiled HTML
- Cloudflare Tunnel creates public URL
- WebSocket connection for hot reload
- File watcher monitors template changes
- QR code displayed in VS Code sidebar

### Web Dashboard (Coming Soon)

- Cloud-based template editor
- Multi-client email testing
- Team collaboration features
- Template library
- Analytics

## Roadmap to $50 MRR

1. ✅ **Phase 1: The Wedge** - Free VS Code extension
   - Mobile preview
   - Outlook fixer
   - Build distribution & trust

2. **Phase 2: The Upsell** - Web Platform (Pro)
   - Email client testing (Gmail, Outlook, Apple Mail, etc.)
   - Cloud storage
   - Team features
   - $5-10/month per user

3. **Phase 3: Growth**
   - Show HN / Product Hunt launch
   - VS Code marketplace promotion
   - Content marketing (Outlook compatibility guides)

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Monorepo**: Turborepo
- **Web Framework**: Next.js 15
- **Email Frameworks**: MJML, Maizzle
- **Testing**: Jest
- **Tunnel**: Cloudflare Tunnel

## Contributing

This is currently a solo project building toward $50 MRR. Open to feedback and suggestions!

## License

MIT
