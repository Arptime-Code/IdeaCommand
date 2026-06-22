# Linking Ideas

Linking creates parent-child relationships between ideas, forming the tree structure.

## How Links Work

Links are stored as empty `.txt` files inside the parent's directory. The filename is the child's name.

```
data/cooking/
  pasta.txt    ← this file means "pasta is a child of cooking"
  pizza.txt    ← "pizza is a child of cooking"
  content.json
```

## Commands

### Link

```bash
ideaManager link <parent> <child>
```

Creates a child link file in the parent's directory.

```bash
ideaManager link cooking pasta
```

**Requirements:**
- Both ideas must already exist (created with `new`)
- The parent must have a directory
- The link must not already exist

### Unlink

```bash
ideaManager unlink <parent> <child>
```

Removes the link file without deleting the child idea.

```bash
ideaManager unlink cooking pasta
```

This does NOT:
- Delete the child's directory
- Delete the child's content
- Remove links to other parents

## Multiple Parents

An idea can have multiple parents. For example:

```bash
ideaManager link cooking pasta
ideaManager link italian pasta
ideaManager link store-bought pasta
```

Now `pasta` is a child of three different parents. The idea directory `data/pasta/` and its content exist only once, but it appears under all three parents in the tree.

This enables flexible classification and cross-branch references.

## Linking vs. New

- `new` creates an idea AND links it under the current node (in one step)
- `link` connects an EXISTING idea to a new parent
- `unlink` removes a connection without deleting the idea

## Viewing Children

```bash
ideaManager list cooking
```

Lists all `.txt` files in the parent's directory, showing each child name.
