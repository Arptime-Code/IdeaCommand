# Roadmap

Planned improvements and features for IdeaCommand.

---

- **Redo the whole experience into one workflow with fewer commands** — Streamline the CLI into a cohesive, guided workflow that reduces the number of separate commands and makes the flow feel more like a single session rather than discrete tool calls.

- **Add naming convention control and questions** — Allow users to define and enforce naming conventions (e.g., lowercase, hyphenated, prefixed), and prompt with questions to help name ideas consistently.

- **Better questions and more ways to define ideas** — Expand the question system to better qualify and define ideas during creation, covering aspects like scope, type, status, and relationships.

- **Improved searching and faster workflows** — Enhance the fuzzy search with better ranking, filtering by attributes, searching by parent/child relationships, and faster overall navigation through shortcuts and predictive suggestions.

- **Combine find with the new command** — When creating a new idea, first search to check if it already exists, offering to navigate or link instead of creating a duplicate.

- **Add help command to the REPL** — Add a `help` command inside the REPL that lists all available commands with short descriptions, so users don't need to remember or look them up externally.

- **Add tab completion to the REPL** — Implement tab-based auto-completion for commands and idea names inside the REPL to speed up navigation and reduce typing errors.

- **Insert a parent in between existing nodes** — Add a command (e.g., `insert`) to place a new parent node between a child and its current parent without needing to unlink and re-link. For example, `insert ParentName between ChildName` would create ParentName and make it the new parent of ChildName, then link the new ParentName under the original parent.

- **Improve navigation** — Make moving between ideas smoother with features like parent/up navigation, breadcrumb trails, quick jumps between siblings and related ideas, and better visual context of where you are in the tree.



- **Define the boundary between a value and an idea** — Question: "Is this an idea or a value?" Proposed answer: An idea's identity is constituted **from the outside in** — its relations make it what it is. A value's identity is constituted **from the inside out** — its content makes it what it is, and its relations are merely instrumental.
