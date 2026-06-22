# Potential Ideas

When creating a new idea with `new`, the tool asks three questions. If you answer "no" to certain questions, the idea is saved as a "potential" idea instead of being created.

## How Potentials Work

Potential ideas are stored in `potential-ideas.json` at the project root:

```json
{
  "ideas": ["pasta", "pizza", "javascript"]
}
```

They are just names — no directories, no content, no tree position.

## Commands

### List Potential Ideas

```bash
ideaManager potential list
```

Shows all saved potential idea names.

### Remove a Potential Idea

```bash
ideaManager potential remove <name>
```

Removes an idea from the potential list.

## When Ideas Become Potential

During `new`, the questions determine what happens:

| Question | Answer No → |
|---|---|
| "Is it just a concept/value?" | Process stops, nothing saved |
| "Is it directly part of the parent?" | Saved as potential |
| "Can it logically only be here?" | Saved as potential |

Saving as potential is like putting an idea on a to-do list. Later, when you find the right place for it, you can create it with the correct parent.
