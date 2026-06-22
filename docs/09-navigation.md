# Navigation

Navigation lets you set a "current node" that subsequent commands use as a reference point.

## How It Works

The current node is stored in `.current-node.json` in your project root (or in `IDEA_STATE_DIR` if set). This file contains just the name of the current idea.

## Commands

### View Current Node

```bash
ideaManager navigate
```

Output: `Current node: cooking` or `No node selected.`

### Set Current Node

```bash
ideaManager navigate cooking
```

This sets "cooking" as the current node and saves it to the state file.

## How Navigation Affects Other Commands

| Command | Effect of Navigation |
|---|---|
| `new` | Creates new idea under the current node |
| `content` | Opens the content editor for the current node |
| `compile` | Starts compilation from the current node |

## Example Workflow

```bash
# Start at the root
ideaManager navigate root

# Create ideas under root
ideaManager new cooking
ideaManager new programming

# Move into cooking
ideaManager navigate cooking

# Create sub-ideas
ideaManager new pasta
ideaManager new pizza

# Add content to cooking
ideaManager content

# Compile from cooking
ideaManager compile
```

## REPL Navigation

In the REPL, navigation works the same way:

```
idea> navigate root
Navigated to: root
idea> new cooking
Created idea: cooking under root
idea> navigate cooking
Navigated to: cooking
idea> new pasta
Created idea: pasta under cooking
```
