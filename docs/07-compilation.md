# Compilation

Compilation is the process of walking the idea tree from a starting node and assembling all content into structured output.

## How Compilation Works

When you run `ideaManager compile`, the tool:

1. Reads the current node from the navigation state
2. Walks the tree recursively starting from that node
3. For each node, processes entries in order
4. After entries, recurses into each child
5. Prints the assembled output

## Processing Order

```
For each node:
  1. Print node header ("--- nodeName ---")
  2. Process each entry in order:
     - Text: print content
     - Value reference: find referenced idea, compile it, inline result
  3. Print blank line
  4. Recurse into each child (sorted alphabetically)
```

## Example

Given this tree:

```
root
├── cooking
│   └── pasta
└── programming
```

With content:

**root/content.json:**
```json
{ "entries": [{ "type": "text", "content": "Welcome" }] }
```

**cooking/content.json:**
```json
{ "entries": [{ "type": "text", "content": "I like cooking" }] }
```

**pasta/content.json:**
```json
{ "entries": [{ "type": "text", "content": "Pasta is great" }] }
```

Compiling from "root" produces:

```
--- root ---
  Welcome

--- cooking ---
  I like cooking

--- pasta ---
  Pasta is great

--- programming ---
  (empty)
```

## Value Reference Resolution

When compile encounters a value reference (`parentName + childName`), it:

1. **Checks the child exists** — the idea directory must exist
2. **Checks the direct link** — `parentName/childName.txt` must exist
3. If both checks pass, recursively compiles the child and inlines the result
4. If the direct link is missing but the child exists elsewhere in the parent's subtree, it auto-resolves with a warning
5. If the child is not found anywhere under the parent, it reports an error

## Circular Reference Protection

If a value reference creates a circular dependency (A references B, B references A), compile detects it and skips the duplicate with a notice. The compilation continues normally.

## Exit Behavior

- **Success (exit 0):** All entries processed, no errors
- **Failure (exit 1):** One or more errors occurred (missing references, broken links)
