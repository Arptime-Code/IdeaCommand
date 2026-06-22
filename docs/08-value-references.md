# Value References

Value references are how ideas reference each other's content. They are the core mechanism for modularity and reuse.

## What Is a Value Reference?

A value reference is an entry in `content.json` that points to another idea:

```json
{
  "type": "value-from-node",
  "parentName": "cooking",
  "childName": "pasta"
}
```

During compilation, the reference is resolved: the idea `pasta` is found, compiled recursively, and its output is inserted in place of the reference.

## Why Parent + Child?

The `parentName` + `childName` pair serves two purposes:

1. **Identification** — The `childName` uniquely identifies the idea directory
2. **Validation** — The `parentName` lets compile verify that the intended relationship still exists

At compile time, the tool checks that `data/parentName/childName.txt` still exists. If the relationship is intact, the reference resolves. If not:

- If the child still exists somewhere deeper under the parent (e.g., you inserted an intermediate node), the reference auto-resolves with a notice
- If the child has moved completely out from under the parent, an error is reported

## Modularity

Value references make content modular. Consider this example:

```
root
├── login-form        ← has boilerplate HTML/CSS as text entries
├── web-app           ← has a VALUE REFERENCE to login-form
├── mobile-app        ← also has a VALUE REFERENCE to login-form
└── desktop-app       ← also has a VALUE REFERENCE to login-form
```

All three apps reference the same `login-form` idea. When you compile any of them, the login form content is included automatically. If you update `login-form`, all three apps pick up the changes.

## Chaining References

Value references can chain through the tree:

```
root
├── api-spec          ← has reference to "endpoints"
├── web-app
│   └── api-spec      ← has reference to "api-spec"
└── mobile-app
    └── api-spec      ← also has reference to "api-spec"
```

When you compile `web-app`, it resolves `api-spec`, which in turn resolves `endpoints`. The full chain is assembled into the output.

## Creating References

Use the content editor:

```bash
ideaManager navigate web-app
ideaManager content
```

Select option 2, then enter the parent and child names:

```
Enter parent idea name: cooking
Enter child idea name: login-form
```

The editor validates that the child is a direct child of the parent before saving the reference.

## Reference Integrity

Since idea names are permanent and never change, a value reference created today will still work years later. The only thing that can break a reference is restructuring the tree — moving the child out from under its parent. When that happens, compile reports an error so you can fix it.
