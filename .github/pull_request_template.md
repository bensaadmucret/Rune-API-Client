## Description

<!-- Provide a clear and concise description of your changes -->

Closes #(issue number)

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🧪 Tests only (adding or updating tests, no production code change)
- [ ] 🔧 CI/CD configuration
- [ ] ♻️ Refactoring (no functional changes)
- [ ] 🎨 Styling changes (CSS, formatting)
- [ ] 🏗️ Build system or dependencies

## Changes Made

<!-- Describe what you changed and why -->

### Added

-

### Changed

-

### Fixed

-

### Removed

-

## Testing

<!-- Describe how you tested your changes -->

- [ ] All existing tests pass (`npm run test:ci`)
- [ ] Added new tests for the changes
- [ ] Tested manually in the app
- [ ] Tested on multiple OS/browsers (if applicable)

### Test Coverage

<!-- If applicable, mention the coverage impact -->

- Previous coverage: XX%
- New coverage: XX%

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

### Before:

### After:

## Checklist

<!-- Please check all that apply -->

- [ ] My code follows the project's coding standards (see CONTRIBUTING.md)
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Frontend: `npm run lint` and `npm run type-check` pass
- [ ] Rust: `cargo clippy -- -D warnings` passes
- [ ] I have run `cargo audit` and addressed any security issues
- [ ] The PR title follows conventional commits format (e.g., "feat: add header autocomplete")
- [ ] I have rebased my branch on the latest `main` (if needed)

## Additional Notes

<!-- Any additional information or context -->

### Potential Impact

<!-- Describe any potential side effects or areas that need attention -->

### Migration Notes

<!-- If breaking changes, provide migration steps -->

### Dependencies Added/Updated

<!-- List any new dependencies or version updates -->

---

**Reviewer Notes:**

<!-- Leave this section for reviewers -->

## Review Checklist for Maintainers

- [ ] Code quality meets project standards
- [ ] Tests cover the new functionality
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced (`cargo audit`)
- [ ] CI passes on all platforms
- [ ] Commit history is clean (squashed if necessary)
