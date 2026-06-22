# Glossary

### Compilation
The process of walking the idea tree from a starting node and assembling all content into structured output. Entries are processed in order, then children are recursed into.

### Content Entry
A single item in an idea's `content.json`. Can be a text block or a value reference to another idea.

### Content Editor
An interactive REPL launched by `ideaManager content` that lets you add, edit, and delete content entries.

### Current Node
The idea currently selected via `navigate`. Used as the default parent for `new` and as the starting point for `content` and `compile`.

### Idea
A node in the tree. Represented as a directory in `data/` with a unique name.

### Link
A parent-child relationship between two ideas. Stored as an empty `.txt` file in the parent's directory.

### Navigation
Setting and viewing the current node. Determines where new ideas are placed and where compilation starts.

### Parent
An idea that has another idea linked as its child. An idea can have multiple parents.

### Potential Idea
An idea name saved for later consideration. Created when the `new` command's questions result in a "no" answer for certain questions.

### REPL
The interactive shell launched by `ideaManager repl`. Allows running multiple commands in a single session.

### Subtree
A parent idea and all its descendants (children, grandchildren, etc.).

### Value Reference
A content entry that references another idea's content. Stored as `type: "value-from-node"` with `parentName` and `childName`.

### Tree
The full hierarchy of ideas connected by parent-child relationships. Starts from the root idea (or roots).
