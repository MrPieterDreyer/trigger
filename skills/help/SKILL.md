---
name: help
description: Show available Trigger commands and their descriptions.
---

# Help

When the user says **trigger help** or **what can trigger do**:

**Getting started:**
- *trigger new project* — initialize a Trigger project with config, team, and planning docs
- *trigger status* / *trigger progress* — current position and next step

**Planning:**
- *trigger plan phase N* — research, task breakdown, review, and approval for phase N

**Building:**
- *trigger execute phase N* / *trigger build phase N* — full build-review pipeline for all tasks in a phase
- *trigger build task N* / *trigger execute task N* — single task pipeline
- *trigger quick fix* / *trigger quick task* — informal fix outside the pipeline

**Reviews:**
- *trigger review* / *trigger review this* — ad-hoc review of current changes
- *trigger sign off* / *approve this* — approve or request changes on the current task

**Session:**
- *trigger pause* / *save progress* — save state for later resumption
- *trigger resume* / *continue work* — restore context and pick up where you left off

**Configuration:**
- *trigger settings* — interactive config editor (trust, team, parallelism, verification)
- *trigger config* — view current config JSON

**Tooling:**
- *trigger research skills* — discover and recommend Agent Skills for this project

Full documentation: the plugin's `README.md` and `rules/trigger-core.mdc`.
