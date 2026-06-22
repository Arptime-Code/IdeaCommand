# Quick Start

This guide walks you through creating your first idea tree, adding content, and compiling it — all inside the REPL.

> **Why the REPL?** Instead of typing `ideaManager` before every command, you launch the REPL once and just type command names. It's faster and how you'll use IdeaCommand day-to-day.

## Step 1: Launch the REPL

```bash
ideaManager repl
```

You'll see a prompt:

```
idea>
```

All subsequent commands in this guide are typed at the `idea>` prompt — no `ideaManager` prefix needed.

## Step 2: Create a Root Idea

Every tree needs a starting point. Create your root idea:

```
idea> navigate root
```

This sets "root" as your current node and auto-creates the `data/root/` directory so that subsequent `new` commands know where to place new ideas.

## Step 3: Create Ideas

Create your first ideas:

```
idea> new cooking
idea> new programming
```

The `new` command asks three questions about each idea. Answer `y` to all three to confirm each idea belongs under the current node.

## Step 4: Add Sub-Ideas

Navigate to "cooking" and create children:

```
idea> navigate cooking
idea> new pasta
idea> new pizza
```

Your tree now looks like:

```
root
└── cooking
    ├── pasta
    └── pizza
└── programming
```

## Step 5: Add Content

Navigate back to "root" and open the content editor:

```
idea> navigate root
idea> content
```

Select option **1** (Add text entry), type your text, then enter `---` on a new line to finish. Add entries for each idea.

## Step 6: Compile

Generate assembled output from the current node:

```
idea> compile
```

The tool walks the tree from "root", processes all text entries, includes sub-ideas recursively, and prints the assembled result.

## Step 7: Leave the REPL

```
idea> exit
```

## Next Steps

- Read [Core Concepts](04-core-concepts.md) to understand the architecture
- Explore the [CLI Usage](05-cli-usage.md) reference for all commands
- Learn how [Value References](08-value-references.md) enable modular reuse
