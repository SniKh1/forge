---
name: prompt-master
description: Route prompt-related tasks to the right prompt skill, especially when the user needs a higher-level prompt workflow coordinator.
---

# Prompt Master

Use this as a wrapper when the task is broadly prompt-system work and it is not yet clear whether generation, analysis, learning, or comparison is the main job.

## Routing Guidance

- Use `intelligent-prompt-generator` for new prompt creation
- Use `prompt-analyzer` for inspecting existing prompts
- Use `universal-learner` for extracting reusable prompt patterns

Prefer the more specific downstream skill whenever the task becomes clear.
