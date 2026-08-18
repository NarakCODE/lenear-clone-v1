# Standalone UI Reference Application & Template Guide

This guide details how the **Multica UI-Only Standalone Template** is structured, how to run and develop with it locally without any external dependencies (no Go backend, no PostgreSQL, no Docker, and no third-party cloud APIs required), and how to navigate the mock data engine.

---

## 1. Quick Start

### Prerequisites
- **Node.js**: >= 20.x (Node 22 LTS supported)
- **pnpm**: >= 9.x or 10.x

### Run the Standalone Web App
From the repository root:
```bash
# 1. Install dependencies
pnpm install

# 2. Start Next.js development server (runs purely with in-memory mock engine)
pnpm --filter @multica/web dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- You will be automatically authenticated as **Senior Frontend Engineer** (`engineer@multica.ai`).
- You will be routed to the default workspace: **Acme Autonomous Corp** (`/demo/issues`).
- You can switch workspaces anytime via the sidebar switcher to **Multica Labs** (`/labs/issues`).

---

## 2. Architecture Overview

```
                               ┌────────────────────────┐
                               │     Next.js 16 Web     │
                               │      (@multica/web)    │
                               └───────────┬────────────┘
                                           │
                               ┌───────────▼────────────┐
                               │   Shared Business Views │
                               │     (@multica/views)   │
                               └───────────┬────────────┘
                                           │
                   ┌───────────────────────┴────────────────────────┐
                   │                                                │
         ┌─────────▼───────────┐                          ┌─────────▼──────────┐
         │     Atomic UI       │                          │    Core Engine     │
         │   (@multica/ui)     │                          │  (@multica/core)   │
         └─────────────────────┘                          └─────────┬──────────┘
                                                                    │
                                                  ┌─────────────────┴─────────────────┐
                                                  │   ApiClient / React Query Hooks    │
                                                  └─────────────────┬─────────────────┘
                                                                    │
                                                ┌───────────────────▼───────────────────┐
                                                │          Mock Router & DB             │
                                                │      (packages/core/mock/)            │
                                                │  - InMemoryMockStore (CRUD state)     │
                                                │  - MockRouter (REST & Query dispatch) │
                                                └───────────────────────────────────────┘
```

### Key Highlights
1. **Zero Redesign / 100% Visual & Interaction Fidelity**:
   - Every single component, layout, token, animation, icon, table, popover, modal, and drawer from the production codebase remains intact.
   - All 320+ `ApiClient` methods continue to validate through their respective **Zod schemas** (`parseWithFallback`), ensuring schema-sound mock responses.
2. **Deterministic In-Memory Mock Store**:
   - Lives in [`packages/core/mock/mock-db.ts`](file:///Users/narak/Documents/narakcode/turbo-repo/multica/packages/core/mock/mock-db.ts).
   - Pre-populated with realistic workspaces, agents, squads, runtimes, projects, labeled issues, threaded discussion comments, and chat history.
3. **Interactive Local CRUD**:
   - Creating an issue immediately adds it to the in-memory board and updates counts.
   - Changing issue status or moving columns immediately updates the state.
   - Chatting with agents simulates instant assistant thinking responses.
   - Commenting and mention previews operate with instant local feedback.

---

## 3. Included Pages & Interactive Views

| Route | Feature Description |
|---|---|
| `/[workspaceSlug]/issues` | Kanban board & data table views with grouping, filtering, search, and virtualized scrolling |
| `/[workspaceSlug]/issues/[id]` | Issue detail sheet/page with properties, timeline, comments, markdown editor, and attachments |
| `/[workspaceSlug]/agents` | Multi-agent registry featuring Claude Code, OpenAI Codex, Cursor Agent, Mika, and Hermes |
| `/[workspaceSlug]/agents/[id]` | Agent inspector: model parameters, thinking level, runtime bindings, and assigned skills |
| `/[workspaceSlug]/chat` | Interactive multi-turn chat stream with code blocks, diffs, and follow-up quick actions |
| `/[workspaceSlug]/projects` | Project roadmaps with progress metrics, status indicators, and linked issues |
| `/[workspaceSlug]/squads` | Multi-agent squad orchestrator with leader assignment and squad activity feeds |
| `/[workspaceSlug]/skills` | Reusable agent capabilities and Markdown playbooks |
| `/[workspaceSlug]/autopilots` | Automated cron schedules and recurring workflow definitions |
| `/[workspaceSlug]/runtimes` | Local daemons and cloud sandbox device manager |
| `/[workspaceSlug]/inbox` | Actionable notifications, agent review requests, and mention alerts |
| `/[workspaceSlug]/settings` | Workspace configurations, members, roles, integrations, and labels |

---

## 4. Customizing Mock Data

To adjust or add sample data, edit [`packages/core/mock/mock-db.ts`](file:///Users/narak/Documents/narakcode/turbo-repo/multica/packages/core/mock/mock-db.ts):

- **Add New Agents**: Append to `MOCK_AGENTS` with custom model, system instructions, and avatars.
- **Add New Issues**: Append to `MOCK_ISSUES` with markdown descriptions, labels, priorities, and assignees.
- **Add Workspaces**: Append to `MOCK_WORKSPACE_1` / `MOCK_WORKSPACE_2`.
- **Add Comments & Activity**: Modify `MOCK_COMMENTS` and `MOCK_TIMELINE`.

---

## 5. Verification Commands

```bash
# Typecheck all packages
pnpm typecheck

# Run full Vitest unit test suite (100% passing)
pnpm test

# Build production Next.js application bundle
pnpm --filter @multica/web build
```
