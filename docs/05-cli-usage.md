# CLI Usage

## Overview

The `ideaManager` command is the entry point. Use it with a subcommand:

```bash
ideaManager <command> [arguments...]
```

## REPL Mode (Recommended)

For everyday use, launch the interactive REPL instead of typing `ideaManager` each time:

```bash
ideaManager repl
```

Once inside, type commands directly at the `idea>` prompt. Type `exit` or `quit` to leave.

```
idea> navigate root
idea> new cooking
idea> content
idea> compile
idea> exit
```

The REPL is the recommended way to use IdeaCommand — it's faster, keeps state between commands, and makes the whole experience feel fluid. All examples in the other docs assume you are in the REPL.

## Commands

### `new <name>`

Creates a new idea under the currently navigated node.

```bash
ideaManager navigate cooking
ideaManager new pasta
```

The command asks three questions about the new idea:

| Question | If No |
|---|---|
| Is it just a concept/value? | Stops, nothing created |
| Is it directly part of the parent? | Saves as potential idea |
| Can it only be under this parent? | Saves as potential idea |

Answer `y` to all three to confirm and create the idea with a link to its parent.

### `remove <name>`

Deletes an idea directory and all its content. Children are not recursively deleted — their link files are removed from the deleted parent's directory.

```bash
ideaManager remove pasta
```

### `link <parent> <child>`

Creates a parent-child relationship link.

```bash
ideaManager link cooking pasta
```

This allows an idea to have multiple parents — the child's directory already exists and is now linked under the specified parent.

### `unlink <parent> <child>`

Removes a parent-child relationship link without deleting the child idea.

```bash
ideaManager unlink cooking pasta
```

### `list <name>`

Lists all direct children of an idea.

```bash
ideaManager list cooking
```

### `find <query>`

Searches for ideas by name.

```bash
ideaManager find pasta
```

### `navigate <name>`

Sets the current node. Subsequent `new` commands use this as the parent.

```bash
ideaManager navigate cooking
```

Run without arguments to see the current node.

### `potential <list|remove> [name]`

Manages potential ideas — ideas that were rejected during the `new` command flow.

```bash
ideaManager potential list
ideaManager potential remove pasta
```

### `content`

Opens the interactive content editor for the currently navigated node.

```bash
ideaManager navigate cooking
ideaManager content
```

Menu options:

1. **Add text entry** — Multi-line text, finish with `---` on its own line
2. **Add value reference** — Specify parent and child names to reference their content
3. **Edit existing entries** — List, edit, or delete entries by index
4. **Exit** — Leave the editor

### `compile`

Compiles assembled output starting from the currently navigated node. Processes entries in order, then recurses into children.

```bash
ideaManager navigate root
ideaManager compile
```

### `repl`

Starts an interactive REPL session where you can run multiple commands without spawning a new process each time.

```bash
ideaManager repl
```

## Exit Codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | General error (missing arguments, idea not found, etc.) |

## PATH

If you installed via npm, the `ideaManager` command is available globally. Otherwise, run it from the project directory:

```bash
node commands/cli.js <command> [arguments...]
```
