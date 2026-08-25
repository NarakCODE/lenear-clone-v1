Linear-Style Project Management API Design

## 1. Overview

This document defines a REST API for a modern project and issue management platform inspired by the Linear product model, without any AI or agent functionality.

The core hierarchy is:

```text
User
│
└── Workspace
    │
    ├── Members
    │
    ├── Teams
    │   ├── Members
    │   ├── Statuses
    │   ├── Cycles
    │   └── Issues
    │
    ├── Projects
    │   ├── Teams
    │   ├── Issues
    │   └── Resources
    │
    ├── Issues
    │   ├── Comments
    │   ├── Labels
    │   ├── Properties
    │   ├── Subscribers
    │   └── Attachments
    │
    ├── Views
    ├── Inbox
    ├── Integrations
    └── Settings
```

Base API prefix:

```http
/api/v1
```

Workspace-scoped resources use:

```http
/api/v1/workspaces/{workspaceId}/...
```

---

# 2. Authentication

```http
POST   /auth/send-code
POST   /auth/verify-code
POST   /auth/google
POST   /auth/logout
```

Sessions:

```http
GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/{sessionId}
DELETE /api/v1/auth/sessions
```

---

# 3. Current User

```http
GET    /api/v1/me
PATCH  /api/v1/me
```

Onboarding:

```http
GET    /api/v1/me/onboarding
PATCH  /api/v1/me/onboarding
POST   /api/v1/me/onboarding/complete
```

Preferences:

```http
GET    /api/v1/me/preferences
PATCH  /api/v1/me/preferences
```

Example:

```json
{
  "name": "Taylor",
  "timezone": "Asia/Phnom_Penh",
  "language": "en"
}
```

---

# 4. Workspaces

```http
GET    /api/v1/workspaces
POST   /api/v1/workspaces

GET    /api/v1/workspaces/{workspaceId}
PATCH  /api/v1/workspaces/{workspaceId}
DELETE /api/v1/workspaces/{workspaceId}

POST   /api/v1/workspaces/{workspaceId}/leave
```

Create workspace:

```json
{
  "name": "Acme",
  "slug": "acme"
}
```

---

# 5. Workspace Members

```http
GET    /api/v1/workspaces/{workspaceId}/members
GET    /api/v1/workspaces/{workspaceId}/members/{memberId}

PATCH  /api/v1/workspaces/{workspaceId}/members/{memberId}
DELETE /api/v1/workspaces/{workspaceId}/members/{memberId}
```

Roles:

```text
OWNER
ADMIN
MEMBER
```

Change role:

```json
{
  "role": "ADMIN"
}
```

---

# 6. Invitations

Workspace invitations:

```http
GET    /api/v1/workspaces/{workspaceId}/invitations
POST   /api/v1/workspaces/{workspaceId}/invitations

GET    /api/v1/workspaces/{workspaceId}/invitations/{invitationId}
DELETE /api/v1/workspaces/{workspaceId}/invitations/{invitationId}

POST   /api/v1/workspaces/{workspaceId}/invitations/{invitationId}/resend
```

Current user's invitations:

```http
GET    /api/v1/invitations
GET    /api/v1/invitations/{invitationId}

POST   /api/v1/invitations/{invitationId}/accept
POST   /api/v1/invitations/{invitationId}/decline
```

---

# 7. Share Links

```http
GET    /api/v1/share-links/{code}
POST   /api/v1/share-links/{code}/join
```

Workspace management:

```http
GET    /api/v1/workspaces/{workspaceId}/share-links
POST   /api/v1/workspaces/{workspaceId}/share-links

DELETE /api/v1/workspaces/{workspaceId}/share-links/{shareLinkId}
```

---

# 8. Teams

Teams are a core part of the hierarchy.

```http
GET    /api/v1/workspaces/{workspaceId}/teams
POST   /api/v1/workspaces/{workspaceId}/teams

GET    /api/v1/workspaces/{workspaceId}/teams/{teamId}
PATCH  /api/v1/workspaces/{workspaceId}/teams/{teamId}
DELETE /api/v1/workspaces/{workspaceId}/teams/{teamId}
```

Create team:

```json
{
  "name": "Engineering",
  "key": "ENG",
  "description": "Engineering team",
  "icon": "code"
}
```

Issue identifier examples:

```text
ENG-1
ENG-2
ENG-3
```

---

# 9. Team Members

```http
GET    /api/v1/workspaces/{workspaceId}/teams/{teamId}/members

POST   /api/v1/workspaces/{workspaceId}/teams/{teamId}/members
DELETE /api/v1/workspaces/{workspaceId}/teams/{teamId}/members/{memberId}
```

Bulk add:

```http
POST /api/v1/workspaces/{workspaceId}/teams/{teamId}/members/batch
```

```json
{
  "memberIds": ["member-1", "member-2"]
}
```

---

# 10. Team Settings

```http
GET   /api/v1/workspaces/{workspaceId}/teams/{teamId}/settings
PATCH /api/v1/workspaces/{workspaceId}/teams/{teamId}/settings
```

Example:

```json
{
  "issueKey": "ENG",
  "defaultStatusId": "status_uuid",
  "defaultPriority": "NO_PRIORITY",
  "autoCloseCompletedIssues": false
}
```

---

# 11. Team Issue Statuses

Workflows are team-scoped.

```http
GET    /api/v1/workspaces/{workspaceId}/teams/{teamId}/statuses
POST   /api/v1/workspaces/{workspaceId}/teams/{teamId}/statuses

GET    /api/v1/workspaces/{workspaceId}/teams/{teamId}/statuses/{statusId}
PATCH  /api/v1/workspaces/{workspaceId}/teams/{teamId}/statuses/{statusId}
DELETE /api/v1/workspaces/{workspaceId}/teams/{teamId}/statuses/{statusId}
```

Reorder:

```http
POST /api/v1/workspaces/{workspaceId}/teams/{teamId}/statuses/reorder
```

Suggested status categories:

```text
BACKLOG
UNSTARTED
STARTED
COMPLETED
CANCELED
```

Example workflow:

```text
Backlog
Todo
In Progress
In Review
Done
Canceled
```

---

# 12. Cycles

Cycles represent sprint/iteration-style planning.

```http
GET    /api/v1/workspaces/{workspaceId}/teams/{teamId}/cycles
POST   /api/v1/workspaces/{workspaceId}/teams/{teamId}/cycles

GET    /api/v1/workspaces/{workspaceId}/teams/{teamId}/cycles/{cycleId}
PATCH  /api/v1/workspaces/{workspaceId}/teams/{teamId}/cycles/{cycleId}
DELETE /api/v1/workspaces/{workspaceId}/teams/{teamId}/cycles/{cycleId}
```

Current cycle:

```http
GET /api/v1/workspaces/{workspaceId}/teams/{teamId}/cycles/current
```

Upcoming cycles:

```http
GET /api/v1/workspaces/{workspaceId}/teams/{teamId}/cycles/upcoming
```

Cycle issues:

```http
GET /api/v1/workspaces/{workspaceId}/teams/{teamId}/cycles/{cycleId}/issues
```

Cycle progress:

```http
GET /api/v1/workspaces/{workspaceId}/teams/{teamId}/cycles/{cycleId}/progress
```

Example:

```json
{
  "name": "Cycle 32",
  "number": 32,
  "startsAt": "2026-08-24",
  "endsAt": "2026-09-06"
}
```

---

# 13. Projects

Projects belong to a workspace and can span multiple teams.

```http
GET    /api/v1/workspaces/{workspaceId}/projects
POST   /api/v1/workspaces/{workspaceId}/projects

GET    /api/v1/workspaces/{workspaceId}/projects/{projectId}
PATCH  /api/v1/workspaces/{workspaceId}/projects/{projectId}
DELETE /api/v1/workspaces/{workspaceId}/projects/{projectId}
```

Search:

```http
GET /api/v1/workspaces/{workspaceId}/projects/search?q=mobile
```

Example:

```json
{
  "name": "Mobile App v2",
  "summary": "Redesign the mobile application.",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "startDate": "2026-09-01",
  "targetDate": "2026-11-30"
}
```

---

# 14. Project Teams

```http
GET    /api/v1/workspaces/{workspaceId}/projects/{projectId}/teams

POST   /api/v1/workspaces/{workspaceId}/projects/{projectId}/teams
DELETE /api/v1/workspaces/{workspaceId}/projects/{projectId}/teams/{teamId}
```

Example:

```text
Mobile App v2
├── Engineering
├── Product
└── Design
```

---

# 15. Project Members and Lead

```http
GET    /api/v1/workspaces/{workspaceId}/projects/{projectId}/members

POST   /api/v1/workspaces/{workspaceId}/projects/{projectId}/members
DELETE /api/v1/workspaces/{workspaceId}/projects/{projectId}/members/{memberId}
```

Project lead:

```http
PUT    /api/v1/workspaces/{workspaceId}/projects/{projectId}/lead
DELETE /api/v1/workspaces/{workspaceId}/projects/{projectId}/lead
```

---

# 16. Project Resources

```http
GET    /api/v1/workspaces/{workspaceId}/projects/{projectId}/resources
POST   /api/v1/workspaces/{workspaceId}/projects/{projectId}/resources

PATCH  /api/v1/workspaces/{workspaceId}/projects/{projectId}/resources/{resourceId}
DELETE /api/v1/workspaces/{workspaceId}/projects/{projectId}/resources/{resourceId}
```

Resource types:

```text
LINK
DOCUMENT
FIGMA
GITHUB
GITLAB
OTHER
```

---

# 17. Project Progress

```http
GET /api/v1/workspaces/{workspaceId}/projects/{projectId}/progress
```

Example:

```json
{
  "totalIssues": 92,
  "completedIssues": 61,
  "inProgressIssues": 18,
  "remainingIssues": 13,
  "progress": 66.3
}
```

---

# 18. Issues

Collection:

```http
GET  /api/v1/workspaces/{workspaceId}/issues
POST /api/v1/workspaces/{workspaceId}/issues
```

Specific issue:

```http
GET    /api/v1/workspaces/{workspaceId}/issues/{issueId}
PATCH  /api/v1/workspaces/{workspaceId}/issues/{issueId}
DELETE /api/v1/workspaces/{workspaceId}/issues/{issueId}
```

`{issueId}` can support either:

```text
UUID
ENG-123
```

Example:

```http
GET /api/v1/workspaces/acme/issues/ENG-123
```

---

# 19. Create Issue

```http
POST /api/v1/workspaces/{workspaceId}/issues
```

```json
{
  "teamId": "team_uuid",
  "title": "Implement magic-link authentication",
  "description": "Add passwordless authentication.",
  "statusId": "status_uuid",
  "priority": "HIGH",
  "assigneeId": "member_uuid",
  "projectId": "project_uuid",
  "cycleId": "cycle_uuid",
  "labelIds": ["label_uuid"]
}
```

Relationships:

```text
workspaceId  required
teamId       required

projectId    optional
cycleId      optional
assigneeId   optional
parentId     optional
```

---

# 20. Quick Create Issue

```http
POST /api/v1/workspaces/{workspaceId}/issues/quick-create
```

```json
{
  "teamId": "team_uuid",
  "title": "Fix login form spacing"
}
```

---

# 21. Team Issues

```http
GET /api/v1/workspaces/{workspaceId}/teams/{teamId}/issues
```

Equivalent to:

```http
GET /api/v1/workspaces/{workspaceId}/issues?teamId={teamId}
```

---

# 22. Project Issues

```http
GET /api/v1/workspaces/{workspaceId}/projects/{projectId}/issues
```

Equivalent to:

```http
GET /api/v1/workspaces/{workspaceId}/issues?projectId={projectId}
```

---

# 23. Issue Filtering

```http
GET /api/v1/workspaces/{workspaceId}/issues
```

Supported filters:

```text
?teamId=
&projectId=
&cycleId=
&statusId=
&assigneeId=
&creatorId=
&priority=
&labelId=
&parentId=
&createdAt=
&updatedAt=
&sort=
&order=
&cursor=
&limit=
```

Example:

```http
GET /api/v1/workspaces/ws_123/issues
    ?teamId=eng
    &statusId=in_progress
    &assigneeId=user_123
    &sort=priority
    &order=desc
```

---

# 24. Issue Search

```http
GET /api/v1/workspaces/{workspaceId}/issues/search
```

Example:

```http
GET /api/v1/workspaces/{workspaceId}/issues/search?q=authentication
```

---

# 25. Advanced Issue Query

```http
POST /api/v1/workspaces/{workspaceId}/issues/query
```

```json
{
  "filters": {
    "teamIds": ["team_uuid"],
    "statusIds": ["status_uuid"],
    "assigneeIds": ["member_uuid"],
    "projectIds": ["project_uuid"],
    "priorities": ["HIGH", "URGENT"]
  },
  "sort": [
    {
      "field": "priority",
      "direction": "desc"
    }
  ],
  "limit": 50
}
```

---

# 26. Issue Grouping

```http
POST /api/v1/workspaces/{workspaceId}/issues/groups
```

```json
{
  "groupBy": "status",
  "filters": {}
}
```

Supported grouping:

```text
status
priority
assignee
project
team
cycle
label
```

---

# 27. Issue Facets

```http
POST /api/v1/workspaces/{workspaceId}/issues/facets
```

Example:

```json
{
  "statuses": [
    {
      "id": "todo",
      "count": 29
    }
  ],
  "priorities": [
    {
      "value": "HIGH",
      "count": 14
    }
  ]
}
```

---

# 28. Move / Reorder Issue

```http
POST /api/v1/workspaces/{workspaceId}/issues/{issueId}/move
```

```json
{
  "statusId": "status_uuid",
  "beforeIssueId": "issue_uuid"
}
```

Use cases:

```text
Kanban drag-and-drop
List reordering
Backlog ordering
```

---

# 29. Batch Issue Operations

```http
POST /api/v1/workspaces/{workspaceId}/issues/batch-update
POST /api/v1/workspaces/{workspaceId}/issues/batch-delete
```

Example:

```json
{
  "issueIds": ["issue1", "issue2"],
  "changes": {
    "priority": "HIGH",
    "statusId": "status_uuid"
  }
}
```

---

# 30. Sub-Issues

Create:

```http
POST /api/v1/workspaces/{workspaceId}/issues/{issueId}/children
```

List:

```http
GET /api/v1/workspaces/{workspaceId}/issues/{issueId}/children
```

Progress:

```http
GET /api/v1/workspaces/{workspaceId}/issues/{issueId}/child-progress
```

Example:

```text
ENG-100 Authentication

├── ENG-101 Login
├── ENG-102 Registration
├── ENG-103 Magic Link
└── ENG-104 Session Management
```

---

# 31. Issue Timeline

```http
GET /api/v1/workspaces/{workspaceId}/issues/{issueId}/timeline
```

Possible events:

```text
issue.created
status.changed
assignee.changed
priority.changed
project.changed
cycle.changed
label.added
comment.created
attachment.added
```

---

# 32. Issue Subscribers

```http
GET  /api/v1/workspaces/{workspaceId}/issues/{issueId}/subscribers

POST /api/v1/workspaces/{workspaceId}/issues/{issueId}/subscribe
POST /api/v1/workspaces/{workspaceId}/issues/{issueId}/unsubscribe
```

---

# 33. Labels

Workspace labels:

```http
GET    /api/v1/workspaces/{workspaceId}/labels
POST   /api/v1/workspaces/{workspaceId}/labels

GET    /api/v1/workspaces/{workspaceId}/labels/{labelId}
PATCH  /api/v1/workspaces/{workspaceId}/labels/{labelId}
DELETE /api/v1/workspaces/{workspaceId}/labels/{labelId}
```

Issue label assignment:

```http
POST   /api/v1/workspaces/{workspaceId}/issues/{issueId}/labels
DELETE /api/v1/workspaces/{workspaceId}/issues/{issueId}/labels/{labelId}
```

---

# 34. Issue Reactions

```http
POST   /api/v1/workspaces/{workspaceId}/issues/{issueId}/reactions
DELETE /api/v1/workspaces/{workspaceId}/issues/{issueId}/reactions/{reactionId}
```

---

# 35. Comments

```http
GET  /api/v1/workspaces/{workspaceId}/issues/{issueId}/comments
POST /api/v1/workspaces/{workspaceId}/issues/{issueId}/comments
```

Specific comment:

```http
GET    /api/v1/workspaces/{workspaceId}/comments/{commentId}
PATCH  /api/v1/workspaces/{workspaceId}/comments/{commentId}
DELETE /api/v1/workspaces/{workspaceId}/comments/{commentId}
```

---

# 36. Comment Reactions and Threads

```http
POST   /api/v1/workspaces/{workspaceId}/comments/{commentId}/reactions
DELETE /api/v1/workspaces/{workspaceId}/comments/{commentId}/reactions/{reactionId}
```

Resolve:

```http
POST   /api/v1/workspaces/{workspaceId}/comments/{commentId}/resolve
DELETE /api/v1/workspaces/{workspaceId}/comments/{commentId}/resolve
```

---

# 37. Custom Properties

Definitions:

```http
GET    /api/v1/workspaces/{workspaceId}/properties
POST   /api/v1/workspaces/{workspaceId}/properties

GET    /api/v1/workspaces/{workspaceId}/properties/{propertyId}
PATCH  /api/v1/workspaces/{workspaceId}/properties/{propertyId}
DELETE /api/v1/workspaces/{workspaceId}/properties/{propertyId}
```

Issue value:

```http
PUT    /api/v1/workspaces/{workspaceId}/issues/{issueId}/properties/{propertyId}
DELETE /api/v1/workspaces/{workspaceId}/issues/{issueId}/properties/{propertyId}
```

Types:

```text
TEXT
NUMBER
DATE
CHECKBOX
SELECT
MULTI_SELECT
USER
URL
```

---

# 38. Saved Views

```http
GET    /api/v1/workspaces/{workspaceId}/views
POST   /api/v1/workspaces/{workspaceId}/views

GET    /api/v1/workspaces/{workspaceId}/views/{viewId}
PATCH  /api/v1/workspaces/{workspaceId}/views/{viewId}
DELETE /api/v1/workspaces/{workspaceId}/views/{viewId}
```

Example:

```json
{
  "name": "Frontend Bugs",
  "visibility": "WORKSPACE",
  "filters": {
    "teamIds": ["engineering"],
    "labelIds": ["bug"],
    "statuses": ["TODO", "IN_PROGRESS"]
  },
  "groupBy": "status",
  "orderBy": "priority"
}
```

Visibility:

```text
PRIVATE
TEAM
WORKSPACE
```

---

# 39. Favorites

```http
GET  /api/v1/workspaces/{workspaceId}/favorites
POST /api/v1/workspaces/{workspaceId}/favorites

DELETE /api/v1/workspaces/{workspaceId}/favorites/{favoriteId}
```

Favorite types:

```text
Project
Team
View
Issue
```

---

# 40. Recently Viewed

```http
GET /api/v1/workspaces/{workspaceId}/recent
```

Useful for:

```text
Command menu
Search
Quick navigation
```

---

# 41. Global Search

```http
GET /api/v1/workspaces/{workspaceId}/search
```

Example:

```http
GET /api/v1/workspaces/ws1/search?q=authentication
```

Response:

```json
{
  "issues": [],
  "projects": [],
  "teams": [],
  "members": [],
  "views": []
}
```

---

# 42. Inbox

```http
GET /api/v1/workspaces/{workspaceId}/inbox
GET /api/v1/workspaces/{workspaceId}/inbox/archived

GET /api/v1/workspaces/{workspaceId}/inbox/unread-count
```

Actions:

```http
POST /api/v1/workspaces/{workspaceId}/inbox/mark-all-read
POST /api/v1/workspaces/{workspaceId}/inbox/archive-all
POST /api/v1/workspaces/{workspaceId}/inbox/archive-all-read
```

Single notification:

```http
POST /api/v1/workspaces/{workspaceId}/inbox/{notificationId}/read
POST /api/v1/workspaces/{workspaceId}/inbox/{notificationId}/unread

POST /api/v1/workspaces/{workspaceId}/inbox/{notificationId}/archive
POST /api/v1/workspaces/{workspaceId}/inbox/{notificationId}/unarchive
```

---

# 43. Notification Preferences

User-wide:

```http
GET   /api/v1/notification-preferences
PATCH /api/v1/notification-preferences
```

Workspace overrides:

```http
GET   /api/v1/workspaces/{workspaceId}/notification-preferences
PATCH /api/v1/workspaces/{workspaceId}/notification-preferences
```

---

# 44. Attachments

Upload:

```http
POST /api/v1/workspaces/{workspaceId}/files
```

Attachment:

```http
GET    /api/v1/workspaces/{workspaceId}/attachments/{attachmentId}
DELETE /api/v1/workspaces/{workspaceId}/attachments/{attachmentId}
```

Download:

```http
GET /api/v1/workspaces/{workspaceId}/attachments/{attachmentId}/download
```

Associate with issue:

```http
POST /api/v1/workspaces/{workspaceId}/issues/{issueId}/attachments
```

---

# 45. Issue Templates

```http
GET    /api/v1/workspaces/{workspaceId}/issue-templates
POST   /api/v1/workspaces/{workspaceId}/issue-templates

GET    /api/v1/workspaces/{workspaceId}/issue-templates/{templateId}
PATCH  /api/v1/workspaces/{workspaceId}/issue-templates/{templateId}
DELETE /api/v1/workspaces/{workspaceId}/issue-templates/{templateId}
```

Team templates:

```http
GET /api/v1/workspaces/{workspaceId}/teams/{teamId}/issue-templates
```

---

# 46. GitHub Integration

```http
GET  /api/v1/workspaces/{workspaceId}/integrations/github
POST /api/v1/workspaces/{workspaceId}/integrations/github/connect

DELETE /api/v1/workspaces/{workspaceId}/integrations/github/{installationId}
```

Repositories:

```http
GET /api/v1/workspaces/{workspaceId}/integrations/github/repositories
```

Issue pull requests:

```http
GET /api/v1/workspaces/{workspaceId}/issues/{issueId}/pull-requests
```

Webhook:

```http
POST /api/v1/webhooks/github
```

---

# 47. Slack Integration

```http
GET  /api/v1/workspaces/{workspaceId}/integrations/slack
POST /api/v1/workspaces/{workspaceId}/integrations/slack/connect

DELETE /api/v1/workspaces/{workspaceId}/integrations/slack/{installationId}
```

OAuth callback:

```http
GET /api/v1/integrations/slack/callback
```

---

# 48. GitLab / Self-Hosted VCS

```http
GET    /api/v1/workspaces/{workspaceId}/integrations/vcs
POST   /api/v1/workspaces/{workspaceId}/integrations/vcs

GET    /api/v1/workspaces/{workspaceId}/integrations/vcs/{connectionId}
PATCH  /api/v1/workspaces/{workspaceId}/integrations/vcs/{connectionId}
DELETE /api/v1/workspaces/{workspaceId}/integrations/vcs/{connectionId}
```

Webhook:

```http
POST /api/v1/webhooks/vcs/{connectionId}
```

---

# 49. Generic Webhooks

```http
GET    /api/v1/workspaces/{workspaceId}/webhooks
POST   /api/v1/workspaces/{workspaceId}/webhooks

GET    /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}
PATCH  /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}
DELETE /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}
```

Rotate secret:

```http
POST /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}/rotate-secret
```

Deliveries:

```http
GET  /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}/deliveries

GET  /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}/deliveries/{deliveryId}

POST /api/v1/workspaces/{workspaceId}/webhooks/{webhookId}/deliveries/{deliveryId}/retry
```

Events:

```text
issue.created
issue.updated
issue.deleted

comment.created
comment.updated

project.created
project.updated

cycle.started
cycle.completed

member.joined
member.removed
```

---

# 50. Personal Access Tokens

```http
GET    /api/v1/tokens
POST   /api/v1/tokens

GET    /api/v1/tokens/{tokenId}
DELETE /api/v1/tokens/{tokenId}

POST   /api/v1/tokens/{tokenId}/renew
```

---

# 51. Workspace Activity

```http
GET /api/v1/workspaces/{workspaceId}/activity
```

Filters:

```text
?actorId=
&teamId=
&projectId=
&issueId=
&event=
&from=
&to=
```

---

# 52. Audit Logs

```http
GET /api/v1/workspaces/{workspaceId}/audit-logs
```

Example event names:

```text
member.invited
member.role_changed
team.created
issue.deleted
project.deleted
integration.connected
token.created
```

---

# 53. Dashboard

```http
GET /api/v1/workspaces/{workspaceId}/dashboard/overview

GET /api/v1/workspaces/{workspaceId}/dashboard/issues/by-status
GET /api/v1/workspaces/{workspaceId}/dashboard/issues/by-priority
GET /api/v1/workspaces/{workspaceId}/dashboard/issues/by-team
GET /api/v1/workspaces/{workspaceId}/dashboard/issues/by-assignee

GET /api/v1/workspaces/{workspaceId}/dashboard/issues/created
GET /api/v1/workspaces/{workspaceId}/dashboard/issues/completed

GET /api/v1/workspaces/{workspaceId}/dashboard/projects/progress
GET /api/v1/workspaces/{workspaceId}/dashboard/cycles/progress

GET /api/v1/workspaces/{workspaceId}/dashboard/activity
```

---

# 54. Billing

Plans:

```http
GET /api/v1/billing/plans
```

Workspace subscription:

```http
GET /api/v1/workspaces/{workspaceId}/billing/subscription
GET /api/v1/workspaces/{workspaceId}/billing/entitlements

POST /api/v1/workspaces/{workspaceId}/billing/checkout
POST /api/v1/workspaces/{workspaceId}/billing/portal
```

Seats:

```http
GET  /api/v1/workspaces/{workspaceId}/billing/seats
POST /api/v1/workspaces/{workspaceId}/billing/seats/reconcile
```

Stripe webhook:

```http
POST /api/v1/webhooks/stripe
```

---

# 55. Presence

```http
GET /api/v1/workspaces/{workspaceId}/presence
```

Realtime presence should primarily use WebSocket.

---

# 56. Realtime WebSocket

```http
GET /ws
```

Suggested events:

```text
workspace:updated

team:created
team:updated
team:deleted

issue:created
issue:updated
issue:deleted
issue:moved

comment:created
comment:updated
comment:deleted

project:created
project:updated
project:deleted

cycle:created
cycle:updated

inbox:new
inbox:updated

member:joined
member:updated
member:left

presence:joined
presence:left
presence:sync
```

---

# 57. API Response Convention

Single item:

```json
{
  "data": {
    "id": "..."
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Collection:

```json
{
  "data": [{}, {}],
  "meta": {
    "nextCursor": "cursor_abc",
    "hasMore": true
  }
}
```

Error:

```json
{
  "error": {
    "code": "ISSUE_NOT_FOUND",
    "message": "Issue not found",
    "details": null
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

---

# 58. Pagination

Use cursor-based pagination:

```http
GET /api/v1/workspaces/{workspaceId}/issues
    ?limit=50
    &cursor=abc123
```

Response:

```json
{
  "data": [],
  "meta": {
    "nextCursor": "xyz456",
    "hasMore": true
  }
}
```

Recommended for:

- Issues
- Comments
- Inbox
- Activity
- Audit logs
- Timelines
- Search results

---

# 59. Final API Tree

```text
/api/v1
│
├── me
├── auth
├── tokens
│
├── workspaces
│   └── {workspaceId}
│       │
│       ├── members
│       ├── invitations
│       ├── share-links
│       │
│       ├── teams
│       │   └── {teamId}
│       │       ├── members
│       │       ├── settings
│       │       ├── statuses
│       │       ├── cycles
│       │       ├── issues
│       │       └── issue-templates
│       │
│       ├── projects
│       │   └── {projectId}
│       │       ├── teams
│       │       ├── members
│       │       ├── resources
│       │       ├── issues
│       │       └── progress
│       │
│       ├── issues
│       │   ├── search
│       │   ├── query
│       │   ├── groups
│       │   ├── facets
│       │   ├── quick-create
│       │   ├── batch-update
│       │   ├── batch-delete
│       │   │
│       │   └── {issueId}
│       │       ├── children
│       │       ├── timeline
│       │       ├── comments
│       │       ├── labels
│       │       ├── properties
│       │       ├── subscribers
│       │       ├── reactions
│       │       ├── attachments
│       │       ├── pull-requests
│       │       └── move
│       │
│       ├── comments
│       ├── labels
│       ├── properties
│       ├── issue-templates
│       │
│       ├── views
│       ├── favorites
│       ├── recent
│       ├── search
│       │
│       ├── inbox
│       ├── notification-preferences
│       │
│       ├── files
│       ├── attachments
│       │
│       ├── integrations
│       │   ├── github
│       │   ├── slack
│       │   └── vcs
│       │
│       ├── webhooks
│       ├── activity
│       ├── audit-logs
│       ├── dashboard
│       ├── billing
│       └── presence
│
├── invitations
├── share-links
├── notification-preferences
│
└── webhooks
    ├── github
    ├── vcs
    └── stripe
```

---

# 60. Recommended MVP Scope

## V1

```text
01. Authentication
02. Users
03. Workspaces
04. Members
05. Invitations

06. Teams
07. Team Members
08. Team Statuses

09. Issues
10. Sub-Issues
11. Comments
12. Labels

13. Projects
14. Project Teams

15. Cycles

16. Inbox
17. Notifications

18. Search
19. Views

20. Attachments
21. Realtime
```

## V2

```text
GitHub
Slack
Webhooks
Custom Properties
Templates
Favorites
Activity
Dashboard
Audit Logs
Billing
```

---

# 61. Core Product Model

The final product hierarchy is:

```text
Workspace
   ↓
Team
   ↓
Cycle / Project
   ↓
Issue
   ↓
Sub-Issue / Comment
```

This structure provides a clean foundation for a modern Linear-style project management platform without any AI or agent dependencies.
