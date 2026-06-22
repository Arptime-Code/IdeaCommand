# Architecture

## Overview

IdeaCommand uses a flat file storage model with no database. Everything is stored as files and directories on disk, making it transparent and easy to inspect.

## Storage Model

```
<data-dir>/
  <idea-name>/
    <child-name>.txt    ← empty link files
    content.json        ← content entries
```

The data directory defaults to `./data/` relative to the project root, or `$IDEA_DATA_DIR` if set.

## State Model

A single file tracks the current navigation node:

```
<state-dir>/.current-node.json
{"currentNode": "cooking"}
```

The state directory defaults to the project root, or `$IDEA_STATE_DIR` if set.

## Command Flow

Each command module exports a `run(args)` function that returns `{ success: true/false, error: "..." }`.

```
CLI → cli.js dispatches to command module → run() → result → exit(0) or exit(1)
REPL → dispatches same way → prints error if any → shows prompt again
```

## Content Flow

```
content editor → content-repl.js → content-store.js → content.json
compile       → compile.js → content-store.js → content.json
                            → tree-utils.js    → link files
```

## Reference Resolution

When compile encounters a value reference (`parentName`, `childName`):

1. Check `data/childName/` exists → error if not
2. Check `data/parentName/childName.txt` exists (direct link)
3. If direct link exists → compile childName recursively
4. If direct link missing → search parent's full subtree for childName
5. If found deeper → auto-resolve with notice
6. If not found at all → error

## Key Design Decisions

- **No database** — Everything is plain files for transparency and version control
- **No external dependencies** — Built entirely on Node.js built-in modules (fs, path, readline)
- **Names are permanent** — Never rename ideas, keeping references stable
- **Direct link validation** — References validate the exact link, not an ancestor path, avoiding ambiguity from multiple parents
- **Auto-heal on intermediate inserts** — If you insert levels, references auto-resolve
- **Circular reference detection** — Visited set prevents infinite loops
