# The New Command

The `new` command creates ideas and places them in the tree.

## Basic Usage

```bash
ideaManager navigate cooking
ideaManager new pasta
```

This creates a new idea "pasta" under the current node "cooking".

## The Question Flow

When you run `new` with a current node set, it asks three questions:

```
Name: pasta
Parent: cooking

Is "pasta" just a concept or idea and not a value? (y/n): y
Is "pasta" part of "cooking" directly and not in a branch next to it? (y/n): y
Can "pasta" logically only be part of "cooking" and not a sub-idea of another sub-idea under "cooking"? (y/n): y
```

### Question 1: Concept or Value?

This asks whether the idea contains actual content (a value) or is just a grouping concept.

- **Yes** → Continue to next question
- **No** → The process stops. Nothing is created.

### Question 2: Direct Child?

This asks whether the new idea should be a direct child of the current parent, or a branch next to it.

- **Yes** → Continue to next question
- **No** → Saved as a potential idea for later

### Question 3: Logically Only Here?

This asks whether the idea could only belong under this specific parent.

- **Yes** → Create the idea with a link under the parent
- **No** → Saved as a potential idea for later

## After All Yes

If you answer yes to all three questions, the idea is created:

```
Created idea: pasta under cooking
```

The system creates the idea directory and the link file.

## REPL Mode

In the REPL, questions are skipped and ideas are created immediately. This is because the REPL has its own readline that would conflict with the question prompts.

## Prerequisites

You must have a current node set (via `navigate`) before running `new`. If no node is set, the command returns an error:

```
No node selected. Use 'ideaManager navigate <name>' first to select a parent idea.
```
