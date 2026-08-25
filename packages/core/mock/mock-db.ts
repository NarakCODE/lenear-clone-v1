import type {
  User,
  Workspace,
  MemberWithUser,
  Agent,
  Issue,
  Comment,
  Project,
  Squad,
  Team,
  Cycle,
  Skill,
  RuntimeDevice,
  ChatSession,
  ChatMessage,
  InboxItem,
  Autopilot,
  Label,
  IssueReaction,
  TimelineEntry,
  TaskMessagePayload,
} from "../types";

export interface MockDatabase {
  currentUser: User;
  workspaces: Workspace[];
  members: Record<string, MemberWithUser[]>;
  agents: Record<string, Agent[]>;
  issues: Record<string, Issue[]>;
  comments: Record<string, Comment[]>;
  reactions: Record<string, IssueReaction[]>;
  projects: Record<string, Project[]>;
  squads: Record<string, Squad[]>;
  skills: Record<string, Skill[]>;
  runtimes: Record<string, RuntimeDevice[]>;
  chatSessions: Record<string, ChatSession[]>;
  chatMessages: Record<string, ChatMessage[]>;
  taskMessages: Record<string, TaskMessagePayload[]>;
  inbox: Record<string, InboxItem[]>;
  autopilots: Record<string, Autopilot[]>;
  labels: Record<string, Label[]>;
}

export const MOCK_USER: User = {
  id: "usr_lead_dev",
  name: "Senior Frontend Engineer",
  email: "engineer@multica.ai",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  onboarded_at: "2026-01-01T00:00:00Z",
  onboarding_questionnaire: {
    role: "engineer",
    team_size: "small",
    stack: ["typescript", "nextjs", "tailwind", "go"],
  },
  starter_content_state: "imported",
  language: "en",
  profile_description: "Lead UI Architect building autonomous human-agent collaboration systems.",
  timezone: "America/New_York",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-08-18T00:00:00Z",
};

export const MOCK_WORKSPACE_1: Workspace = {
  id: "ws_demo",
  name: "Acme Autonomous Corp",
  slug: "demo",
  description: "Primary engineering workspace collaborating with autonomous coding agents.",
  context: "Next.js App Router, Go Chi backend, sqlc, PostgreSQL, Tailwind CSS design system.",
  settings: {
    theme: "dark",
    auto_assign: true,
  },
  repos: [
    { url: "https://github.com/acme/multica-app", description: "Core monorepo" },
    { url: "https://github.com/acme/ui-tokens", description: "Shared design tokens" },
  ],
  issue_prefix: "ACM",
  avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-08-18T00:00:00Z",
};

export const MOCK_WORKSPACE_2: Workspace = {
  id: "ws_labs",
  name: "Multica Labs",
  slug: "labs",
  description: "R&D experimental environment for multi-agent squad orchestration.",
  context: "Experimental autonomous workflows and agent benchmarks.",
  settings: {
    theme: "dark",
  },
  repos: [
    { url: "https://github.com/multica-ai/experiments", description: "Autonomous squad experiments" },
  ],
  issue_prefix: "LAB",
  avatar_url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80",
  created_at: "2026-02-01T00:00:00Z",
  updated_at: "2026-08-18T00:00:00Z",
};

export const MOCK_MEMBERS: MemberWithUser[] = [
  {
    id: "mem_1",
    workspace_id: "ws_demo",
    user_id: "usr_lead_dev",
    name: "Senior Frontend Engineer",
    email: "engineer@multica.ai",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "owner",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "mem_2",
    workspace_id: "ws_demo",
    user_id: "usr_sarah",
    name: "Sarah Chen",
    email: "sarah@multica.ai",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "admin",
    created_at: "2026-01-05T00:00:00Z",
  },
  {
    id: "mem_3",
    workspace_id: "ws_demo",
    user_id: "usr_alex",
    name: "Alex Rivera",
    email: "alex@multica.ai",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "member",
    created_at: "2026-01-10T00:00:00Z",
  },
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: "agt_mika",
    workspace_id: "ws_demo",
    name: "Mika",
    description: "Built-in project co-pilot for architecture planning, task triage, and issue decomposition.",
    system_key: "mika",
    avatar_url: null,
    model: "claude-3-7-sonnet-20250219",
    status: "idle",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "agt_claude",
    workspace_id: "ws_demo",
    name: "Claude Code",
    description: "Full-stack autonomous software engineer executing end-to-end features and bug fixes.",
    system_key: undefined,
    avatar_url: null,
    model: "claude-3-7-sonnet-20250219",
    status: "idle",
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "agt_codex",
    workspace_id: "ws_demo",
    name: "OpenAI Codex",
    description: "Specialized in backend APIs, high-throughput pipelines, and sqlc query optimization.",
    system_key: undefined,
    avatar_url: null,
    model: "gpt-4o",
    status: "idle",
    created_at: "2026-01-03T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "agt_cursor",
    workspace_id: "ws_demo",
    name: "Cursor Agent",
    description: "Fast in-file refactoring, TypeScript type narrowing, and test scaffolding.",
    system_key: undefined,
    avatar_url: null,
    model: "claude-3-5-sonnet-20241022",
    status: "idle",
    created_at: "2026-01-04T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "agt_hermes",
    workspace_id: "ws_demo",
    name: "Hermes Reviewer",
    description: "Autonomous code review agent checking standards, security, and PR specifications.",
    system_key: undefined,
    avatar_url: null,
    model: "claude-3-5-sonnet-20241022",
    status: "idle",
    created_at: "2026-01-05T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
] as unknown as Agent[];

export const MOCK_PROJECTS: Project[] = [
  {
    id: "prj_next16",
    workspace_id: "ws_demo",
    title: "Next.js 16 & React 19 Upgrade",
    description: "Migrate App Router layouts, async request cookies, and Base UI components.",
    status: "in_progress",
    priority: "high",
    icon: "Layers",
    lead_type: "member",
    lead_id: "usr_lead_dev",
    start_date: "2026-08-01",
    due_date: "2026-09-15",
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    issue_count: 5,
    done_count: 2,
    resource_count: 0,
  },
  {
    id: "prj_tokens",
    workspace_id: "ws_demo",
    title: "Design System & UI Tokens",
    description: "Establish semantic color tokens and WCAG AA contrast compliance across light/dark modes.",
    status: "in_progress",
    priority: "medium",
    icon: "Palette",
    lead_type: "member",
    lead_id: "usr_sarah",
    start_date: "2026-07-15",
    due_date: "2026-08-30",
    created_at: "2026-07-15T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    issue_count: 3,
    done_count: 1,
    resource_count: 0,
  },
];

export const MOCK_PROJECTS_LABS: Project[] = [
  {
    id: "prj_swarm",
    workspace_id: "ws_labs",
    title: "Autonomous Agent Swarm Pipeline",
    description: "Benchmarking concurrent multi-agent issue resolution and git worktree isolation.",
    status: "in_progress",
    priority: "high",
    icon: "Cpu",
    lead_type: "member",
    lead_id: "usr_lead_dev",
    start_date: "2026-08-10",
    due_date: "2026-09-30",
    created_at: "2026-08-10T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    issue_count: 2,
    done_count: 0,
    resource_count: 0,
  },
];

export const MOCK_TEAMS: Team[] = [
  {
    id: "team_eng",
    workspace_id: "ws_demo",
    name: "Engineering",
    key: "ENG",
    description: "Core software engineering and infrastructure",
    icon: "Code",
    color: "#6366f1",
    issue_counter: 120,
    cycles_enabled: true,
    cycle_duration_weeks: 2,
    archived_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "team_design",
    workspace_id: "ws_demo",
    name: "Design",
    key: "DES",
    description: "Product design and design systems",
    icon: "Palette",
    color: "#ec4899",
    issue_counter: 45,
    cycles_enabled: true,
    cycle_duration_weeks: 2,
    archived_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
];

export const MOCK_CYCLES: Cycle[] = [
  {
    id: "cyc_1",
    workspace_id: "ws_demo",
    team_id: "team_eng",
    number: 1,
    name: "Cycle 1",
    description: "Sprint 1 focus on core performance and stability",
    start_date: "2026-08-01T00:00:00Z",
    end_date: "2026-08-15T00:00:00Z",
    completed_at: "2026-08-15T00:00:00Z",
    status: "previous",
    auto_archive_at: null,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  },
  {
    id: "cyc_2",
    workspace_id: "ws_demo",
    team_id: "team_eng",
    number: 2,
    name: "Cycle 2",
    description: "Sprint 2 features and integrations",
    start_date: "2026-08-16T00:00:00Z",
    end_date: "2026-08-30T00:00:00Z",
    completed_at: null,
    status: "current",
    auto_archive_at: null,
    created_at: "2026-08-16T00:00:00Z",
    updated_at: "2026-08-16T00:00:00Z",
  },
];

export const MOCK_SQUADS: Squad[] = [];
export const MOCK_SQUADS_LABS: Squad[] = [];

export const MOCK_LABELS: Label[] = [
  { id: "lbl_perf", workspace_id: "ws_demo", name: "performance", color: "#6366f1", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-08-18T00:00:00Z" },
  { id: "lbl_ui", workspace_id: "ws_demo", name: "ui-ux", color: "#ec4899", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-08-18T00:00:00Z" },
  { id: "lbl_agent", workspace_id: "ws_demo", name: "agentic", color: "#10b981", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-08-18T00:00:00Z" },
  { id: "lbl_backend", workspace_id: "ws_demo", name: "backend", color: "#f59e0b", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-08-18T00:00:00Z" },
  { id: "lbl_bug", workspace_id: "ws_demo", name: "bug", color: "#ef4444", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-08-18T00:00:00Z" },
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: "iss_101",
    workspace_id: "ws_demo",
    number: 101,
    identifier: "ACM-101",
    title: "Implement virtualized table for high-scale issue lists",
    description: "Support rendering 10,000+ items smoothly at 60fps using `@tanstack/react-virtual` with dynamic row heights and keyboard navigation.",
    status: "in_progress",
    status_category: "in_progress",
    priority: "urgent",
    assignee_type: "agent",
    assignee_id: "agt_claude",
    creator_type: "member",
    creator_id: "usr_lead_dev",
    parent_issue_id: null,
    project_id: "prj_next16",
    position: 1000,
    stage: null,
    start_date: "2026-08-10",
    due_date: "2026-08-25",
    metadata: {},
    properties: {},
    labels: [MOCK_LABELS[0]!, MOCK_LABELS[1]!],
    created_at: "2026-08-10T10:00:00Z",
    updated_at: "2026-08-18T09:00:00Z",
  },
  {
    id: "iss_102",
    workspace_id: "ws_demo",
    number: 102,
    identifier: "ACM-102",
    title: "Migrate Radix UI primitives to Base UI",
    description: "Convert dialogs, popovers, dropdowns, and tooltips to `@base-ui/react` to eliminate hydration mismatches in React 19.",
    status: "in_review",
    status_category: "in_review",
    priority: "high",
    assignee_type: "agent",
    assignee_id: "agt_cursor",
    creator_type: "member",
    creator_id: "usr_sarah",
    parent_issue_id: null,
    project_id: "prj_next16",
    position: 2000,
    stage: null,
    start_date: "2026-08-12",
    due_date: "2026-08-22",
    metadata: {},
    properties: {},
    labels: [MOCK_LABELS[1]!],
    created_at: "2026-08-12T11:00:00Z",
    updated_at: "2026-08-18T08:30:00Z",
  },
  {
    id: "iss_103",
    workspace_id: "ws_demo",
    number: 103,
    identifier: "ACM-103",
    title: "Audit WCAG AA color contrast ratios in dark mode",
    description: "Ensure `--muted-foreground` and `--faint-foreground` strictly meet 4.5:1 text contrast and 3:1 non-text contrast against all card and canvas surfaces.",
    status: "todo",
    status_category: "todo",
    priority: "medium",
    assignee_type: "member",
    assignee_id: "usr_alex",
    creator_type: "member",
    creator_id: "usr_lead_dev",
    parent_issue_id: null,
    project_id: "prj_tokens",
    position: 3000,
    stage: null,
    start_date: "2026-08-15",
    due_date: "2026-08-28",
    metadata: {},
    properties: {},
    labels: [MOCK_LABELS[1]!],
    created_at: "2026-08-15T09:00:00Z",
    updated_at: "2026-08-15T09:00:00Z",
  },
  {
    id: "iss_104",
    workspace_id: "ws_demo",
    number: 104,
    identifier: "ACM-104",
    title: "Autonomous PR review bot with Hermes Reviewer",
    description: "Trigger Hermes agent upon GitHub PR webhook dispatch to post line-by-line review comments and security checks.",
    status: "backlog",
    status_category: "backlog",
    priority: "low",
    assignee_type: "agent",
    assignee_id: "agt_hermes",
    creator_type: "member",
    creator_id: "usr_lead_dev",
    parent_issue_id: null,
    project_id: null,
    position: 4000,
    stage: null,
    start_date: null,
    due_date: null,
    metadata: {},
    properties: {},
    labels: [MOCK_LABELS[2]!],
    created_at: "2026-08-16T14:00:00Z",
    updated_at: "2026-08-16T14:00:00Z",
  },
];

export const MOCK_ISSUES_LABS: Issue[] = [
  {
    id: "iss_lab_1",
    workspace_id: "ws_labs",
    number: 1,
    identifier: "LAB-1",
    title: "Multi-Agent Git Worktree Concurrency Test",
    description: "Stress test 10 agents writing to isolated git worktrees concurrently.",
    status: "in_progress",
    status_category: "in_progress",
    priority: "high",
    assignee_type: "agent",
    assignee_id: "agt_codex",
    creator_type: "member",
    creator_id: "usr_lead_dev",
    parent_issue_id: null,
    project_id: "prj_swarm",
    position: 1000,
    stage: null,
    start_date: "2026-08-15",
    due_date: "2026-08-25",
    metadata: {},
    properties: {},
    labels: [MOCK_LABELS[2]!],
    created_at: "2026-08-15T10:00:00Z",
    updated_at: "2026-08-18T09:00:00Z",
  },
];

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  iss_101: [
    {
      id: "cmt_101_1",
      issue_id: "iss_101",
      author_type: "member",
      author_id: "usr_lead_dev",
      content: "Please ensure the virtual list preserves focus when navigating via keyboard Arrow keys.",
      type: "comment",
      parent_id: null,
      reactions: [],
      attachments: [],
      resolved_at: null,
      resolved_by_type: null,
      resolved_by_id: null,
      created_at: "2026-08-10T14:30:00Z",
      updated_at: "2026-08-10T14:30:00Z",
    },
    {
      id: "cmt_101_2",
      issue_id: "iss_101",
      author_type: "agent",
      author_id: "agt_claude",
      content: "I have verified `@tanstack/react-virtual` integration with our `packages/ui/components/ui/data-table.tsx`.\n\n```tsx\nconst virtualizer = useVirtualizer({\n  count: rows.length,\n  getScrollElement: () => tableContainerRef.current,\n  estimateSize: () => 44,\n  overscan: 10,\n});\n```\n\nBenchmarked 15,000 items with steady 60fps scrolling and full keyboard accessibility preserved in branch `feat/virtual-kanban`.",
      type: "comment",
      parent_id: null,
      reactions: [],
      attachments: [],
      resolved_at: null,
      resolved_by_type: null,
      resolved_by_id: null,
      created_at: "2026-08-10T15:00:00Z",
      updated_at: "2026-08-10T15:00:00Z",
    },
  ],
};

export const MOCK_TIMELINE: Record<string, TimelineEntry[]> = {
  iss_101: [
    {
      id: "tl_1",
      actor_type: "member",
      actor_id: "usr_lead_dev",
      action: "created",
      created_at: "2026-08-10T10:00:00Z",
    },
    {
      id: "tl_2",
      actor_type: "member",
      actor_id: "usr_lead_dev",
      action: "assigned",
      target_type: "agent",
      target_id: "agt_claude",
      created_at: "2026-08-10T10:05:00Z",
    },
    {
      id: "tl_3",
      actor_type: "agent",
      actor_id: "agt_claude",
      action: "status_changed",
      from_value: "todo",
      to_value: "in_progress",
      created_at: "2026-08-10T10:10:00Z",
    },
  ] as unknown as TimelineEntry[],
};

export const MOCK_SKILLS: Skill[] = [
  {
    id: "skl_ts",
    workspace_id: "ws_demo",
    name: "TypeScript Advanced Typing",
    description: "Deep TypeScript type-level programming, conditional types, and brand invariants.",
    config: {},
    created_by: "usr_lead_dev",
    content: "# TypeScript Guidelines\n- Always prefer explicit return types on exported module seams.\n- Use Zod schemas with parseWithFallback for runtime validation.",
    files: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  } as unknown as Skill,
  {
    id: "skl_review",
    workspace_id: "ws_demo",
    name: "Zero-Downtime DB Migrations",
    description: "Enforces zero foreign keys and concurrent index creations in migrations.",
    config: {},
    created_by: "usr_sarah",
    content: "# DB Migration Rules\n- Always use CREATE INDEX CONCURRENTLY.\n- No database-level cascading deletes.",
    files: [],
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  } as unknown as Skill,
];

export const MOCK_RUNTIMES: RuntimeDevice[] = [
  {
    id: "rt_local",
    workspace_id: "ws_demo",
    name: "MacBook Pro M3 Max",
    status: "online",
    platform: "darwin",
    arch: "arm64",
    version: "1.4.0",
    daemon_version: "0.4.28",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  } as unknown as RuntimeDevice,
  {
    id: "rt_cloud",
    workspace_id: "ws_demo",
    name: "Cloud Runner (Linux x86)",
    status: "online",
    platform: "linux",
    arch: "x64",
    version: "1.4.0",
    daemon_version: "0.4.28",
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  } as unknown as RuntimeDevice,
];

export const MOCK_AUTOPILOTS: Autopilot[] = [
  {
    id: "ap_standup",
    workspace_id: "ws_demo",
    title: "Daily Engineering Standup",
    description: "Summarizes completed tasks, active agent streams, and blockers every morning.",
    assignee_type: "agent",
    assignee_id: "agt_hermes",
    status: "active",
    execution_mode: "create_issue",
    issue_title_template: "Daily Standup Briefing - {{date}}",
    created_by_type: "member",
    created_by_id: "usr_lead_dev",
    last_run_at: null,
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "ap_security",
    workspace_id: "ws_demo",
    title: "Weekly Security & Dependency Audit",
    description: "Runs vulnerability checks against npm/pnpm and Go modules on Sunday nights.",
    assignee_type: "agent",
    assignee_id: "agt_codex",
    status: "active",
    execution_mode: "create_issue",
    issue_title_template: "Weekly Security Audit - {{date}}",
    created_by_type: "member",
    created_by_id: "usr_sarah",
    last_run_at: null,
    created_at: "2026-01-20T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
];

export const MOCK_AUTOPILOTS_LABS: Autopilot[] = [
  {
    id: "ap_benchmark",
    workspace_id: "ws_labs",
    title: "Automated Swarm Stress Test",
    description: "Daily benchmark analyzing autonomous multi-agent task completion latency.",
    assignee_type: "agent",
    assignee_id: "agt_codex",
    status: "active",
    execution_mode: "create_issue",
    issue_title_template: "Swarm Stress Report - {{date}}",
    created_by_type: "member",
    created_by_id: "usr_lead_dev",
    last_run_at: null,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
];

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: "cs_1",
    workspace_id: "ws_demo",
    agent_id: "agt_claude",
    creator_id: "usr_lead_dev",
    title: "Next.js 16 Component Optimization",
    status: "active",
    has_unread: false,
    unread_count: 0,
    last_message: {
      content: "I have refactored the table rows to use CSS content-visibility for instant initial rendering.",
      role: "assistant",
      created_at: "2026-08-18T10:10:00Z",
    },
    created_at: "2026-08-18T09:00:00Z",
    updated_at: "2026-08-18T10:10:00Z",
  },
  {
    id: "cs_2",
    workspace_id: "ws_demo",
    agent_id: "agt_mika",
    creator_id: "usr_lead_dev",
    title: "Workspace Guide & Agent Setup",
    status: "active",
    has_unread: false,
    unread_count: 0,
    last_message: {
      content: "Welcome to Acme Autonomous Corp! Your local daemon is connected and 5 agents are standing by.",
      role: "assistant",
      created_at: "2026-08-18T08:00:00Z",
    },
    created_at: "2026-08-18T08:00:00Z",
    updated_at: "2026-08-18T08:00:00Z",
  },
];

export const MOCK_CHAT_SESSIONS_LABS: ChatSession[] = [
  {
    id: "cs_labs_1",
    workspace_id: "ws_labs",
    agent_id: "agt_codex",
    creator_id: "usr_lead_dev",
    title: "Multi-Agent Swarm Orchestration Benchmark",
    status: "active",
    has_unread: false,
    unread_count: 0,
    last_message: {
      content: "Swarm benchmark completed: 4 agents cooperated across 12 sub-tasks in 4.2s with zero race conditions.",
      role: "assistant",
      created_at: "2026-08-18T11:20:00Z",
    },
    created_at: "2026-08-18T10:00:00Z",
    updated_at: "2026-08-18T11:20:00Z",
  },
  {
    id: "cs_labs_2",
    workspace_id: "ws_labs",
    agent_id: "agt_cursor",
    creator_id: "usr_lead_dev",
    title: "Design Token Semantic Layer Migration",
    status: "active",
    has_unread: false,
    unread_count: 0,
    last_message: {
      content: "Migrated 48 legacy color tokens to OKLCH semantic palette with automatic high-contrast theme overrides.",
      role: "assistant",
      created_at: "2026-08-18T12:00:00Z",
    },
    created_at: "2026-08-18T11:30:00Z",
    updated_at: "2026-08-18T12:00:00Z",
  },
];

export const MOCK_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  cs_1: [
    {
      id: "msg_1",
      chat_session_id: "cs_1",
      role: "user",
      content: "Can you analyze our table component rendering performance with 10k rows and suggest non-blocking optimizations?",
      task_id: "tsk_1",
      created_at: "2026-08-18T09:00:00Z",
    },
    {
      id: "msg_2",
      chat_session_id: "cs_1",
      role: "assistant",
      content: "I analyzed the rendering tree and recommend three key optimizations:\n\n1. **Virtual Windowing**: Mount only visible rows (`~30` DOM nodes instead of 10,000).\n2. **CSS Content-Visibility**: Apply `content-visibility: auto` to off-screen elements.\n3. **Selector Stabilization**: Ensure Zustand selectors return stable primitive references.\n\nHere is the proposed component diff:\n\n```diff\n- {rows.map(row => <TableRow key={row.id} row={row} />)}\n+ {virtualizer.getVirtualItems().map(virtualRow => (\n+   <TableRow key={virtualRow.key} row={rows[virtualRow.index]} />\n+ ))}\n```",
      task_id: "tsk_1",
      created_at: "2026-08-18T09:02:00Z",
    },
  ],
  cs_2: [
    {
      id: "msg_201",
      chat_session_id: "cs_2",
      role: "assistant",
      content: "Welcome to Acme Autonomous Corp! Your local daemon is connected and 5 agents are standing by. You can assign issues, run multi-agent squads, or chat directly here.",
      task_id: null,
      created_at: "2026-08-18T08:00:00Z",
    },
  ],
  cs_labs_1: [
    {
      id: "msg_lab_1",
      chat_session_id: "cs_labs_1",
      role: "user",
      content: "Run swarm benchmark across 4 agents on the monorepo test suite.",
      task_id: "tsk_lab_1",
      created_at: "2026-08-18T10:00:00Z",
    },
    {
      id: "msg_lab_2",
      chat_session_id: "cs_labs_1",
      role: "assistant",
      content: "### Swarm Orchestration Report\n\n- **Concurrency**: 4 worker agents dispatched in isolated git worktrees.\n- **Test Pipeline**: 519 test suites / 5,974 tests executed in parallel.\n- **Results**: 100% passed in **4.2s** (vs 28.4s sequential).\n\nAll temporary branch worktrees cleaned up successfully.",
      task_id: "tsk_lab_1",
      created_at: "2026-08-18T10:00:30Z",
    },
  ],
  cs_labs_2: [
    {
      id: "msg_lab_3",
      chat_session_id: "cs_labs_2",
      role: "assistant",
      content: "Design Token migration initialized for Multica Labs. 48 color variables converted to OKLCH with 100% WCAG AA contrast clearance.",
      task_id: null,
      created_at: "2026-08-18T11:30:00Z",
    },
  ],
};

export const MOCK_TASK_TRANSCRIPTS: Record<string, TaskMessagePayload[]> = {
  tsk_1: [
    {
      task_id: "tsk_1",
      issue_id: "iss_101",
      chat_session_id: "cs_1",
      seq: 1,
      type: "thinking",
      content: "Analyzing repository rendering profile and virtualizer bindings across packages/ui and packages/views...",
      created_at: "2026-08-18T09:00:05Z",
    },
    {
      task_id: "tsk_1",
      issue_id: "iss_101",
      chat_session_id: "cs_1",
      seq: 2,
      type: "tool_use",
      tool: "grep_search",
      input: {
        Query: "useVirtualizer",
        SearchPath: "packages/ui/components/ui/data-table.tsx",
      },
      created_at: "2026-08-18T09:00:10Z",
    },
    {
      task_id: "tsk_1",
      issue_id: "iss_101",
      chat_session_id: "cs_1",
      seq: 3,
      type: "tool_result",
      output: "Found 1 match in packages/ui/components/ui/data-table.tsx (line 44)",
      created_at: "2026-08-18T09:00:12Z",
    },
    {
      task_id: "tsk_1",
      issue_id: "iss_101",
      chat_session_id: "cs_1",
      seq: 4,
      type: "tool_use",
      tool: "run_command",
      input: {
        CommandLine: "pnpm --filter @multica/views test",
      },
      created_at: "2026-08-18T09:00:20Z",
    },
    {
      task_id: "tsk_1",
      issue_id: "iss_101",
      chat_session_id: "cs_1",
      seq: 5,
      type: "tool_result",
      output: "✓ data-table.test.tsx (14 tests passed in 48ms)\n✓ virtual-kanban.test.tsx (22 tests passed in 65ms)",
      created_at: "2026-08-18T09:00:45Z",
    },
    {
      task_id: "tsk_1",
      issue_id: "iss_101",
      chat_session_id: "cs_1",
      seq: 6,
      type: "text",
      content: "All virtualizer benchmarks cleared 60fps with zero layout thrashing.",
      created_at: "2026-08-18T09:01:00Z",
    },
  ],
  tsk_lab_1: [
    {
      task_id: "tsk_lab_1",
      issue_id: "iss_lab_1",
      chat_session_id: "cs_labs_1",
      seq: 1,
      type: "thinking",
      content: "Spawning 4 isolated git worktrees for parallel swarm execution...",
      created_at: "2026-08-18T10:00:02Z",
    },
    {
      task_id: "tsk_lab_1",
      issue_id: "iss_lab_1",
      chat_session_id: "cs_labs_1",
      seq: 2,
      type: "tool_use",
      tool: "run_command",
      input: {
        CommandLine: "git worktree add -b swarm-bench-1 /tmp/worktree-1",
      },
      created_at: "2026-08-18T10:00:05Z",
    },
    {
      task_id: "tsk_lab_1",
      issue_id: "iss_lab_1",
      chat_session_id: "cs_labs_1",
      seq: 3,
      type: "tool_result",
      output: "Preparing worktree (checking out 'swarm-bench-1')",
      created_at: "2026-08-18T10:00:08Z",
    },
    {
      task_id: "tsk_lab_1",
      issue_id: "iss_lab_1",
      chat_session_id: "cs_labs_1",
      seq: 4,
      type: "text",
      content: "Swarm execution completed in 4.2s.",
      created_at: "2026-08-18T10:00:30Z",
    },
  ],
};

export const MOCK_INBOX_ITEMS: InboxItem[] = [
  {
    id: "inb_1",
    workspace_id: "ws_demo",
    recipient_type: "member",
    recipient_id: "usr_lead_dev",
    actor_type: "agent",
    actor_id: "agt_claude",
    type: "mentioned",
    severity: "action_required",
    title: "Claude Code mentioned you in ACM-101",
    body: "Please verify keyboard navigation in the virtualized Kanban PR #342.",
    issue_id: "iss_101",
    issue_status: "in_progress",
    read: false,
    archived: false,
    details: null,
    created_at: "2026-08-18T09:30:00Z",
  },
  {
    id: "inb_2",
    workspace_id: "ws_demo",
    recipient_type: "member",
    recipient_id: "usr_lead_dev",
    actor_type: "member",
    actor_id: "usr_sarah",
    type: "issue_assigned",
    severity: "attention",
    title: "Sarah Chen assigned you to ACM-103",
    body: "Reviewing WCAG contrast tokens before release.",
    issue_id: "iss_103",
    issue_status: "todo",
    read: false,
    archived: false,
    details: null,
    created_at: "2026-08-18T09:00:00Z",
  },
];

export const MOCK_INBOX_ITEMS_LABS: InboxItem[] = [
  {
    id: "inb_lab_1",
    workspace_id: "ws_labs",
    recipient_type: "member",
    recipient_id: "usr_lead_dev",
    actor_type: "agent",
    actor_id: "agt_codex",
    type: "review_requested",
    severity: "action_required",
    title: "OpenAI Codex completed swarm benchmark LAB-1",
    body: "All 12 sub-tasks completed with 100% test coverage.",
    issue_id: "iss_lab_1",
    issue_status: "in_progress",
    read: false,
    archived: false,
    details: null,
    created_at: "2026-08-18T10:30:00Z",
  },
];

/**
 * In-memory state holding all mutable mock collections.
 */
class InMemoryMockStore {
  private db: MockDatabase;

  constructor() {
    this.db = {
      currentUser: { ...MOCK_USER },
      workspaces: [{ ...MOCK_WORKSPACE_1 }, { ...MOCK_WORKSPACE_2 }],
      members: {
        ws_demo: [...MOCK_MEMBERS],
        ws_labs: [MOCK_MEMBERS[0]!],
      },
      agents: {
        ws_demo: [...MOCK_AGENTS],
        ws_labs: [MOCK_AGENTS[0]!, MOCK_AGENTS[2]!, MOCK_AGENTS[3]!],
      },
      issues: {
        ws_demo: [...MOCK_ISSUES],
        ws_labs: [...MOCK_ISSUES_LABS],
      },
      comments: { ...MOCK_COMMENTS },
      reactions: {},
      projects: {
        ws_demo: [...MOCK_PROJECTS],
        ws_labs: [...MOCK_PROJECTS_LABS],
      },
      squads: {
        ws_demo: [...MOCK_SQUADS],
        ws_labs: [...MOCK_SQUADS_LABS],
      },
      skills: {
        ws_demo: [...MOCK_SKILLS],
        ws_labs: [...MOCK_SKILLS],
      },
      runtimes: {
        ws_demo: [...MOCK_RUNTIMES],
        ws_labs: [MOCK_RUNTIMES[0]!],
      },
      chatSessions: {
        ws_demo: [...MOCK_CHAT_SESSIONS],
        ws_labs: [...MOCK_CHAT_SESSIONS_LABS],
      },
      chatMessages: {
        ...MOCK_CHAT_MESSAGES,
      },
      taskMessages: {
        ...MOCK_TASK_TRANSCRIPTS,
      },
      inbox: {
        ws_demo: [...MOCK_INBOX_ITEMS],
        ws_labs: [...MOCK_INBOX_ITEMS_LABS],
      },
      autopilots: {
        ws_demo: [...MOCK_AUTOPILOTS],
        ws_labs: [...MOCK_AUTOPILOTS_LABS],
      },
      labels: {
        ws_demo: [...MOCK_LABELS],
        ws_labs: [...MOCK_LABELS],
      },
    };
  }

  get currentUser(): User {
    return this.db.currentUser;
  }

  get workspaces(): Workspace[] {
    return this.db.workspaces;
  }

  getWorkspaceBySlug(slug: string): Workspace | undefined {
    return this.db.workspaces.find((w) => w.slug === slug);
  }

  getMembers(wsId: string): MemberWithUser[] {
    const list = this.db.members[wsId];
    if (list && list.length > 0) return list;
    return this.db.members["ws_demo"] ?? [];
  }

  getAgents(wsId: string): Agent[] {
    const list = this.db.agents[wsId];
    if (list && list.length > 0) return list;
    return this.db.agents["ws_demo"] ?? [];
  }

  getIssues(wsId: string): Issue[] {
    const list = this.db.issues[wsId];
    if (list) return list;
    return this.db.issues["ws_demo"] ?? [];
  }

  getIssue(id: string): Issue | undefined {
    for (const list of Object.values(this.db.issues)) {
      const match = list.find((i) => i.id === id || i.identifier === id);
      if (match) return match;
    }
    return undefined;
  }

  createIssue(wsId: string, payload: Partial<Issue>): Issue {
    const issues = this.db.issues[wsId] ?? (this.db.issues[wsId] = []);
    const num = issues.length + 101;
    const ws = this.db.workspaces.find((w) => w.id === wsId) ?? MOCK_WORKSPACE_1;
    const newIssue: Issue = {
      id: `iss_${Date.now()}`,
      workspace_id: wsId,
      number: num,
      identifier: `${ws.issue_prefix}-${num}`,
      title: payload.title || "Untitled Issue",
      description: payload.description || "",
      status: payload.status || "todo",
      status_category: payload.status_category || "todo",
      priority: payload.priority || "medium",
      assignee_type: payload.assignee_type || "member",
      assignee_id: payload.assignee_id || this.db.currentUser.id,
      creator_type: "member",
      creator_id: this.db.currentUser.id,
      parent_issue_id: payload.parent_issue_id || null,
      project_id: payload.project_id || null,
      position: (issues.length + 1) * 1000,
      stage: payload.stage || null,
      start_date: payload.start_date || null,
      due_date: payload.due_date || null,
      metadata: payload.metadata || {},
      properties: payload.properties || {},
      labels: payload.labels || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    issues.push(newIssue);
    return newIssue;
  }

  updateIssue(id: string, payload: Partial<Issue>): Issue | undefined {
    for (const list of Object.values(this.db.issues)) {
      const index = list.findIndex((i) => i.id === id || i.identifier === id);
      if (index !== -1) {
        const updated = {
          ...list[index]!,
          ...payload,
          updated_at: new Date().toISOString(),
        };
        list[index] = updated;
        return updated;
      }
    }
    return undefined;
  }

  deleteIssue(id: string): boolean {
    for (const list of Object.values(this.db.issues)) {
      const index = list.findIndex((i) => i.id === id || i.identifier === id);
      if (index !== -1) {
        list.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  getComments(issueId: string): Comment[] {
    return this.db.comments[issueId] ?? [];
  }

  createComment(issueId: string, content: string, authorType: Comment["author_type"] = "member", authorId = this.db.currentUser.id): Comment {
    const comments = this.db.comments[issueId] ?? (this.db.comments[issueId] = []);
    const comment: Comment = {
      id: `cmt_${Date.now()}`,
      issue_id: issueId,
      author_type: authorType,
      author_id: authorId,
      content,
      type: "comment",
      parent_id: null,
      reactions: [],
      attachments: [],
      resolved_at: null,
      resolved_by_type: null,
      resolved_by_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    comments.push(comment);
    return comment;
  }

  getProjects(wsId: string): Project[] {
    const list = this.db.projects[wsId];
    if (list && list.length > 0) return list;
    return this.db.projects["ws_demo"] ?? [];
  }

  getSquads(wsId: string): Squad[] {
    const list = this.db.squads[wsId];
    if (list && list.length > 0) return list;
    return this.db.squads["ws_demo"] ?? [];
  }

  getSkills(wsId: string): Skill[] {
    const list = this.db.skills[wsId];
    if (list && list.length > 0) return list;
    return this.db.skills["ws_demo"] ?? [];
  }

  getRuntimes(wsId: string): RuntimeDevice[] {
    const list = this.db.runtimes[wsId];
    if (list && list.length > 0) return list;
    return this.db.runtimes["ws_demo"] ?? [];
  }

  getChatSessions(wsId: string): ChatSession[] {
    const list = this.db.chatSessions[wsId];
    if (list && list.length > 0) return list;
    if (wsId === "ws_labs" || wsId === "labs") {
      return this.db.chatSessions["ws_labs"] ?? [];
    }
    return this.db.chatSessions["ws_demo"] ?? [];
  }

  getChatMessages(sessionId: string): ChatMessage[] {
    return this.db.chatMessages[sessionId] ?? [];
  }

  getTaskMessages(taskId: string): TaskMessagePayload[] {
    return this.db.taskMessages[taskId] ?? MOCK_TASK_TRANSCRIPTS[taskId] ?? [];
  }

  sendChatMessage(sessionId: string, content: string): ChatMessage {
    const msgs = this.db.chatMessages[sessionId] ?? (this.db.chatMessages[sessionId] = []);
    const taskId = `tsk_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      chat_session_id: sessionId,
      role: "user",
      content,
      task_id: taskId,
      created_at: new Date().toISOString(),
    };
    msgs.push(userMsg);

    // Find session to know the agent persona and workspace
    let session = Object.values(this.db.chatSessions).flat().find((s) => s.id === sessionId);
    const agentId = session?.agent_id ?? "agt_claude";
    const agent = Object.values(this.db.agents).flat().find((a) => a.id === agentId);
    const agentName = agent?.name ?? "Claude Code";

    // Auto-update session's last message
    if (session) {
      session.last_message = {
        role: "user",
        content,
        created_at: userMsg.created_at,
      };
      session.updated_at = userMsg.created_at;
    }

    // Build persona-aware response content and quick actions
    let replyProse = "";
    let toolName = "view_file";
    let toolCommand = "pnpm test";

    if (agentId.includes("mika")) {
      replyProse = `I analyzed your request against the workspace architecture:\n\n1. **Objective**: "${content}"\n2. **Orchestration**: Assigning sub-tasks across **Claude Agent** and **Code Reviewer**.\n3. **Tracking**: Linked issue draft ready for review.\n\nEverything is aligned with our zero-breaking-change rule.`;
      toolName = "search_workspace";
      toolCommand = "mika plan --workspace current";
    } else if (agentId.includes("codex") || agentId.includes("review") || agentId.includes("hermes")) {
      replyProse = `### Static Analysis & Code Review Audit\n\nI reviewed the codebase changes for "${content}":\n\n- **Type Safety**: 100% strict TypeScript compliance across all packages.\n- **Performance**: Zero extra re-renders detected in layout benchmarks.\n- **Security**: All dynamic input props sanitized against XSS.\n\n\`\`\`ts\n// Verified invariant check\nexport function validateInput(val: unknown): boolean {\n  return val !== null && typeof val === "object";\n}\n\`\`\`\n\nReady to merge into main branch.`;
      toolName = "run_linter";
      toolCommand = "eslint --max-warnings 0 && vitest run";
    } else {
      replyProse = `I have inspected the repository context and formulated a solution for: **${content}**.\n\n### Implementation Plan\n\n\`\`\`tsx\n// Optimized standalone execution\nexport const useOptimizedData = () => {\n  const query = useQuery({\n    queryKey: ["agentic", "data"],\n    queryFn: async () => mockDb.getIssues("ws_demo"),\n    staleTime: 60_000,\n  });\n  return query;\n};\n\`\`\`\n\n- Ran unit tests: **All 234 tests passed**.\n- Verified layout, responsiveness, and dark mode contrast tokens.`;
      toolName = "replace_file_content";
      toolCommand = "pnpm typecheck && pnpm test";
    }

    // Populate Task Transcript trace events
    this.db.taskMessages[taskId] = [
      {
        task_id: taskId,
        issue_id: "iss_101",
        chat_session_id: sessionId,
        seq: 1,
        type: "thinking",
        content: `Analyzing prompt intent: "${content}". Formulating execution strategy with agent ${agentName}...`,
        created_at: new Date().toISOString(),
      },
      {
        task_id: taskId,
        issue_id: "iss_101",
        chat_session_id: sessionId,
        seq: 2,
        type: "tool_use",
        tool: toolName,
        input: { query: content, path: "packages/core" },
        created_at: new Date().toISOString(),
      },
      {
        task_id: taskId,
        issue_id: "iss_101",
        chat_session_id: sessionId,
        seq: 3,
        type: "tool_result",
        output: `✓ Successfully verified context in 12ms. Running validation command: ${toolCommand}`,
        created_at: new Date().toISOString(),
      },
      {
        task_id: taskId,
        issue_id: "iss_101",
        chat_session_id: sessionId,
        seq: 4,
        type: "tool_use",
        tool: "run_command",
        input: { CommandLine: toolCommand },
        created_at: new Date().toISOString(),
      },
      {
        task_id: taskId,
        issue_id: "iss_101",
        chat_session_id: sessionId,
        seq: 5,
        type: "tool_result",
        output: "✓ All checks passed (0 errors, 0 warnings). Execution time: 180ms.",
        created_at: new Date().toISOString(),
      },
      {
        task_id: taskId,
        issue_id: "iss_101",
        chat_session_id: sessionId,
        seq: 6,
        type: "text",
        content: replyProse,
        created_at: new Date().toISOString(),
      },
    ];

    // Generate assistant reply after realistic multi-stage delay
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        chat_session_id: sessionId,
        role: "assistant",
        content: replyProse,
        task_id: taskId,
        created_at: new Date().toISOString(),
      };
      msgs.push(assistantMsg);

      if (session) {
        session.last_message = {
          role: "assistant",
          content: replyProse.slice(0, 120) + "...",
          created_at: assistantMsg.created_at,
        };
        session.updated_at = assistantMsg.created_at;
      }
    }, 450);

    return userMsg;
  }

  getInbox(wsId: string): InboxItem[] {
    const list = this.db.inbox[wsId];
    if (list && list.length > 0) return list;
    return this.db.inbox["ws_demo"] ?? [];
  }

  getAutopilots(wsId: string): Autopilot[] {
    const list = this.db.autopilots[wsId];
    if (list && list.length > 0) return list;
    return this.db.autopilots["ws_demo"] ?? [];
  }

  getLabels(wsId: string): Label[] {
    const list = this.db.labels[wsId];
    if (list && list.length > 0) return list;
    return this.db.labels["ws_demo"] ?? [];
  }
}

export const mockDb = new InMemoryMockStore();
