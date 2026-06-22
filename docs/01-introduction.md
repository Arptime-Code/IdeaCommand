# IdeaCommand

**IdeaCommand** is a hierarchical knowledge management tool for the command line. It lets you organize ideas into a tree structure, add content to each idea, and compile everything into assembled text output.

Unlike flat note-taking or mind-mapping tools, IdeaCommand treats ideas as nodes in a tree where each node can hold structured content and reference other nodes. This makes it ideal for:

- **Knowledge bases** — Organize what you know into a navigable tree
- **Modular writing** — Write content in small, reusable pieces and assemble them
- **Code generation** — Define code snippets and compose them across ideas
- **Document assembly** — Build documents from reusable components
- **Project planning** — Break down projects hierarchically with rich notes

## Philosophy

- **Ideas are permanent.** Names never change, so references between ideas are stable.
- **Structure is flexible.** You can restructure the tree, insert intermediate levels, and move nodes — references adapt.
- **Content is ordered.** Each idea's content is an ordered list of entries, giving you full control over assembly order.
- **Modular by design.** Any idea can reference any other idea's content, enabling true reuse across branches.

## How It Works

```
data/
  root/              ← each idea = a directory
    cooking.txt      ← link files define parent-child relationships
    programming.txt
    content.json     ← ordered entries for this idea
  cooking/
    pasta.txt        ← "pasta is a child of cooking"
    content.json
  pasta/
    content.json
```

Three core operations:

1. **Navigate** — Set an idea as your current node
2. **Create content** — Add text entries or value references to an idea's `content.json`
3. **Compile** — Walk the tree from the current node, process entries in order, and output assembled text

## Interactive Mode (REPL)

Rather than typing `ideaManager <command>` every time, you can launch an interactive REPL:

```bash
ideaManager repl
```

Inside the REPL, you just type the command name without the `ideaManager` prefix. It's faster, more fluid, and the recommended way to use IdeaCommand day-to-day.

```
idea> navigate root
idea> new cooking
idea> content
```

All examples in the documentation use the REPL because it makes life easier. See the [Quick Start](03-quick-start.md) to try it.

## Next Steps

Continue to [Installation](02-installation.md) to set up IdeaCommand, or jump to [Quick Start](03-quick-start.md) for a 5-minute tutorial.
