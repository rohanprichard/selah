# Contributing to Selah

Thanks for your interest in contributing to Selah! Whether it's a bug report, feature request, or code contribution, we appreciate your help making this project better for worship teams everywhere.

## Getting Started

1. **Fork** the repository and clone your fork locally.
2. **Install dependencies**: `npm install` (requires Node.js >= 20).
3. **Set up environment variables**: copy `.env.example` to `.env.local` and fill in your Supabase project credentials (see the [README](./README.md) for details).
4. **Start the dev server**: `npm run dev`.

## Development Workflow

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes.
3. Run the checks before committing:
   ```bash
   npm run lint        # ESLint
   npm run typecheck   # TypeScript strict mode
   npm run test        # Vitest unit tests
   ```
4. Commit with a clear, descriptive message:
   ```
   feat: add PDF export for chord sheets
   fix: correct transpose logic for slash chords
   docs: update deployment guide
   ```
5. Push to your fork and open a Pull Request against `main`.

## Code Style

- **TypeScript** strict mode is enforced — avoid `any` types.
- **ESLint** with the Next.js + TypeScript ruleset — run `npm run lint` to check.
- **Tailwind CSS** — use existing design tokens from `globals.css` before adding new ones.
- **shadcn/ui** — use the existing component primitives in `components/ui/` when possible.

## Reporting Bugs

Open an issue using the **Bug Report** template. Please include:
- Steps to reproduce
- Expected vs. actual behavior
- Browser / OS version
- Screenshots if applicable

## Suggesting Features

Open an issue using the **Feature Request** template. Describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
