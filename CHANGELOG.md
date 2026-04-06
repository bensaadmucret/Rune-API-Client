# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-04-06

### Added

- Initial release of Rune API Client
- HTTP request client with support for GET, POST, PUT, DELETE, PATCH methods
- Request headers and body editor with JSON/XML/form-data support
- Response viewer with syntax highlighting and formatted JSON/XML
- Collections system for organizing API requests
- Environment variables support with variable substitution
- Request history with search and filtering
- Dark/Light theme support
- French and English localization (i18n)
- Tauri-based desktop application (cross-platform)
- SQLite database for local data storage
- Import/Export collections (JSON format)

### Security

- Cargo audit workflow for vulnerability scanning
- Security policy and reporting process

### ⚠️ Notes de sécurité - v0.1.0

Les binaires de cette release initiale ne sont pas signés numériquement (codesigning).

**Pourquoi ?** Simplification de la première release, pas de certificats Apple/Microsoft.

**Installation des binaires non signés:**

- **macOS**: Après installation, exécuter `xattr -cr /Applications/Rune-API-Client.app` dans Terminal
- **Windows**: Au lancement, cliquer sur "Plus d'infos" puis "Exécuter quand même"
- **Linux**: Aucune action requise (AppImage/deb fonctionnent normalement)

Consultez [RELEASE_NOTES.md](RELEASE_NOTES.md) pour plus de détails.

[0.1.0]: https://github.com/bensaadmucret/Rune-API-Client/releases/tag/v0.1.0
