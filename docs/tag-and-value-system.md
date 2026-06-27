# Derived Tag System & Tag-Based Value References

## Tags

Tags are **automatically derived from the tree structure** — no `tag.txt` files, no manual input.

An idea's **tags** = the names of all of its **direct parents** (directories that contain `<idea>.json`).

This means:
- No tag to input when creating an idea
- No `tag` command to edit tags
- Tags are always consistent with the actual tree structure
- Adding a new parent (via `new`) automatically adds a tag

### Root node

The root node (`root`) is special — it has no parents, so it has no derived tags. By convention, you can reference the root by its own name `"root"` for verification purposes.

### Example

```
data/
  root/
    cooking.json      ← cooking is a child of root
    gardening.json    ← gardening is a child of root
  cooking/
    sauce.json        ← sauce is a child of cooking
    knife.json        ← knife is a child of cooking
  gardening/
    sauce.json        ← sauce is also a child of gardening (same name!)
    shovel.json       ← shovel is a child of gardening
```

| Idea | Tags (= its parent names) |
|---|---|
| `cooking` | `[root]` |
| `gardening` | `[root]` |
| `sauce` | `[cooking, gardening]` |
| `knife` | `[cooking]` |
| `shovel` | `[gardening]` |

Notice `sauce` has TWO tags because it appears under two different parents.

---

## Tag-Based Value References

Values use a **relative tag path** to reference other nodes:

```json
{
  "type": "value-from-node",
  "path": [
    { "direction": "up", "tag": "root" },
    { "direction": "down", "tag": "content-dir" }
  ]
}
```

### How `{down, tag}` works

Under a parent, the system finds children whose **tags include the specified value**. It then ensures **exactly one** child matches (tags must be unique among siblings to be usable).

Only **unique tags** (tags that appear on exactly one child under the current parent) are shown as selectable in the navigator.

If a child has no unique tag, it simply cannot be referenced by `{down}` — you'd need to add a distinguishing parent to make it referenceable.

### How `{up, tag}` works

Go up **exactly one level** to the known parent (from compile context). Check if the parent's **tags** include the specified value.

This is a **verification step**: `{up, "root"}` verifies that the parent is itself a child of `root`. Since the compile context knows exactly which parent instance we're under, there's no ambiguity.

### Building a path

In the content editor, select "Add value-from-node entry" and navigate:
- `up` — see parents, pick one by name
- `down` — see children with their unique tags, pick by tag
- Type a tag directly to select a child, or a parent name to go up
- `stop` — save path
- `back` — undo last step

### Resolution at compile time

The path is resolved **relative to the node being compiled**:

- `up` — verify the known parent's tags include the stored tag. If not, error.
- `down` — find a child of the current node whose tags uniquely include the specified tag.

Same path, different tree position → different result. Tags derived from parent names decouple the reference from idea names, making it truly modular.

### Modularity example

```
root/
  test/
    test345/         ← tags: [test, test22]
    testContent/     ← tags: [test, test22, content-dir]
  test22/
    test345/         ← tags: [test, test22]
    testContent/     ← tags: [test, test22, content-dir]
  content-dir/
    testContent/     ← extra parent gives testContent a unique tag
```

Both `test345` entries contain the same value path:
`[{up, "root"}, {down, "content-dir"}]`

| Compile from | Up verifies... | Down selects... | Output |
|---|---|---|---|
| `test` | `test` is child of `root` ✓ | `testContent` by tag "content-dir" | "TEST branch content" |
| `test22` | `test22` is child of `root` ✓ | `testContent` by tag "content-dir" | "TEST22 branch content" |

Same path. Different tree. Different output. Modularity achieved through derived tags.
