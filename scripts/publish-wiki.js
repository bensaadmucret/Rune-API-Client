const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WIKI_DIR = '.wiki-temp';
const DOC_SOURCE = 'doc/wiki';
const REPO_URL = 'https://github.com/bensaadmucret/Rune-API-Client.wiki.git';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  return execSync(command, { encoding: 'utf-8', stdio: 'pipe', ...options });
}

function cleanWikiDir() {
  if (fs.existsSync(WIKI_DIR)) {
    log('🧹 Nettoyage du dossier temporaire...', 'yellow');
    fs.rmSync(WIKI_DIR, { recursive: true, force: true });
  }
}

function cloneWiki(token) {
  log('📦 Clonage du wiki...', 'blue');
  const url = token
    ? `https://${token}@github.com/bensaadmucret/Rune-API-Client.wiki.git`
    : REPO_URL;
  exec(`git clone ${url} ${WIKI_DIR}`);
}

function copyFiles() {
  log('📋 Copie des fichiers...', 'blue');
  const files = fs.readdirSync(DOC_SOURCE).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const src = path.join(DOC_SOURCE, file);
    const dest = path.join(WIKI_DIR, file);
    fs.copyFileSync(src, dest);
    log(`  ✓ ${file}`, 'green');
  }

  return files.length;
}

function commitAndPush() {
  log('📤 Publication...', 'blue');

  const cwd = path.resolve(WIKI_DIR);

  // Config git
  try {
    exec('git config user.email "wiki@rune-api-client.local"', { cwd });
    exec('git config user.name "Wiki Bot"', { cwd });
  } catch (e) {
    // Ignore config errors
  }

  // Check for changes
  const status = exec('git status --porcelain', { cwd }).trim();

  if (!status) {
    log('⚠️  Pas de changements à publier', 'yellow');
    return false;
  }

  // Add, commit, push
  exec('git add -A', { cwd });
  exec(`git commit -m "Mise à jour documentation - ${new Date().toISOString()}"`, { cwd });
  exec('git push origin master', { cwd });

  return true;
}

async function main() {
  log('🚀 Publication du Wiki GitHub...', 'blue');

  try {
    // Check if doc/wiki exists
    if (!fs.existsSync(DOC_SOURCE)) {
      log(`❌ Dossier ${DOC_SOURCE} non trouvé`, 'red');
      process.exit(1);
    }

    // Get token from args or env
    const token = process.argv[2] || process.env.GITHUB_TOKEN;

    // Clean and clone
    cleanWikiDir();
    cloneWiki(token);

    // Copy files
    const count = copyFiles();
    log(`✅ ${count} fichiers copiés`, 'green');

    // Commit and push
    const pushed = commitAndPush();

    if (pushed) {
      log('✅ Wiki publié avec succès !', 'green');
      log('🌐 https://github.com/bensaadmucret/Rune-API-Client/wiki', 'blue');
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    cleanWikiDir();
  }
}

main();
