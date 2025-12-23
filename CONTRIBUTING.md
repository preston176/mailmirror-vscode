# Contributing to MailSync

Thank you for your interest in contributing to MailSync! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- Bun package manager
- VS Code
- Cloudflare Tunnel CLI (`cloudflared`)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mailsync-vscode.git
   cd mailsync-vscode
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Build all packages**
   ```bash
   bun run build
   ```

4. **Run in development mode**
   ```bash
   # Watch mode for all packages
   bun run dev
   ```

### Project Structure

```
mailsync-vscode/
├── apps/
│   ├── extension/     # VS Code extension
│   └── web/          # Next.js web dashboard
├── packages/
│   └── renderer/     # Shared MJML & Maizzle compiler
└── examples/         # Example email templates
```

## Development Workflow

### Working on the Renderer Package

```bash
cd packages/renderer
bun run dev          # Watch mode
bun run test         # Run tests
bun run build        # Build
```

### Working on the VS Code Extension

1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Make changes to `apps/extension/src/`
4. Reload the extension window to test changes

### Working on the Web Dashboard

```bash
cd apps/web
bun run dev          # Start Next.js dev server
```

## Code Style

- **TypeScript** for all code
- **Strict mode** enabled
- **ESM modules** for renderer package
- **CommonJS** for VS Code extension (VS Code requirement)

### Formatting

- Use consistent indentation (2 spaces)
- No trailing whitespace
- LF line endings

## Making Changes

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add support for React Email framework
fix: resolve WebSocket connection timeout
docs: update installation instructions
refactor: simplify MJML compilation logic
```

Keep commits atomic - one logical change per commit.

## Pull Request Process

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   bun run build
   bun run test
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots/GIFs for UI changes

## Testing

### Manual Testing

1. Launch extension with `F5` in VS Code
2. Open `examples/welcome-email.mjml`
3. Test all commands:
   - Start Mobile Preview
   - Stop Mobile Preview
   - Fix for Outlook
4. Verify QR code generation
5. Test hot reload on file changes

### Automated Testing

```bash
cd packages/renderer
bun run test
```

## Reporting Issues

### Bug Reports

Include:
- VS Code version
- Extension version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages/screenshots

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternative approaches considered
- Willingness to contribute implementation

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Architecture Decisions

### Why Cloudflare Tunnel?

- Free and reliable
- No account required for basic use
- Better than ngrok for MVP
- Production-ready infrastructure

### Why Turborepo?

- Shared packages prevent code duplication
- Fast builds with caching
- Easy to scale to multiple apps

### Why Mock AI Initially?

- Ship faster
- Reduce costs during validation
- Can add real API integration later

## Need Help?

- Check existing issues and pull requests
- Review the README.md and GETTING_STARTED.md
- Open a discussion for questions
- Tag maintainers if stuck

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
