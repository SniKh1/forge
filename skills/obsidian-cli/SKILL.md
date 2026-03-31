---
name: obsidian-cli
description: Interact with a running Obsidian instance from the CLI to read, create, search, and manage notes and vault operations.
---

# Obsidian CLI

Use this when the user wants to automate or inspect an Obsidian vault through the `obsidian` command line interface.

## Good Fit

- Reading or creating notes from the terminal
- Searching vault content
- Updating note properties or tasks
- Plugin and theme development workflows against a live vault

## Guidance

- Assume Obsidian must be running
- Prefer `obsidian help` for the latest command list
- Use explicit `vault=`, `file=`, or `path=` targeting when ambiguity matters
