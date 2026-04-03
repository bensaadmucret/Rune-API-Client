# Rune API Client

> **Forge your API requests**

A powerful, cross-platform API testing client built with **Rust**, **Tauri**, and **Vue.js**. Inspired by Postman, designed for developers who want speed, efficiency, and a beautiful interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech Stack](https://img.shields.io/badge/stack-Rust%20%7C%20Tauri%20%7C%20Vue.js-orange.svg)
![Status](https://img.shields.io/badge/status-in%20development-green.svg)

---

## ✨ Features

### Core HTTP Capabilities
- 🚀 **HTTP Requests** - Support for GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- 📋 **Request Builder** - Intuitive interface with method selector, URL input, and quick actions
- 🔧 **Headers Management** - Add, edit, enable/disable custom headers with count indicator
- 📝 **Request Body** - Support for raw (JSON, XML, Text, HTML), form-data, and url-encoded formats
- 🔍 **Query Parameters** - Automatic URL parsing and manual param editing with enable/disable toggle

### Collections & Organization
- 📁 **Collections** - Organize API requests into named collections with custom colors
- 📂 **Folders** - Create nested folder structures within collections
- 💾 **Save Requests** - Save current request to collection or specific folder
- 🔖 **Request Metadata** - Name, description, and timestamps for all saved requests

### Environments & Variables
- 🌍 **Multiple Environments** - Create and switch between environments (Development, Production, etc.)
- 🔑 **Environment Variables** - Define variables with `{{variable_name}}` syntax
- 📝 **Variable Types** - Support for default and secret (masked) variables
- 🔄 **Auto Substitution** - Variables automatically replaced in URLs, headers, and body

### Authentication
- 🔐 **Bearer Token** - Quick JWT/OAuth token authentication
- 🔑 **API Key** - Header or query parameter based API keys
- 👤 **Basic Auth** - Username/password with base64 encoding
- 🚫 **No Auth** - Simple toggle between auth methods

### Response Visualization
- 🎨 **Syntax Highlighting** - JSON response highlighting with color-coded keys, strings, numbers
- 📊 **Response Info** - Status code, response time, and size at a glance
- 🗂️ **Tabs** - Body, Headers, and Cookies organized in tabs with count badges
- 🌓 **View Modes** - Pretty-printed and raw response views
- 📋 **Copy & Download** - One-click copy to clipboard or download response as file
- 🔢 **Line Numbers** - Code editor-style display with line numbers

### History
- ⏱️ **Request History** - Automatic tracking of all sent requests
- 📅 **Date Grouping** - History organized by date (Today, Yesterday, etc.)
- 🔄 **Replay** - Re-execute any request from history with one click
- 🗑️ **Clear History** - Option to clear all or individual history entries

### Internationalization
- 🌐 **Multi-language** - Support for English and French
- 🔄 **Live Switch** - Change language without restarting the app
- 🎯 **Fallback** - Automatic fallback to English if translation is missing

### UI/UX
- 🎨 **Modern Design** - Clean, Postman-inspired interface
- 🖥️ **Responsive Layout** - Three-panel design (Sidebar, Request, Response)
- 📱 **Dark Theme** - Dark code editor for response visualization
- 🔍 **Search** - Quick search in collections
- 📊 **Status Badges** - Color-coded HTTP method and status code indicators

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Rust + Tokio + Reqwest |
| **Frontend** | Vue.js 3 (Composition API) |
| **Desktop** | Tauri v2 |
| **Styling** | TailwindCSS v4 |
| **State** | Pinia |
| **i18n** | Vue I18n |
| **Build** | Vite |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installation

```bash
# Clone the repository
git clone https://github.com/bensaadmucret/Rune-API-Client.git
cd Rune-API-Client

# Install frontend dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

---

## 📁 Project Structure

```
├── src/                    # Frontend Vue.js source
│   ├── components/        # Vue components
│   ├── stores/            # Pinia state management
│   ├── types/             # TypeScript type definitions
│   ├── i18n/              # Internationalization
│   └── assets/            # Static assets
├── src-tauri/             # Rust backend
│   ├── src/               # Rust source code
│   └── Cargo.toml         # Rust dependencies
├── test-data.json         # Sample data for testing
└── tauri.conf.json        # Tauri configuration
```

---

## 🎯 Usage

### Sending a Request
1. Select HTTP method from dropdown
2. Enter URL in the address bar
3. Add headers in the Headers tab
4. Configure authentication if needed
5. Click **Send** button

### Managing Collections
1. Click **+ New Collection** in sidebar
2. Name your collection and pick a color
3. Add folders to organize requests
4. Save requests to specific folders

### Using Environments
1. Click the gear icon to create environments
2. Add variables with `{{variable_name}}` syntax
3. Select active environment from dropdown
4. Use variables in URLs, headers, or body

### Loading Test Data
Click **Load Test Data** button in the sidebar footer to populate the app with sample collections, environments, and history.

---

## 🗺️ Roadmap

### Phase 1: Core (✅ Completed)
- [x] HTTP request execution
- [x] Collections and folders
- [x] Environment variables
- [x] Request history
- [x] Basic authentication
- [x] Response visualization
- [x] Internationalization (EN/FR)

### Phase 2: Enhanced (🔄 In Progress)
- [ ] SQLite persistence
- [ ] Import/Export (Postman collections)
- [ ] Pre-request scripts
- [ ] Response assertions/tests
- [ ] WebSocket support

### Phase 3: Advanced (📋 Planned)
- [ ] Team collaboration
- [ ] Cloud sync
- [ ] API documentation generation
- [ ] Mock server
- [ ] GraphQL support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Inspired by [Postman](https://www.postman.com/)
- Built with [Tauri](https://tauri.app/)
- Powered by [Vue.js](https://vuejs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)

