# Core Concepts

## The Idea Tree

IdeaCommand organizes knowledge as a **tree of ideas**. Each idea is a node in the tree, with a parent (except the root) and zero or more children.

```
root
├── cooking
│   ├── pasta
│   └── pizza
├── programming
│   └── javascript
└── design
    └── typography
```

## How Ideas Are Stored

On disk, each idea is a **directory** inside `data/`. Parent-child relationships are stored as **empty `.txt` files** inside the parent's directory.

```
data/
  root/
    cooking.txt       ← "cooking is a child of root"
    programming.txt   ← "programming is a child of root"
    content.json      ← root's content entries
  cooking/
    pasta.txt         ← "pasta is a child of cooking"
    pizza.txt         ← "pizza is a child of cooking"
    content.json
  pasta/
    content.json
```

### Key Properties

- **Names are unique.** Every idea has a unique directory name. You cannot create two ideas with the same name.
- **Names are permanent.** Ideas are never renamed. This makes references between ideas stable.
- **Multiple parents.** An idea can be a child of multiple parents simultaneously. This enables cross-branch reuse.

## Content Entries

Each idea can have a `content.json` file containing an ordered list of **entries**. There are two types:

### Text Entries

```json
{ "type": "text", "content": "Your text here..." }
```

Plain text that gets printed verbatim during compilation.

### Value References

```json
{ "type": "value-from-node", "parentName": "cooking", "childName": "pasta" }
```

A reference to another idea's content. During compilation, the referenced idea is found, its content is compiled recursively, and the result is inserted at this position.

## Navigation State

The "current node" is tracked in `.current-node.json`. Commands like `new` use the current node as the default parent. The `navigate` command sets the current node.

## Compilation

Compilation is the process of walking the tree from a starting node and assembling output:

1. Process each entry **in order** (text entries printed, value references resolved and inlined)
2. After entries, recurse into each **child**
3. Repeat until the entire subtree is processed

## Modularity Through References

Value references are the key to modularity. An idea's content can reference another idea anywhere in the tree. This allows:

- **Cross-branch reuse** — An idea in one part of the tree uses content from another branch
- **Single source of truth** — Content lives in one place, referenced from many
- **Composable output** — References can chain: A references B, B references C, compile resolves all
