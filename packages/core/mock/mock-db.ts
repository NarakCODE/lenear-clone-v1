import type {
  User,
  Workspace,
  MemberWithUser,
  Agent,
  Issue,
  Comment,
  Project,
  Squad,
  Skill,
  RuntimeDevice,
  ChatSession,
  ChatMessage,
  InboxItem,
  Autopilot,
  Label,
  IssueReaction,
  TimelineEntry,
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
  settings: {},
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
    name: "Sarah Connor",
    email: "sarah@multica.ai",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "admin",
    created_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "mem_3",
    workspace_id: "ws_demo",
    user_id: "usr_alex",
    name: "Alex Rivera",
    email: "alex@multica.ai",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "member",
    created_at: "2026-01-05T00:00:00Z",
  },
  {
    id: "mem_4",
    workspace_id: "ws_demo",
    user_id: "usr_liam",
    name: "Liam Chen",
    email: "liam@multica.ai",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "member",
    created_at: "2026-01-10T00:00:00Z",
  },
];

export const MOCK_RUNTIMES: RuntimeDevice[] = [
  {
    id: "rt_macbook",
    workspace_id: "ws_demo",
    daemon_id: "daemon_local_01",
    name: "MacBook Pro M3 Max",
    custom_name: "Local Dev Station (16 Cores / 64GB)",
    runtime_mode: "local",
    provider: "claude",
    launch_header: "Local Daemon v0.4.28",
    status: "online",
    device_info: "Darwin 24.1.0 arm64",
    metadata: { memory_gb: 64, cpu_cores: 16, clis_detected: ["claude", "codex", "cursor-agent", "agy"] },
    owner_id: "usr_lead_dev",
    visibility: "public",
    last_seen_at: "2026-08-18T10:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-18T10:00:00Z",
  },
  {
    id: "rt_cloud_aws",
    workspace_id: "ws_demo",
    daemon_id: "daemon_cloud_02",
    name: "Cloud Sandbox AWS",
    custom_name: "AWS EC2 c7g.2xlarge",
    runtime_mode: "cloud",
    provider: "codex",
    launch_header: "Cloud Daemon v0.4.28",
    status: "online",
    device_info: "Linux 6.8.0-40-generic aarch64",
    metadata: { memory_gb: 32, cpu_cores: 8, clis_detected: ["codex", "hermes", "kimi"] },
    owner_id: "usr_sarah",
    visibility: "public",
    last_seen_at: "2026-08-18T10:05:00Z",
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-08-18T10:05:00Z",
  },
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: "agt_claude",
    workspace_id: "ws_demo",
    runtime_id: "rt_macbook",
    runtime_bound: true,
    name: "Claude Code",
    description: "Autonomous full-stack architect handling complex refactors and design systems.",
    instructions: "Write idiomatic TypeScript/React. Adhere to tokens in tokens.css. Always write Vitest unit tests.",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=ClaudeCode&backgroundColor=f59e0b",
    runtime_mode: "local",
    runtime_config: { cli: "claude" },
    custom_args: ["--dangerously-skip-permissions"],
    has_custom_env: false,
    visibility: "workspace",
    permission_mode: "public_to",
    invocation_targets: [{ target_type: "workspace", target_id: null }],
    status: "working",
    max_concurrent_tasks: 2,
    model: "claude-3-7-sonnet",
    thinking_level: "high",
    owner_id: "usr_lead_dev",
    skills: [
      { id: "sk_work_issues", name: "Working on Issues", description: "Structured task execution" },
      { id: "sk_pr_review", name: "PR Review Playbook", description: "Automated code review" },
    ],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    archived_at: null,
    archived_by: null,
  },
  {
    id: "agt_codex",
    workspace_id: "ws_demo",
    runtime_id: "rt_cloud_aws",
    runtime_bound: true,
    name: "OpenAI Codex",
    description: "Backend specialist focusing on Go services, database schemas, and performance.",
    instructions: "Follow standard Go idioms, checked errors, sqlc query generation, zero DB foreign keys.",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=OpenAICodex&backgroundColor=10b981",
    runtime_mode: "cloud",
    runtime_config: { cli: "codex" },
    custom_args: [],
    has_custom_env: false,
    visibility: "workspace",
    permission_mode: "public_to",
    invocation_targets: [{ target_type: "workspace", target_id: null }],
    status: "idle",
    max_concurrent_tasks: 3,
    model: "gpt-4o",
    owner_id: "usr_sarah",
    skills: [
      { id: "sk_db_verify", name: "Database Migration Verifier", description: "Zero-downtime migration audits" },
    ],
    created_at: "2026-01-05T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    archived_at: null,
    archived_by: null,
  },
  {
    id: "agt_cursor",
    workspace_id: "ws_demo",
    runtime_id: "rt_macbook",
    runtime_bound: true,
    name: "Cursor Agent",
    description: "Rapid UI prototyping, component scaffolding, and bug fixes.",
    instructions: "Use shadcn/Base UI components and semantic Tailwind tokens.",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=CursorAgent&backgroundColor=6366f1",
    runtime_mode: "local",
    runtime_config: { cli: "cursor-agent" },
    custom_args: [],
    has_custom_env: false,
    visibility: "workspace",
    permission_mode: "public_to",
    invocation_targets: [{ target_type: "workspace", target_id: null }],
    status: "idle",
    max_concurrent_tasks: 1,
    model: "claude-3-5-sonnet",
    owner_id: "usr_lead_dev",
    skills: [],
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    archived_at: null,
    archived_by: null,
  },
  {
    id: "agt_mika",
    workspace_id: "ws_demo",
    runtime_id: "rt_macbook",
    runtime_bound: true,
    name: "Mika",
    description: "Workspace coordinator and interactive guide.",
    instructions: "Assist team with onboarding, workspace administration, and agent routing.",
    system_key: "mika",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=MikaAssistant&backgroundColor=ec4899",
    runtime_mode: "local",
    runtime_config: { cli: "mika" },
    custom_args: [],
    has_custom_env: false,
    visibility: "workspace",
    permission_mode: "public_to",
    invocation_targets: [{ target_type: "workspace", target_id: null }],
    status: "idle",
    max_concurrent_tasks: 1,
    model: "gpt-4o",
    owner_id: null,
    skills: [
      { id: "sk_onboard", name: "Workspace Onboarding", description: "Setup playbooks" },
    ],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    archived_at: null,
    archived_by: null,
  },
  {
    id: "agt_hermes",
    workspace_id: "ws_demo",
    runtime_id: "rt_cloud_aws",
    runtime_bound: true,
    name: "Hermes",
    description: "Deep research, architecture exploration, and automated issue triage.",
    instructions: "Synthesize codebase patterns, search references, and file structured bug reports.",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=HermesBot&backgroundColor=8b5cf6",
    runtime_mode: "cloud",
    runtime_config: { cli: "hermes" },
    custom_args: [],
    has_custom_env: false,
    visibility: "workspace",
    permission_mode: "public_to",
    invocation_targets: [{ target_type: "workspace", target_id: null }],
    status: "working",
    max_concurrent_tasks: 2,
    model: "claude-3-7-sonnet",
    owner_id: "usr_sarah",
    skills: [],
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    archived_at: null,
    archived_by: null,
  },
];

export const MOCK_LABELS: Label[] = [
  { id: "lbl_frontend", workspace_id: "ws_demo", name: "Frontend", color: "#3b82f6", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "lbl_backend", workspace_id: "ws_demo", name: "Backend", color: "#10b981", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "lbl_perf", workspace_id: "ws_demo", name: "Performance", color: "#f59e0b", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "lbl_design", workspace_id: "ws_demo", name: "Design System", color: "#ec4899", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "lbl_bug", workspace_id: "ws_demo", name: "Bug", color: "#ef4444", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "lbl_security", workspace_id: "ws_demo", name: "Security", color: "#8b5cf6", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: "prj_next16",
    workspace_id: "ws_demo",
    title: "Next.js 16 App Router Migration",
    description: "Upgrade web application to Next.js 16 with Turbopack, React 19 compiler, and server actions.",
    icon: "layers",
    status: "in_progress",
    priority: "high",
    lead_type: "member",
    lead_id: "usr_lead_dev",
    start_date: "2026-01-10",
    due_date: "2026-09-30",
    issue_count: 12,
    done_count: 8,
    resource_count: 3,
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "prj_stream",
    workspace_id: "ws_demo",
    title: "Multi-turn Agent Streaming Engine",
    description: "Low-latency WebSocket streaming for Claude Code and Codex thinking blocks and tool calls.",
    icon: "sparkles",
    status: "in_progress",
    priority: "urgent",
    lead_type: "agent",
    lead_id: "agt_claude",
    start_date: "2026-02-01",
    due_date: "2026-10-15",
    issue_count: 8,
    done_count: 3,
    resource_count: 2,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "prj_tokens",
    workspace_id: "ws_demo",
    title: "Design System Tokens v2",
    description: "Harmonize semantic color tokens, high-contrast dark mode, and typography scale.",
    icon: "palette",
    status: "completed",
    priority: "medium",
    lead_type: "member",
    lead_id: "usr_alex",
    start_date: "2026-01-05",
    due_date: "2026-08-01",
    issue_count: 15,
    done_count: 15,
    resource_count: 4,
    created_at: "2026-01-05T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: "iss_101",
    workspace_id: "ws_demo",
    number: 101,
    identifier: "ACM-101",
    title: "Implement virtualized Kanban board for 10,000+ issue scales",
    description: "### Problem Statement\nWhen rendering thousands of issues across multiple status columns, DOM nodes exceed performance budgets.\n\n### Requirements\n- Use `@tanstack/react-virtual` or windowing techniques.\n- Maintain smooth 60fps drag and drop transitions.\n- Preserve keyboard navigation accessibility.",
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
    stage: 1,
    start_date: "2026-08-10",
    due_date: "2026-08-25",
    metadata: { pr_number: 342, branch: "feat/virtual-kanban" },
    properties: {},
    labels: [MOCK_LABELS[0]!, MOCK_LABELS[2]!],
    created_at: "2026-08-10T14:00:00Z",
    updated_at: "2026-08-18T09:30:00Z",
  },
  {
    id: "iss_102",
    workspace_id: "ws_demo",
    number: 102,
    identifier: "ACM-102",
    title: "Optimize WebSocket frame serialization in Go backend hub",
    description: "Benchmark message throughput under heavy multi-agent streaming loads. Use buffer pools to eliminate GC allocation spikes.",
    status: "in_review",
    status_category: "in_review",
    priority: "high",
    assignee_type: "agent",
    assignee_id: "agt_codex",
    creator_type: "member",
    creator_id: "usr_sarah",
    parent_issue_id: null,
    project_id: "prj_stream",
    position: 2000,
    stage: 1,
    start_date: "2026-08-12",
    due_date: "2026-08-20",
    metadata: { pr_number: 345, benchmark_speedup: "3.4x" },
    properties: {},
    labels: [MOCK_LABELS[1]!, MOCK_LABELS[2]!],
    created_at: "2026-08-12T10:00:00Z",
    updated_at: "2026-08-18T10:15:00Z",
  },
  {
    id: "iss_103",
    workspace_id: "ws_demo",
    number: 103,
    identifier: "ACM-103",
    title: "Design unified thinking & reasoning accordion component",
    description: "Create an elegant collapsible UI block showing agent chain-of-thought, tool calls, and command outputs with syntax highlighting.",
    status: "done",
    status_category: "done",
    priority: "medium",
    assignee_type: "member",
    assignee_id: "usr_lead_dev",
    creator_type: "member",
    creator_id: "usr_alex",
    parent_issue_id: null,
    project_id: "prj_tokens",
    position: 3000,
    stage: null,
    start_date: "2026-08-01",
    due_date: "2026-08-08",
    metadata: { component: "ThinkingAccordion" },
    properties: {},
    labels: [MOCK_LABELS[0]!, MOCK_LABELS[3]!],
    created_at: "2026-08-01T09:00:00Z",
    updated_at: "2026-08-08T17:00:00Z",
  },
  {
    id: "iss_104",
    workspace_id: "ws_demo",
    number: 104,
    identifier: "ACM-104",
    title: "Audit zero-foreign-key constraints in PostgreSQL migrations",
    description: "Ensure all newly created tables adhere to application-level transactional cascading cleanups without DB-level foreign keys.",
    status: "todo",
    status_category: "todo",
    priority: "medium",
    assignee_type: "agent",
    assignee_id: "agt_hermes",
    creator_type: "member",
    creator_id: "usr_sarah",
    parent_issue_id: null,
    project_id: null,
    position: 4000,
    stage: null,
    start_date: "2026-08-18",
    due_date: "2026-08-28",
    metadata: {},
    properties: {},
    labels: [MOCK_LABELS[1]!, MOCK_LABELS[5]!],
    created_at: "2026-08-15T11:00:00Z",
    updated_at: "2026-08-18T08:00:00Z",
  },
  {
    id: "iss_105",
    workspace_id: "ws_demo",
    number: 105,
    identifier: "ACM-105",
    title: "Refactor global Command Palette (Cmd+K) quick actions",
    description: "Support fuzzy matching for agents, issues, projects, and custom skills with instant navigation shortcuts.",
    status: "backlog",
    status_category: "backlog",
    priority: "low",
    assignee_type: "agent",
    assignee_id: "agt_cursor",
    creator_type: "member",
    creator_id: "usr_lead_dev",
    parent_issue_id: null,
    project_id: "prj_next16",
    position: 5000,
    stage: null,
    start_date: null,
    due_date: null,
    metadata: {},
    properties: {},
    labels: [MOCK_LABELS[0]!],
    created_at: "2026-08-16T15:00:00Z",
    updated_at: "2026-08-16T15:00:00Z",
  },
  {
    id: "iss_106",
    workspace_id: "ws_demo",
    number: 106,
    identifier: "ACM-106",
    title: "Fix dark mode border contrast in high-DPI displays",
    description: "Border color tokens `--border-subtle` had insufficient contrast ratio against `--bg-subtle` under certain display profiles.",
    status: "done",
    status_category: "done",
    priority: "medium",
    assignee_type: "member",
    assignee_id: "usr_alex",
    creator_type: "member",
    creator_id: "usr_alex",
    parent_issue_id: null,
    project_id: "prj_tokens",
    position: 6000,
    stage: null,
    start_date: "2026-08-05",
    due_date: "2026-08-07",
    metadata: {},
    properties: {},
    labels: [MOCK_LABELS[3]!, MOCK_LABELS[4]!],
    created_at: "2026-08-05T12:00:00Z",
    updated_at: "2026-08-07T16:00:00Z",
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
      content: "I have investigated `@tanstack/react-virtual` integration with our `packages/ui/components/ui/data-table.tsx`.\n\n```tsx\nconst virtualizer = useVirtualizer({\n  count: rows.length,\n  getScrollElement: () => tableContainerRef.current,\n  estimateSize: () => 44,\n  overscan: 10,\n});\n```\n\nBenchmarked 15,000 items with steady 60fps scrolling and full keyboard accessibility preserved in branch `feat/virtual-kanban`.",
      type: "comment",
      parent_id: null,
      reactions: [],
      attachments: [],
      resolved_at: null,
      resolved_by_type: null,
      resolved_by_id: null,
      created_at: "2026-08-18T09:30:00Z",
      updated_at: "2026-08-18T09:30:00Z",
    },
  ],
  iss_102: [
    {
      id: "cmt_102_1",
      issue_id: "iss_102",
      author_type: "agent",
      author_id: "agt_codex",
      content: "Profiling identified allocations in `json.Marshal` on every broadcast frame. Implemented `sync.Pool` byte buffer reuse in PR #345.",
      type: "comment",
      parent_id: null,
      reactions: [],
      attachments: [],
      resolved_at: "2026-08-18T10:15:00Z",
      resolved_by_type: "member",
      resolved_by_id: "usr_sarah",
      created_at: "2026-08-18T10:00:00Z",
      updated_at: "2026-08-18T10:15:00Z",
    },
  ],
};

export const MOCK_TIMELINE: Record<string, TimelineEntry[]> = {
  iss_101: [
    {
      id: "tl_1",
      type: "activity",
      actor_type: "member",
      actor_id: "usr_lead_dev",
      action: "created",
      created_at: "2026-08-10T14:00:00Z",
    },
    {
      id: "tl_2",
      type: "activity",
      actor_type: "agent",
      actor_id: "agt_claude",
      action: "status_changed",
      created_at: "2026-08-10T14:05:00Z",
    },
  ],
};

export const MOCK_SQUADS: Squad[] = [
  {
    id: "sq_infra",
    workspace_id: "ws_demo",
    name: "Core Infrastructure Squad",
    description: "High-throughput backend engineering, database migrations, and streaming reliability.",
    instructions: "Maintain high test coverage and zero regressions.",
    avatar_url: null,
    leader_id: "agt_claude",
    creator_id: "usr_lead_dev",
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    archived_at: null,
    archived_by: null,
  },
  {
    id: "sq_ui",
    workspace_id: "ws_demo",
    name: "Frontend Polish Squad",
    description: "Rapid UI iteration, design system compliance, and accessibility auditing.",
    instructions: "Review components against web-design-guidelines and maintain strict token discipline.",
    avatar_url: null,
    leader_id: "agt_cursor",
    creator_id: "usr_lead_dev",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    archived_at: null,
    archived_by: null,
  },
];

export const MOCK_SKILLS: Skill[] = [
  {
    id: "sk_work_issues",
    workspace_id: "ws_demo",
    name: "Working on Issues",
    description: "Standard operating procedure for picking up, implementing, and reviewing issues.",
    config: {},
    created_by: null,
    content: "# Working on Issues Playbook\n\n1. Inspect task requirements.\n2. Create an isolated branch.\n3. Implement changes and add tests.\n4. Open a review comment with diff.",
    files: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "sk_pr_review",
    workspace_id: "ws_demo",
    name: "PR Review Playbook",
    description: "Automated code quality, security scan, and test coverage verification.",
    config: {},
    created_by: "usr_lead_dev",
    content: "# Pull Request Review Guidelines\n- Verify TypeScript strict compliance.\n- Check for hardcoded color values.\n- Ensure non-blocking async operations.",
    files: [],
    created_at: "2026-01-20T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "sk_db_verify",
    workspace_id: "ws_demo",
    name: "Database Migration Verifier",
    description: "Enforces zero foreign keys and concurrent index creations in migrations.",
    config: {},
    created_by: "usr_sarah",
    content: "# DB Migration Rules\n- Always use CREATE INDEX CONCURRENTLY.\n- No database-level cascading deletes.",
    files: [],
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
  },
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
    title: "Sarah Connor assigned you to ACM-103",
    body: "Design unified thinking & reasoning accordion component.",
    issue_id: "iss_103",
    issue_status: "done",
    read: true,
    archived: false,
    details: null,
    created_at: "2026-08-01T09:00:00Z",
  },
  {
    id: "inb_3",
    workspace_id: "ws_demo",
    recipient_type: "member",
    recipient_id: "usr_lead_dev",
    actor_type: "agent",
    actor_id: "agt_codex",
    type: "review_requested",
    severity: "action_required",
    title: "OpenAI Codex requested review on ACM-102",
    body: "WebSocket frame serialization benchmark PR #345.",
    issue_id: "iss_102",
    issue_status: "in_review",
    read: false,
    archived: false,
    details: null,
    created_at: "2026-08-18T10:15:00Z",
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
        ws_labs: [MOCK_AGENTS[0]!, MOCK_AGENTS[3]!],
      },
      issues: {
        ws_demo: [...MOCK_ISSUES],
        ws_labs: [],
      },
      comments: { ...MOCK_COMMENTS },
      reactions: {},
      projects: {
        ws_demo: [...MOCK_PROJECTS],
        ws_labs: [],
      },
      squads: {
        ws_demo: [...MOCK_SQUADS],
        ws_labs: [],
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
        ws_labs: [],
      },
      chatMessages: { ...MOCK_CHAT_MESSAGES },
      inbox: {
        ws_demo: [...MOCK_INBOX_ITEMS],
        ws_labs: [],
      },
      autopilots: {
        ws_demo: [...MOCK_AUTOPILOTS],
        ws_labs: [],
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
    return this.db.members[wsId] ?? this.db.members["ws_demo"] ?? [];
  }

  getAgents(wsId: string): Agent[] {
    return this.db.agents[wsId] ?? this.db.agents["ws_demo"] ?? [];
  }

  getIssues(wsId: string): Issue[] {
    return this.db.issues[wsId] ?? this.db.issues["ws_demo"] ?? [];
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
      status_category: payload.status_category || (payload.status as any) || "todo",
      priority: payload.priority || "medium",
      assignee_type: payload.assignee_type || null,
      assignee_id: payload.assignee_id || null,
      creator_type: "member",
      creator_id: this.db.currentUser.id,
      parent_issue_id: payload.parent_issue_id || null,
      project_id: payload.project_id || null,
      position: (issues.length + 1) * 1000,
      stage: null,
      start_date: payload.start_date || null,
      due_date: payload.due_date || null,
      metadata: payload.metadata || {},
      properties: payload.properties || {},
      labels: payload.labels || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    issues.unshift(newIssue);
    return newIssue;
  }

  updateIssue(id: string, updates: Partial<Issue>): Issue {
    const issue = this.getIssue(id);
    if (!issue) throw new Error(`Issue not found: ${id}`);
    Object.assign(issue, updates, { updated_at: new Date().toISOString() });
    return issue;
  }

  deleteIssue(id: string): void {
    for (const wsId of Object.keys(this.db.issues)) {
      const list = this.db.issues[wsId];
      if (list) {
        this.db.issues[wsId] = list.filter((i) => i.id !== id);
      }
    }
  }

  getComments(issueId: string): Comment[] {
    return this.db.comments[issueId] ?? [];
  }

  createComment(issueId: string, content: string, authorType: "member" | "agent" = "member", authorId: string = this.db.currentUser.id): Comment {
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
    return this.db.projects[wsId] ?? this.db.projects["ws_demo"] ?? [];
  }

  getSquads(wsId: string): Squad[] {
    return this.db.squads[wsId] ?? this.db.squads["ws_demo"] ?? [];
  }

  getSkills(wsId: string): Skill[] {
    return this.db.skills[wsId] ?? this.db.skills["ws_demo"] ?? [];
  }

  getRuntimes(wsId: string): RuntimeDevice[] {
    return this.db.runtimes[wsId] ?? this.db.runtimes["ws_demo"] ?? [];
  }

  getChatSessions(wsId: string): ChatSession[] {
    return this.db.chatSessions[wsId] ?? this.db.chatSessions["ws_demo"] ?? [];
  }

  getChatMessages(sessionId: string): ChatMessage[] {
    return this.db.chatMessages[sessionId] ?? [];
  }

  sendChatMessage(sessionId: string, content: string): ChatMessage {
    const msgs = this.db.chatMessages[sessionId] ?? (this.db.chatMessages[sessionId] = []);
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      chat_session_id: sessionId,
      role: "user",
      content,
      task_id: `tsk_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    msgs.push(userMsg);

    // Auto-respond with simulated assistant thought
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        chat_session_id: sessionId,
        role: "assistant",
        content: `I received your request: "${content}". I am analyzing the repository context and will execute the corresponding task.`,
        task_id: `tsk_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      msgs.push(assistantMsg);
    }, 500);

    return userMsg;
  }

  getInbox(wsId: string): InboxItem[] {
    return this.db.inbox[wsId] ?? this.db.inbox["ws_demo"] ?? [];
  }

  getAutopilots(wsId: string): Autopilot[] {
    return this.db.autopilots[wsId] ?? this.db.autopilots["ws_demo"] ?? [];
  }

  getLabels(wsId: string): Label[] {
    return this.db.labels[wsId] ?? this.db.labels["ws_demo"] ?? [];
  }
}

export const mockDb = new InMemoryMockStore();
