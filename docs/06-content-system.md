# Content System

The content system is how you attach structured, ordered content to each idea in your tree.

## Content File

Each idea's content lives in `content.json` inside its directory:

```
data/cooking/
  content.json    ← ordered entries for this idea
  pasta.txt       ← link to child
  pizza.txt       ← link to child
```

## File Format

```json
{
  "entries": [
    {
      "type": "text",
      "content": "Some text content..."
    },
    {
      "type": "value-from-node",
      "parentName": "cooking",
      "childName": "pasta"
    }
  ]
}
```

## Entry Types

### Text

A plain text block. Printed verbatim during compilation.

```json
{
  "type": "text",
  "content": "Free-form text here.\nCan span multiple lines."
}
```

### Value Reference

A reference to another idea's content. During compilation, the referenced idea is found, its content is compiled recursively, and the result is inserted at this position.

```json
{
  "type": "value-from-node",
  "parentName": "cooking",
  "childName": "pasta"
}
```

The `parentName` and `childName` together identify which idea to compile. During compilation, IdeaCommand checks that:

1. The child idea directory exists
2. The direct parent-child link still exists in the tree

## The Content Editor

Use `ideaManager content` to enter the interactive content editor. This readline-based REPL lets you:

### Adding Text Entries

Select option 1, type your text line by line, and finish with `---` on its own line:

```
> This is the first line of my text.
> This is the second line.
> ---
```

### Adding Value References

Select option 2, then provide the parent and child names:

```
Enter parent idea name: cooking
Enter child idea name: pasta
```

The editor validates that the child exists and is a direct child of the parent before saving.

### Editing Entries

Select option 3 to list all entries. You can:

- Enter an index to edit that entry
- Enter `d<index>` to delete an entry (e.g., `d0` deletes entry 0)
- Press Enter to go back to the menu

## Entry Order

The order of entries in the `entries` array determines the compilation order. Text entries are printed in sequence. Value references are resolved and inlined in place. After all entries are processed, the node's children are compiled recursively.
