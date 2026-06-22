# Error Handling

## Common Errors

### No Node Selected

```
No node selected. Use 'ideaManager navigate <name>' first.
```

You tried to run `new`, `content`, or `compile` without first navigating to an idea. Use `navigate` to set the current node.

### Idea Already Exists

```
Idea already exists: pasta
```

An idea with this name already exists. Idea names are unique — you cannot have two ideas with the same name.

### Parent Idea Not Found

```
Parent idea not found: cooking
```

The parent idea you referenced does not exist. Create it first with `new`, or use a different parent.

### Child Not Found Under Parent

```
Error: "pasta" is not a child of "cooking".
```

The child idea exists but is not linked under the specified parent. Use `link` to create the relationship.

## Compilation Errors

### Child Idea Not Found

```
ERROR: In 'root', reference to 'cooking/pasta': child idea "pasta" not found.
```

The referenced idea's directory was deleted. Recreate the idea or remove the reference.

### Child Moved Out of Subtree

```
ERROR: In 'root', reference to 'cooking/pasta': "pasta" is no longer under "cooking".
```

The child was moved to a completely different branch. Update the reference or move the child back.

### Auto-Resolved Reference

```
ERROR: In 'root', reference to 'cooking/pasta': "pasta" was moved deeper under "cooking" (now under "cuisine"). Auto-resolved.
```

The child is still under the parent, but deeper in the tree (e.g., you inserted intermediate nodes). Compile auto-resolved the reference. Check the "Updated references" section in the output.

### Circular Reference

```
[Circular reference skipped: cooking]
```

A value reference created a loop. Compile detected this and skipped the duplicate to prevent infinite recursion.

## Running Without Errors

To check if your tree is healthy, run:

```bash
ideaManager compile
```

If there are errors, they are shown in the "Compilation errors" section. The tool exits with code 1 if any errors occurred.
