---
name: research-skills
description: Discover and recommend existing Agent Skills from the skills.sh ecosystem for the current project. Produces .trigger/tooling/skills-recommendations.md.
---

# Research Skills

Use when the user says **trigger research skills**, **recommend skills**, **find skills**, or **what skills should I use**.

**Core principle:** Discover existing skills FIRST. Only suggest creating custom skills as a last resort.

## Process

### Step 1: Gather project context

1. Read `.trigger/PROJECT.md` for goals, domain, and product type.
2. Read `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `Gemfile`, `*.csproj`, or equivalent manifest to identify stack, frameworks, and dependencies.
3. Check for already-installed skills in these locations (skip if not readable):
   - `.cursor/skills/`
   - `~/.cursor/skills/`
   - `.skills/`
4. If `.trigger/PROJECT.md` doesn't exist, infer context from manifests and ask the user to briefly describe the project.

### Step 2: Search the skills.sh ecosystem

Run targeted `npx skills find` queries based on the detected stack. Run **multiple searches** to cover different angles:

**By framework** (pick what matches the project):
```bash
npx skills find react
npx skills find nextjs
npx skills find vue
npx skills find python
npx skills find django
npx skills find rails
```

**By domain:**
```bash
npx skills find testing
npx skills find deployment
npx skills find design
npx skills find auth
npx skills find database
```

**By workflow (universal — consider for every project):**
```bash
npx skills find debugging
npx skills find code-review
npx skills find performance
```

Also fetch the skills.sh leaderboard for trending skills:
```
WebFetch("https://skills.sh/")
```

And search for niche skills not in the main directory:
```
WebSearch("agent skills [framework] [domain] site:github.com")
```

### Step 3: Evaluate and score

For each discovered skill, evaluate fit against the project:

1. **Direct stack match** — React project gets React skills, Python project gets Python skills. Highest priority.
2. **Workflow match** — Skills that improve any project: debugging, planning, TDD, code review. High priority.
3. **Quality signals** — Install count, well-known maintainer (Vercel, Anthropic, Supabase, Expo). Tiebreaker.

Discard skills that don't match the project's stack or needs. Aim for 5-15 high-fit recommendations.

### Step 4: Write recommendations

Ensure `.trigger/tooling/` directory exists. Write `.trigger/tooling/skills-recommendations.md` with this structure:

```markdown
# Skills Recommendations

**Project:** [one-line context]
**Stack:** [key technologies]
**Generated:** [date]

## How to Install Skills

\```bash
# Install a specific skill
npx skills add <owner/repo> --skill <skill-name>

# Install globally (available in all projects)
npx skills add <owner/repo> --skill <skill-name> -g -y

# Search for more skills
npx skills find [query]

# Browse the directory: https://skills.sh/
\```

## Recommended Skills (Existing)

### High Priority

| # | Skill | Repository | Install Command | Why for this project |
|---|-------|-----------|-----------------|----------------------|
| 1 | [name] | [owner/repo] | `npx skills add [owner/repo] --skill [name]` | [one-line fit] |

### Nice to Have

| # | Skill | Repository | Install Command | Why for this project |
|---|-------|-----------|-----------------|----------------------|
| 1 | [name] | [owner/repo] | `npx skills add [owner/repo] --skill [name]` | [one-line fit] |

## Quick Install (All High Priority)

\```bash
[one command per skill, ready to copy-paste]
\```

## Custom Skills to Create

[Only if no existing skill covers a clear project need]

| Skill Idea | What it would do | Why no existing skill fits |
|-----------|-----------------|--------------------------|
| [name] | [description] | [gap explanation] |

## Already Installed

[List any skills already present in the project or user-level config]

## Notes

[Optional: tips on global vs local install, skill update schedule, etc.]
```

### Step 5: Present to user

Summarize the top 3-5 recommendations inline. Ask if they want to install any using `AskQuestion`:

```
AskQuestion(questions=[
  {
    id: "install_skills",
    prompt: "Which recommended skills would you like to install now?",
    options: [
      { id: "all_high", label: "Install all high-priority skills" },
      { id: "pick", label: "Let me pick specific ones" },
      { id: "none", label: "None for now — I'll review the recommendations file first" }
    ]
  }
])
```

If "all_high" or "pick", run the `npx skills add` commands for the selected skills.

## Skills.sh Ecosystem Reference

**Registry:** https://skills.sh/ — The open agent skills directory with leaderboard and search.

**CLI commands:**
- `npx skills find [query]` — Search for skills by keyword
- `npx skills add <owner/repo>` — Install a skill from GitHub
- `npx skills add <owner/repo> --skill <skill-name>` — Install a specific skill from a multi-skill repo
- `npx skills add <owner/repo> -g -y` — Install globally, skip confirmation
- `npx skills check` — Check for skill updates
- `npx skills update` — Update all installed skills

**Well-known skill repositories:**

| Repository | Focus Area |
|-----------|------------|
| `vercel-labs/skills` | find-skills (meta), web design guidelines |
| `vercel-labs/agent-skills` | React best practices, composition patterns, React Native |
| `vercel-labs/next-skills` | Next.js app router, caching, upgrades |
| `anthropics/skills` | frontend-design, skill-creator, PDF/DOCX/XLSX, webapp-testing, MCP builder |
| `obra/superpowers` | systematic-debugging, writing-plans, executing-plans, TDD, code-review, git worktrees |
| `supabase/agent-skills` | Supabase + Postgres best practices |
| `expo/skills` | React Native / Expo: native UI, data fetching, deployment, CI/CD |
| `antfu/skills` | Vite, Vue, Vitest, UnoCSS, Nuxt, pnpm, VitePress, Slidev |
| `wshobson/agents` | Tailwind, TypeScript types, API design, Python performance, Node.js backend, architecture |
| `coreyhaines31/marketingskills` | SEO, copywriting, marketing psychology, content strategy |
| `better-auth/skills` | Auth best practices and implementation |
| `google-labs-code/stitch-skills` | React components, design-md, enhance-prompt |
| `callstackincubator/agent-skills` | React Native best practices |
| `giuseppe-trisciuoglio/developer-kit` | shadcn-ui |
| `vuejs-ai/skills` | Vue best practices, Pinia, Vue Router |
| `browser-use/browser-use` | Browser automation |
| `firecrawl/cli` | Web scraping / crawling |

**Search queries by stack:**

| Stack | Queries to Run |
|-------|---------------|
| React / Next.js | `react`, `nextjs`, `tailwind`, `testing` |
| Vue / Nuxt | `vue`, `nuxt`, `vite`, `pinia` |
| Python / FastAPI | `python`, `fastapi`, `testing` |
| React Native / Expo | `react-native`, `expo`, `mobile` |
| Node.js backend | `nodejs`, `api`, `database`, `docker` |
| .NET / C# | `dotnet`, `csharp`, `azure` |
| Go | `golang`, `api`, `docker` |
| Rust | `rust`, `systems`, `performance` |
| Any project | `debugging`, `design`, `git`, `code-review` |

## Important notes

- **Existing skills first.** Always search the ecosystem before suggesting custom skills.
- **Concrete install commands.** Every recommendation must include a copy-paste-ready `npx skills add` command.
- **Fit over quantity.** A React project doesn't need Vue skills.
- **Honest gaps.** If no existing skill covers a genuine need, say so and suggest creating one.
- **Universal skills.** Always consider `obra/superpowers` (debugging, planning, TDD) and `anthropics/skills` (frontend-design, webapp-testing) — they help any project.
- **Freshness.** Always search live rather than relying solely on the known repositories listed above.
