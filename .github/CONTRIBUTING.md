# Contributing to Rune API Client

First off, thanks for taking the time to contribute! ❤️

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to professionalism and respect. By participating, you are expected to uphold a respectful and constructive tone.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (v20 recommended)
- [Rust](https://rustup.rs/) latest stable
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Setup

```bash
# Clone your fork
git clone https://github.com/<your-username>/Rune-API-Client.git
cd Rune-API-Client

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check if the issue already exists. When filing a bug, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if UI-related)
- **Environment details**: OS, Node version, Rust version

### Suggesting Features

Feature requests are welcome! Please provide:

- **Clear use case** - What problem does this solve?
- **Detailed description** - How should it work?
- **Mockups/diagrams** (if UI-related)

### Pull Requests

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature` or `git checkout -b fix/bug-description`
3. Make your changes
4. Run tests and quality checks (see below)
5. Push to your fork
6. Open a Pull Request using our PR template

## Development Workflow

### Running Checks

Before submitting a PR, ensure all checks pass:

```bash
# Frontend quality
npm run lint        # ESLint
npm run type-check  # TypeScript
npm run test:ci     # Unit tests

# Rust quality
cd src-tauri
cargo fmt -- --check
cargo clippy -- -D warnings
cargo test          # Rust tests
```

### Pre-commit Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to run checks automatically:

- Linting and formatting on staged files
- Tests on pre-push

## Coding Standards

### TypeScript / Vue.js

- **ESLint** and **Prettier** configurations are enforced
- Use **Vue 3 Composition API** with `<script setup>` syntax
- Prefer `const` over `let`, avoid `var`
- Use explicit types, avoid `any`
- Components: PascalCase (e.g., `RequestTabs.vue`)
- Composables: camelCase starting with `use` (e.g., `useRequestStore.ts`)
- Props: define with TypeScript interfaces

Example:

```typescript
// Good
interface Props {
  requestId: string;
  isEditable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditable: true,
});

// Bad
const props = defineProps(['requestId']); // No type safety
```

### Rust

- Follow `cargo fmt` formatting
- Address all `cargo clippy` warnings
- Use `?` operator for error propagation
- Prefer `match` over `if let` chains for complex logic
- Document public functions with `///` doc comments

Example:

```rust
/// Executes an HTTP request with the given parameters
///
/// # Arguments
/// * `request` - The HTTP request to execute
///
/// # Returns
/// `RequestResult` containing either a successful response or error
pub async fn execute_http_request(request: HttpRequest) -> RequestResult {
    // Implementation
}
```

### Naming Conventions

| Context             | Convention           | Example                         |
| ------------------- | -------------------- | ------------------------------- |
| Vue components      | PascalCase           | `RequestTabs.vue`               |
| Stores              | camelCase with `use` | `useRequestStore.ts`            |
| Types/Interfaces    | PascalCase           | `HttpRequest`, `Environment`    |
| Functions/Variables | camelCase            | `executeRequest()`, `isLoading` |
| Constants           | UPPER_SNAKE_CASE     | `API_TIMEOUT`                   |
| Rust modules        | snake_case           | `database/commands.rs`          |
| Tauri commands      | camelCase            | `invoke('getCollections')`      |

## Testing

### Frontend Tests (Vitest)

```bash
# Run all tests
npm run test:ci

# Run with coverage
npm run test:coverage

# Run specific file
npx vitest run tests/unit/stores/request.test.ts
```

Guidelines:

- Test store logic thoroughly (state, getters, actions)
- Mock Tauri `invoke()` calls
- Test error handling paths
- Aim for 80%+ coverage on critical paths

### Rust Tests

```bash
cd src-tauri
cargo test
cargo test --lib  # Unit tests only
```

### Test File Locations

- Frontend: `tests/unit/**/*.test.ts`
- Rust unit tests: inline with `#[cfg(test)]` modules
- Rust integration tests: `src-tauri/tests/**/*.rs`

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding/updating tests
- `ci` - CI/CD changes
- `chore` - Maintenance tasks

Examples:

```
feat(request): add bulk edit for headers

fix(app): handle null environment variables
docs(readme): update installation instructions
test(stores): add coverage for error states
```

## Pull Request Process

1. **Fill out the PR template** completely
2. **Link related issues** using keywords (`Fixes #123`, `Closes #456`)
3. **Ensure CI passes** - All checks must be green
4. **Request review** from maintainers
5. **Address feedback** promptly and professionally
6. **Squash commits** if requested

### PR Checklist

Before submitting, verify:

- [ ] Code compiles without errors (`npm run build`, `cargo check`)
- [ ] Linting passes (`npm run lint`, `cargo clippy`)
- [ ] Tests pass (`npm run test:ci`, `cargo test`)
- [ ] Security audit passes (`cargo audit`)
- [ ] TypeScript types are correct (`npm run type-check`)
- [ ] No `console.log` or debug code left in production code
- [ ] Documentation updated (README, comments, etc.)
- [ ] PR description clearly explains changes

## Questions?

Feel free to open an issue for discussion before starting major work.

Happy coding! 🚀
