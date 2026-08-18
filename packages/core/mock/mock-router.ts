import { mockDb, MOCK_WORKSPACE_1, MOCK_TIMELINE } from "./mock-db";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export class MockRouter {
  async handle(
    path: string,
    init?: { method?: string; headers?: Record<string, string>; body?: unknown },
  ): Promise<Response | null> {
    const method = init?.method?.toUpperCase() ?? "GET";
    const parts = path.split("?");
    const pathname = parts[0] ?? "";
    const searchStr = parts[1] ?? "";
    const searchParams = new URLSearchParams(searchStr);
    const wsSlug = init?.headers?.["X-Workspace-Slug"] || "demo";
    const ws = mockDb.getWorkspaceBySlug(wsSlug) ?? MOCK_WORKSPACE_1;
    const wsId = ws.id;

    // 1. Config & System
    if (pathname === "/config" || pathname === "/api/config") {
      return jsonResponse({
        allow_signup: true,
        google_client_id: null,
        workspace_creation_disabled: false,
        vcs_integration_available: true,
        daemon_server_url: "ws://localhost:8080/ws",
        daemon_app_url: "http://localhost:3000",
        feature_flags: {
          enable_squads: true,
          enable_autopilots: true,
          enable_plugins: true,
        },
        server_version: "0.4.28-mock",
        analytics_environment: "demo",
      });
    }

    // 2. Auth & Current User
    if (
      pathname === "/api/me" ||
      pathname === "/auth/me" ||
      pathname === "/api/v1/auth/me" ||
      pathname === "/auth/status"
    ) {
      return jsonResponse(mockDb.currentUser);
    }

    if (
      pathname === "/auth/send-code" ||
      pathname === "/auth/verify-code" ||
      pathname === "/auth/google" ||
      pathname === "/auth/login"
    ) {
      return jsonResponse({
        token: "mock_jwt_token_autonomous_engineer",
        user: mockDb.currentUser,
      });
    }

    if (pathname === "/auth/logout") {
      return jsonResponse({ success: true });
    }

    if ((pathname === "/api/me" || pathname === "/api/v1/users/me") && method === "PATCH") {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
      Object.assign(mockDb.currentUser, body);
      return jsonResponse(mockDb.currentUser);
    }

    // 3. Workspaces List & Detail
    if (
      (pathname === "/api/workspaces" || pathname === "/api/v1/workspaces") &&
      method === "GET"
    ) {
      return jsonResponse(mockDb.workspaces);
    }

    if (
      (pathname === "/api/workspaces" || pathname === "/api/v1/workspaces") &&
      method === "POST"
    ) {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
      const newWs = {
        id: `ws_${Date.now()}`,
        name: body.name || "New Workspace",
        slug: body.slug || `ws-${Date.now()}`,
        description: body.description || null,
        context: null,
        settings: {},
        repos: [],
        issue_prefix: (body.name || "WS").slice(0, 3).toUpperCase(),
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.workspaces.push(newWs);
      return jsonResponse(newWs);
    }

    const wsMatch = pathname.match(/^\/api(?:\/v1)?\/workspaces\/([^/]+)$/);
    if (wsMatch && method === "GET") {
      const targetSlugOrId = wsMatch[1] ?? "";
      const found =
        mockDb.getWorkspaceBySlug(targetSlugOrId) ??
        mockDb.workspaces.find((w) => w.id === targetSlugOrId);
      if (found) return jsonResponse(found);
      return jsonResponse(mockDb.workspaces[0]);
    }

    // 4. Members
    if (pathname.includes("/members") && method === "GET") {
      return jsonResponse(mockDb.getMembers(wsId));
    }

    // 5. Agents & Runtimes
    if (pathname === "/api/agents/mika" && method === "POST") {
      const mika = mockDb.getAgents(wsId).find((a) => a.system_key === "mika") ?? mockDb.getAgents(wsId)[0];
      return jsonResponse({
        agent: mika,
        session_id: "cs_2",
      });
    }

    if (pathname.endsWith("/agents") && method === "GET") {
      return jsonResponse(mockDb.getAgents(wsId));
    }

    const agentMatch = pathname.match(/\/agents\/([^/]+)$/);
    if (agentMatch && method === "GET") {
      const agentId = agentMatch[1] ?? "";
      const agent = mockDb.getAgents(wsId).find((a) => a.id === agentId);
      if (agent) return jsonResponse(agent);
      return jsonResponse(mockDb.getAgents(wsId)[0] ?? null);
    }

    if (pathname.includes("/agents/") && pathname.endsWith("/skills")) {
      return jsonResponse(mockDb.getSkills(wsId));
    }

    if (pathname.endsWith("/runtimes") && method === "GET") {
      return jsonResponse(mockDb.getRuntimes(wsId));
    }

    if (
      pathname.includes("task-snapshot") ||
      pathname.includes("working-agents") ||
      pathname.includes("presence") ||
      pathname.endsWith("/tasks") ||
      pathname.endsWith("/assignee-frequency")
    ) {
      return jsonResponse([]);
    }

    // 6. Issues & Table Virtualization
    if (pathname.endsWith("/issues/table/groups") && method === "POST") {
      const issues = mockDb.getIssues(wsId);
      const groups = [
        {
          key: "status:in_progress",
          value: { kind: "status" as const, status: "in_progress" },
          count: issues.filter((i) => i.status === "in_progress").length,
        },
        {
          key: "status:in_review",
          value: { kind: "status" as const, status: "in_review" },
          count: issues.filter((i) => i.status === "in_review").length,
        },
        {
          key: "status:todo",
          value: { kind: "status" as const, status: "todo" },
          count: issues.filter((i) => i.status === "todo").length,
        },
        {
          key: "status:done",
          value: { kind: "status" as const, status: "done" },
          count: issues.filter((i) => i.status === "done").length,
        },
        {
          key: "status:backlog",
          value: { kind: "status" as const, status: "backlog" },
          count: issues.filter((i) => i.status === "backlog").length,
        },
      ];
      return jsonResponse({
        query_fingerprint: "mock_fingerprint_groups",
        total: issues.length,
        groups,
        next_cursor: null,
      });
    }

    if (pathname.endsWith("/issues/table/rows") && method === "POST") {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
      const groupKey = body?.group_key;
      let issues = mockDb.getIssues(wsId);
      if (groupKey) {
        const [kind, val] = groupKey.split(":");
        if (kind === "status" && val) {
          issues = issues.filter((i) => i.status === val);
        }
      }
      const rows = issues.map((issue) => ({
        issue,
        direct_child_count: 0,
      }));
      return jsonResponse({
        query_fingerprint: "mock_fingerprint_rows",
        group_key: groupKey || null,
        parent_id: null,
        total: rows.length,
        rows,
        branch_total: rows.length,
        next_cursor: null,
      });
    }

    if (pathname.endsWith("/issues/table/facets") && method === "POST") {
      const issues = mockDb.getIssues(wsId);
      return jsonResponse({
        query_fingerprint: "mock_fingerprint_facets",
        total: issues.length,
        facets: [
          {
            kind: "status",
            values: [
              { key: "in_progress", count: issues.filter((i) => i.status === "in_progress").length },
              { key: "in_review", count: issues.filter((i) => i.status === "in_review").length },
              { key: "todo", count: issues.filter((i) => i.status === "todo").length },
              { key: "done", count: issues.filter((i) => i.status === "done").length },
              { key: "backlog", count: issues.filter((i) => i.status === "backlog").length },
            ],
          },
          {
            kind: "priority",
            values: [
              { key: "urgent", count: issues.filter((i) => i.priority === "urgent").length },
              { key: "high", count: issues.filter((i) => i.priority === "high").length },
              { key: "medium", count: issues.filter((i) => i.priority === "medium").length },
              { key: "low", count: issues.filter((i) => i.priority === "low").length },
            ],
          },
        ],
      });
    }

    if (pathname.endsWith("/issues") && method === "GET") {
      const issues = mockDb.getIssues(wsId);
      return jsonResponse({ issues, total: issues.length });
    }

    if (pathname.endsWith("/issues") && method === "POST") {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
      const newIssue = mockDb.createIssue(wsId, body);
      return jsonResponse(newIssue);
    }

    if (pathname.endsWith("/issues/quick-create") && method === "POST") {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
      const newIssue = mockDb.createIssue(wsId, {
        title: body.title,
        assignee_type: body.assignee_type,
        assignee_id: body.assignee_id,
        project_id: body.project_id,
        priority: body.priority,
        due_date: body.due_date,
      });
      return jsonResponse({ issue: newIssue });
    }

    // Issue Comments & Timeline
    const commentsMatch = pathname.match(/\/issues\/([^/]+)\/comments$/);
    if (commentsMatch) {
      const issueId = commentsMatch[1] ?? "";
      if (method === "GET") {
        return jsonResponse(mockDb.getComments(issueId));
      }
      if (method === "POST") {
        const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
        const comment = mockDb.createComment(issueId, body.content || "");
        return jsonResponse(comment);
      }
    }

    const timelineMatch = pathname.match(/\/issues\/([^/]+)\/timeline$/);
    if (timelineMatch && method === "GET") {
      const issueId = timelineMatch[1] ?? "";
      return jsonResponse(MOCK_TIMELINE[issueId] ?? []);
    }

    if (pathname.match(/\/issues\/([^/]+)\/subscribers$/)) {
      return jsonResponse([]);
    }

    // Move issue
    const moveMatch = pathname.match(/\/issues\/([^/]+)\/move$/);
    if (moveMatch && method === "PUT") {
      const issueId = moveMatch[1] ?? "";
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
      const updated = mockDb.updateIssue(issueId, {
        status: body.status,
        status_category: body.status,
        position: body.position,
      });
      return jsonResponse(updated);
    }

    const issueMatch = pathname.match(/\/issues\/([^/]+)$/);
    if (issueMatch) {
      const issueId = issueMatch[1] ?? "";
      if (method === "GET") {
        const issue = mockDb.getIssue(issueId);
        if (issue) return jsonResponse(issue);
        return jsonResponse(mockDb.getIssues(wsId)[0] ?? null);
      }
      if (method === "PATCH" || method === "PUT") {
        const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
        const updated = mockDb.updateIssue(issueId, body);
        return jsonResponse(updated);
      }
      if (method === "DELETE") {
        mockDb.deleteIssue(issueId);
        return jsonResponse({ success: true });
      }
    }

    // 7. Projects, Squads, Skills, Autopilots, Labels
    if (pathname.endsWith("/projects") && method === "GET") {
      const list = mockDb.getProjects(wsId);
      return jsonResponse({ projects: list, total: list.length });
    }

    const projectMatch = pathname.match(/\/projects\/([^/]+)$/);
    if (projectMatch && method === "GET") {
      const projId = projectMatch[1] ?? "";
      const project = mockDb.getProjects(wsId).find((p) => p.id === projId);
      return jsonResponse(project ?? mockDb.getProjects(wsId)[0]);
    }

    if (pathname.endsWith("/squads") && method === "GET") {
      return jsonResponse(mockDb.getSquads(wsId));
    }

    const squadMatch = pathname.match(/\/squads\/([^/]+)$/);
    if (squadMatch && method === "GET") {
      const sqId = squadMatch[1] ?? "";
      const squad = mockDb.getSquads(wsId).find((s) => s.id === sqId);
      return jsonResponse(squad ?? mockDb.getSquads(wsId)[0]);
    }

    if (pathname.endsWith("/skills") && method === "GET") {
      return jsonResponse(mockDb.getSkills(wsId));
    }

    const skillMatch = pathname.match(/\/skills\/([^/]+)$/);
    if (skillMatch && method === "GET") {
      const skId = skillMatch[1] ?? "";
      const skill = mockDb.getSkills(wsId).find((s) => s.id === skId);
      return jsonResponse(skill ?? mockDb.getSkills(wsId)[0]);
    }

    if (pathname.endsWith("/autopilots") && method === "GET") {
      return jsonResponse({ autopilots: mockDb.getAutopilots(wsId) });
    }

    const autopilotMatch = pathname.match(/\/autopilots\/([^/]+)$/);
    if (autopilotMatch && method === "GET") {
      const apId = autopilotMatch[1] ?? "";
      const ap = mockDb.getAutopilots(wsId).find((a) => a.id === apId);
      return jsonResponse(ap ?? mockDb.getAutopilots(wsId)[0]);
    }

    if (pathname.endsWith("/labels") && method === "GET") {
      const labels = mockDb.getLabels(wsId);
      return jsonResponse({ labels, total: labels.length });
    }

    if (pathname === "/api/inbox" && method === "GET") {
      return jsonResponse(mockDb.getInbox(wsId));
    }

    if (pathname.endsWith("/inbox/unread-count")) {
      return jsonResponse({ count: 2 });
    }

    if (pathname.endsWith("/inbox/unread-summary")) {
      return jsonResponse([{ workspace_id: "ws_demo", count: 2 }]);
    }

    if (pathname.endsWith("/inbox/archived")) {
      return jsonResponse([]);
    }

    // 8. Chat
    if (pathname.endsWith("/chat/sessions") && method === "GET") {
      return jsonResponse(mockDb.getChatSessions(wsId));
    }

    const chatMsgsMatch = pathname.match(/\/chat\/sessions\/([^/]+)\/messages$/);
    if (chatMsgsMatch) {
      const sessionId = chatMsgsMatch[1] ?? "";
      if (method === "GET") {
        return jsonResponse(mockDb.getChatMessages(sessionId));
      }
      if (method === "POST") {
        const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
        const msg = mockDb.sendChatMessage(sessionId, body.content || "");
        return jsonResponse(msg);
      }
    }

    if (pathname.endsWith("/chat/pinned-agents") && method === "GET") {
      return jsonResponse([{ agent_id: "agt_claude", position: 1 }]);
    }

    // 9. Search
    if (pathname.includes("/search/issues") || pathname.includes("/issues/search")) {
      const q = searchParams.get("q")?.toLowerCase() || "";
      const results = mockDb.getIssues(wsId).filter(
        (i) => i.title.toLowerCase().includes(q) || i.identifier.toLowerCase().includes(q),
      );
      return jsonResponse({ issues: results, total: results.length });
    }

    if (pathname.includes("/search/projects")) {
      const q = searchParams.get("q")?.toLowerCase() || "";
      const results = mockDb.getProjects(wsId).filter((p) => p.title.toLowerCase().includes(q));
      return jsonResponse({ projects: results, total: results.length });
    }

    // 10. Billing & Entitlements
    if (pathname.includes("/billing")) {
      return jsonResponse({
        balance: { amount_cents: 25000, currency: "usd" },
        entitlements: { max_agents: 50, max_members: 20, max_runtimes: 10 },
      });
    }

    // Fallback: return empty array for collection-like routes, or empty object
    if (method === "GET") {
      if (pathname.endsWith("s") || pathname.includes("list")) {
        return jsonResponse([]);
      }
      return jsonResponse({});
    }

    return jsonResponse({ success: true });
  }
}

export const mockRouter = new MockRouter();
