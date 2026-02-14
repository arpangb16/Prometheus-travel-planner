# Upgrading Node.js

If you're seeing a message about upgrading Node.js, follow these instructions:

## Check Current Version

```bash
node --version
```

## Upgrade Node.js

### Option 1: Using Node Version Manager (nvm) - Recommended

**Install nvm:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Reload your shell:**
```bash
source ~/.bashrc
# or
source ~/.zshrc
```

**Install latest LTS version:**
```bash
nvm install --lts
nvm use --lts
```

**Verify:**
```bash
node --version  # Should show v18.x.x or v20.x.x
```

### Option 2: Direct Installation

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
# Using Homebrew
brew install node@20
```

**Or download from:**
https://nodejs.org/

### Option 3: Using Package Manager

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nodejs npm
```

**Note:** This might install an older version. Use Option 1 or 2 for latest version.

## Verify Installation

After upgrading, verify:
```bash
node --version  # Should be v16.0.0 or higher
npm --version
```

## Requirements

- **Minimum Node.js version:** 16.0.0
- **Recommended:** 18.x.x or 20.x.x (LTS)

## After Upgrading

1. Remove old node_modules (if exists):
```bash
cd frontend
rm -rf node_modules package-lock.json
```

2. Reinstall dependencies:
```bash
npm install
```

3. Run the start script again:
```bash
cd ..
./start_all_simple.sh
```

