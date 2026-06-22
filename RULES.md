# RULES.md — Project Programming Rules

This document defines the rules and conventions for every file written in this project. These rules must be followed strictly unless explicitly overridden by the user.

---

## 1. File Length Limits

- **Complex files:** Maximum **300 lines**.
- **Simple files:** Maximum **150 lines**.
- **Exceeding the limit:** If a feature requires more lines, split it into multiple files and subfeatures.
- **Folder-per-feature:** Create a new folder for the feature, and within that folder place the subfeature files.

## 2. No Arrow Functions (`=>`)

- The `=>` (arrow function) operator is **not allowed** anywhere in the code.
- Use `function` declarations or `function` expressions instead.

## 3. No Regular Expressions

- **Regular expressions are not allowed** anywhere in the code.
- String parsing, validation, and pattern matching must be done with plain string methods (e.g., `.includes()`, `.startsWith()`, `.split()`, character-by-character loops).

## 4. Code Simplicity

- Write the simplest possible code that works correctly.
- Prioritize readability and clarity over cleverness or brevity.
- Avoid premature optimization.
- Every function should do one thing and do it well.

## 5. Nesting Limit

- **Maximum nesting depth: 4 levels.**
- Strive for even less nesting when possible.
- Flatten deeply nested code by:
  - Extracting logic into separate functions.
  - Using early returns / guard clauses.
  - Inverting conditions to reduce `if` nesting.

## 6. File Structure (Top to Bottom)

Every source file must follow this order:

1. **Constants** — Values that never change (e.g., configuration defaults, magic numbers).
2. **Variable Initialization** — Stateful values that are set up at the start.
3. **Main Workflow Function** — The primary entry-point function of the file that orchestrates the subworkflows.
4. **Subworkflow Functions** — All helper functions called by the main workflow, listed below it.

```
// 1. Constants
var MAX_ITEMS = 100;

// 2. Variable initialization
var items = [];

// 3. Main workflow function
function processItems(input) {
  // orchestrates subworkflows
  var valid = validateInput(input);
  if (!valid) {
    return;
  }
  var parsed = parseInput(input);
  addItems(parsed);
}

// 4. Subworkflow functions
function validateInput(input) { ... }
function parseInput(input) { ... }
function addItems(parsed) { ... }
```

## 7. Code Comments

- Keep comments **short and in bullet-point style**.
- No long sentences or descriptive paragraphs.
- Place comments above the relevant code block.
- A few targeted comments per file — not too many, not too few.

Example:
```
// Check that the value is positive
// Return early if invalid
```

## 8. Vanilla Code First — No External Packages Without Asking

- Use vanilla/standard library code as much as possible.
- Before adding an external package, **ask the user for permission and explain:**
  - What the package does.
  - Why it massively simplifies the code.
  - That it has no downsides.
- If the user declines, implement the feature with vanilla code.
- If the user accepts, install the package using the standard package manager (never globally).

## 9. Testing — Every Single Code Path Must Be Tested

- **Write the test before implementing the feature.**
- Tests go in a dedicated `tests/` folder at the project root.
- Subfolder structure inside `tests/` mirrors the source structure (max 5 files/folders per level).
- One central test runner script (`tests/run-all.js`) that executes all tests programmatically.
- All tests must be runnable with a single command.
- **Every function, every endpoint, every error path, every edge case must be tested.**
- This includes:
  - All API endpoints (with valid params, missing params, invalid params).
  - All CRUD operations (create, read, update, delete).
  - All error states (non-existent nodes, duplicate names, empty data).
  - All edge cases (cycles, deep nesting, renaming to existing name).
  - Static file serving (root, existing files, missing files).
- If a test fails or was never written for a part of the code, that part of the code must be fixed or the test must be added before proceeding.
- No untested code paths are allowed.

## 10. File and Folder Structure (Max 5 per Folder)

- **Maximum 5 files or subfolders** inside any single folder.
- If a folder needs more than 5 items, create subfolders to group them.
- This number can be stretched slightly, but not by much.
- Keep the structure shallow and clean.

## 11. JSON Configuration Files

- If there are constants or settings that might later need to be changed or configured, **extract them into a separate `.json` file**.
- This makes it easy to edit configuration without touching the code.
- Place JSON config files in a `config/` folder or alongside the relevant feature folder.

## 12. Documentation

- A `docs/` folder at the project root contains `.md` documentation for all features.
- Write documentation **while creating the feature**, not after.
- Document what each feature does, its file structure, and any important design decisions.
- Keep documentation concise and useful.

## 13. Modularity and Minimal Changes

- Write **modular** code: each function and file should have a single responsibility.
- When modifying existing code, make the **minimum change** necessary to accomplish the goal.
- Reuse existing functions and patterns rather than duplicating code.
- When editing, analyze the surrounding code and tests first.

## 14. Naming Conventions

- **Folders:** `kebab-case` (all lowercase, hyphen-separated).
- **Files:** `kebab-case` (all lowercase, hyphen-separated).
- **Variables:** `camelCase` (starts lowercase, each new word capitalized).
- **Functions:** `camelCase` (starts lowercase, each new word capitalized).
- **Classes / Constructors:** `PascalCase` (starts uppercase, each word capitalized).
- **Constants (truly immutable):** `UPPER_SNAKE_CASE` (all caps, underscore-separated).
- **No single-letter names** except for loop counters in trivial loops.
- Names must be descriptive and reveal intent (e.g., `getUserData` not `getStuff`, `userList` not `arr`).

## 15. Code Style

- Use consistent indentation (2 spaces).
- No trailing whitespace.
- End files with a single newline.
- Format code nicely for readability.

## 16. Dependency Direction — No Circular Dependencies

- Higher-level functions and files may call lower-level ones, but not the other way around.
- No circular dependencies between files (file A imports from file B, while file B imports from file A).
- If two features depend on each other, extract the shared logic into a separate module that both can call.
- Structure the code in layers: each layer only depends on layers below it.

## 17. No Global Mutable State

- **Avoid global mutable state.**
- Pass data explicitly through function parameters instead of storing it in global variables.
- If state needs to be shared across many functions, pass it as a single structured object (e.g., a context or state object).
- The only exception is truly immutable constants (defined at the top of a file).
