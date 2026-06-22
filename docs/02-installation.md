# Installation

## Prerequisites

- **Node.js** version 12 or later
- **npm** (usually included with Node.js)

## Install via npm

```bash
npm install -g idea-command
```

After installation, the `ideaManager` command will be available globally:

```bash
ideaManager --help
```

## Manual Install

Clone the repository and link the command manually:

```bash
git clone https://github.com/yourusername/idea-manager.git
cd idea-manager
npm link
```

This creates a global symlink so you can use `ideaManager` from any directory.

## Running Without Install

You can also run the tool directly from the project directory without a global install:

```bash
node commands/cli.js --help
```

## Verify Installation

Run a quick command to verify everything works:

```bash
ideaManager navigate root
```

If you see `No node selected.`, the tool is installed correctly — the command is working but no idea tree exists yet.

## What Gets Installed

- `ideaManager` — The main CLI tool
- A `data/` directory in your project root where all ideas are stored
- No databases, no daemons, no background services

## Next Steps

Continue to [Quick Start](03-quick-start.md) to create your first idea tree.
