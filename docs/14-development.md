# Development

## Project Structure

```
commands/
  cli.js                    — CLI entry point (command dispatcher)
  repl.js                   — Interactive REPL
  lib/
    data-path.js            — Resolve idea directory paths
    validate-name.js        — Validate idea name format
    navigate-state.js       — Track the current navigation node
  management/
    new.js                  — Create new ideas (with question flow)
    remove.js               — Delete ideas
    questions.js            — Interactive question asking
    potential.js            — Manage potential ideas
  linking/
    link.js                 — Create parent-child links
    unlink.js               — Remove parent-child links
  browsing/
    list.js                 — List children of an idea
    find.js                 — Search ideas by name
  navigation/
    navigate.js             — Set/view current node
  content/
    content.js              — Content editor entry point
    content-store.js        — Load/save content.json
    content-repl.js         — Interactive content editor REPL
    compile.js              — Recursive tree compilation
    tree-utils.js           — Tree traversal utilities
config/
  questions.json            — Question definitions for new command
docs/                       — Documentation website
data/                       — Idea directories and content files
tests/                      — Test files
```

## Running Tests

```bash
node tests/run-all.js
```

This runs all tests in the `tests/` directory. Tests use temporary directories and clean up after themselves.

### Running a Single Test

```bash
IDEA_TEST_ROOT=/tmp/test-root node tests/content/test-compile.js
```

## Coding Conventions

- Use `function` keyword, no arrow functions
- No regex — use string methods instead
- 2-space indentation
- Constants at the top, then variable initialization, then main functions, then subworkflows
- No external dependencies beyond Node.js built-in modules

## Environment Variables

| Variable | Purpose |
|---|---|
| `IDEA_DATA_DIR` | Override the data directory path |
| `IDEA_STATE_DIR` | Override the state directory path |
| `IDEA_TEST_ROOT` | Test root directory (for test isolation) |
| `IDEA_INDEX_PATH` | Path to the CLI entry point (for tests) |
| `IDEA_REPL_MODE` | Set to `true` to skip interactive prompts |

## Adding a New Command

1. Create a file in the appropriate `commands/` subdirectory
2. The file must export a `run(args)` function returning `{ success: true/false, error: "..." }`
3. Register the command in `commands/cli.js` and `commands/repl.js`
4. Add tests in the `tests/` directory
5. Update `tests/run-all.js` to include the new test
