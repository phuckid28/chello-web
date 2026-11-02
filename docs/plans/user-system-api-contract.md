# Chella — User System API Contract (v7)

Shared, binding contract for `chello-api` (Express + MongoDB, base `/v1`) and `chello-web` (React + MUI + Redux).
All responses JSON. Errors: `{ statusCode, message }` (existing `errorHandlingMiddleware`). Auth = existing httpOnly cookies `accessToken` / `refreshToken` (+ Bearer fallback). All new authed routes use `authMiddleware.isAuthorized`.

## 0. Conventions
- IDs are Mongo ObjectId strings. Timestamps are ms epoch numbers.
- Pagination: `?cursor=<lastId>&limit=<n>` → `{ items: [], nextCursor: string|null }`.
- `PublicUser` (safe shape, never contains password/tokens/secrets):
  `{ _id, username, displayName, avatar, bannerUrl, jobTitle, department, bio, timezone, status, skills, socialLinks, createdAt }`
- `SelfUser` = `pickUser` extended: `PublicUser + { email, role, isActive, locale, workingHours, preferences, notificationSettings, privacy, twoFactorEnabled, consents, deletionScheduledAt, usernameChangedAt, updatedAt }`
- CSRF: every non-GET request from the web MUST send header `X-Requested-With: XMLHttpRequest` (set globally in `authorizeAxios`). API rejects non-GET requests lacking it **or** with an `Origin` not in the CORS whitelist (403). Exempt: none.

## 1. Auth & Sessions (`/v1/users`)
| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/register` | `{ email, password, acceptTerms: true, termsVersion }` | 201 `{ message }` — neutral, same response whether email exists or not (if exists & active: send "someone tried to register" email; if exists & inactive: resend verification) |
| PUT | `/verify` | `{ email, token }` | `SelfUser` (token stored as SHA-256 hash, TTL 24h) |
| POST | `/resend_verification` | `{ email }` | 200 neutral `{ message }` (max 3/hour/email) |
| POST | `/login` | `{ email, password, totp?, backupCode? }` | `SelfUser`, or **401 `{ statusCode, message, code: 'TOTP_REQUIRED' }`** when 2FA enabled and no code; 423 `code:'ACCOUNT_LOCKED'` with `lockedUntil` after 5 failures (15 min) |
| GET | `/refresh_token` | — | rotates refresh token (cookie). Reuse of a consumed token ⇒ revoke whole family, 403 |
| DELETE | `/logout` | — | revokes current session + clears cookies |
| POST | `/forgot_password` | `{ email }` | 200 neutral (token 32 bytes, SHA-256 stored, 15 min, single use) |
| PUT | `/reset_password` | `{ email, token, newPassword }` | 200 `{ message }`; revokes all sessions |
| PUT | `/password` | `{ currentPassword, newPassword }` | 200; revokes all sessions **except current** (legacy `PUT /update` with `current_password/new_password` keeps working and does the same) |
| GET | `/sessions` | — | `[{ _id, deviceName, browser, os, ip, createdAt, lastUsedAt, current: bool }]` |
| DELETE | `/sessions/:sessionId` | — | revoke one |
| DELETE | `/sessions` | — | revoke all except current |
| GET | `/audit_logs` | `?limit=50` | `[{ _id, event, ip, userAgent, meta, createdAt }]` events: `login_success, login_failed, account_locked, logout, password_changed, password_reset, session_revoked, token_reuse_detected, totp_enabled, totp_disabled, email_verified, profile_updated, username_changed, data_exported, deletion_scheduled, deletion_cancelled` |

Password policy (both sides): ≥ 8 chars, ≥1 letter + ≥1 digit, max 128. Web shows strength meter (no external lib needed; simple scorer).

### 2FA TOTP (RFC 6238, SHA1, 6 digits, 30s, ±1 window) — implemented with Node `crypto`, no new deps
| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/2fa/setup` | — | `{ secret, otpauthUrl }` (pending, not yet enabled) |
| POST | `/2fa/enable` | `{ code }` | `{ backupCodes: [10 strings] }` (shown once, stored hashed) |
| POST | `/2fa/disable` | `{ password, code }` | 200 |
| POST | `/2fa/backup_codes` | `{ password }` | `{ backupCodes }` regenerate |
Web renders QR from `otpauthUrl` via `https://api.qrserver.com/v1/create-qr-code/?data=` **or** shows the secret for manual entry (prefer a tiny local QR lib only if already installed; otherwise manual secret + link).

## 2. Profile & Preferences (`/v1/users`)
| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/me` | — | `SelfUser` |
| PUT | `/profile` | any of `{ displayName(1–50), bio(≤280), jobTitle(≤60), department(≤60), timezone(IANA), locale('vi'|'en'|'ja'|'ko'), workingHours{start:'09:00',end:'18:00',days:[1..5]}, skills[≤15, each ≤30], socialLinks[≤5 {label,url https only}], avatar(url|null), bannerUrl(url|null) }` | `SelfUser` |
| PUT | `/username` | `{ username }` regex `^[a-z0-9._-]{3,30}$`, unique, 1 change / 30 days | `SelfUser` |
| PUT | `/status` | `{ emoji?, text?(≤80), mode:'available'|'focus'|'meeting'|'ooo', until?:ms|null }` | `SelfUser` |
| PUT | `/preferences` | partial `{ theme, fx:{...}, language, bilingual, density:'comfortable'|'compact', defaultBoardView:'overview'|'kanban'|'timeline'|'graph', reduceMotion, sound }` (merged) | `SelfUser` |
| PUT | `/notification_settings` | `{ channels:{ <type>: { inApp:bool, email:bool } }, quietHours:{ enabled, start:'22:00', end:'07:00' }, emailDigest:'off'|'daily'|'weekly' }` | `SelfUser` |
| PUT | `/privacy` | `{ profileVisibility:'public'|'members'|'private', showEmail, showActivity, showHeatmap }` default `members`, `false`, `true`, `true` | `SelfUser` |
| POST | `/avatar` | `{ kind:'avatar'|'banner', fileName, mimeType: image/png|jpeg|webp, base64 }` ≤ 2 MB decoded | `{ url, user: SelfUser }` — uploads via existing Google Drive bridge (`integrationService.uploadToGoogleDrive`), url = `https://lh3.googleusercontent.com/d/<fileId>` (fallback `https://drive.google.com/thumbnail?id=<fileId>&sz=w1000`). If Drive not configured → 503 `code:'DRIVE_NOT_CONFIGURED'` |
| GET | `/search` | `?q=&workspaceId=&boardId=` (≥1 char) | `PublicUser[]` (max 10) — only users sharing a workspace or board with caller |
| GET | `/u/:username` | — | `{ user: PublicUser (+email if showEmail), relation:'self'|'member'|'none', stats:{ crsCompleted, crsActive, storyPointsDone, boardsCount, wikiPagesCount, commentsCount }, sharedWorkspaces:[{_id,name}], sharedBoards:[{_id,title}] }` — 404 if privacy blocks (`private` and not self; `members` and relation `none`) |
| GET | `/u/:username/activity` | cursor pagination | `{ items: Activity[], nextCursor }` (respect `showActivity`) |
| GET | `/u/:username/heatmap` | `?days=365` | `{ days: [{ date:'YYYY-MM-DD', count }], total }` (respect `showHeatmap`) |
| GET | `/u/:username/workload` | — | `{ active: [{ cardId, boardId, boardTitle, title, ticketId, status, priority, storyPoint, progress, dueDate }], bySprint: [{ boardId, sprintName, storyPoints, capacity }] }` |
"Members" = users sharing ≥1 workspace (any level) or ≥1 board.

## 3. Multi-level Workspaces (`/v1/workspaces`)
Hierarchy: **Organization (level 0) → Space (level 1) → Team/Sub-space (level 2)**. Max depth 3 (levels 0–2). Boards attach to any level via `board.workspaceId`.
`Workspace = { _id, name(2–60), slug, description(≤280), icon(emoji), color(hex), parentId|null, rootId, level, path:[ancestorIds], ownerId, visibility:'private'|'workspace', settings:{ defaultRole, allowedEmailDomains:[] }, createdAt, updatedAt, _destroy }`
`WorkspaceMember = { _id, workspaceId, userId, role, status:'active'|'suspended', invitedBy, joinedAt }`

Role inheritance: a member of an ancestor has the same role on all descendants unless an explicit membership on the descendant overrides it. **Effective role = most specific explicit membership walking up `path`**. Global `admin` user = owner everywhere.

| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/` | — | tree of workspaces the user can see: `[{ ...Workspace, myRole, children:[...] }]` (roots) |
| POST | `/` | `{ name, description?, icon?, color?, parentId? }` | Workspace. Root: caller becomes owner. Child: requires `workspace:manage` on parent |
| GET | `/:id` | — | `{ workspace, myRole, breadcrumb:[{_id,name}], children, boards:[board summaries], membersCount }` |
| PUT | `/:id` | partial fields (not parentId) | Workspace (`workspace:manage`) |
| PUT | `/:id/move` | `{ parentId|null }` | (`workspace:manage` on both; depth & cycle checks) |
| DELETE | `/:id` | — | soft delete subtree; boards are detached (`workspaceId:null`) not deleted (`workspace:delete` = owner) |
| GET | `/:id/members` | — | `[{ member, user: PublicUser, inherited: bool, sourceWorkspaceId }]` |
| PUT | `/:id/members/:userId` | `{ role }` | (`member:manage`; cannot demote last owner; only owner can grant owner) |
| DELETE | `/:id/members/:userId` | — | remove (self-leave allowed unless last owner) |
| POST | `/:id/transfer_ownership` | `{ userId }` | owner only |
| POST | `/:id/invite_links` | `{ role (not owner), maxUses?:1–100, expiresInHours?:1–720 }` | `{ _id, url: '<WEBSITE_DOMAIN>/invite/<token>', role, expiresAt, maxUses, uses }` |
| GET | `/:id/invite_links` | — | list (no tokens) |
| DELETE | `/:id/invite_links/:linkId` | — | revoke |
| POST | `/:id/invitations` | `{ email, role }` | email invite (Brevo) + in-app notification if user exists |
| PUT | `/boards/:boardId` | `{ workspaceId|null }` | attach/detach board (`board:manage` on board AND `board:create` on target) |

Public invite acceptance (`/v1/invites`): `GET /:token` → `{ scope:'workspace'|'board', name, role, inviter: PublicUser, expired:bool }`; `POST /:token/accept` (authed) → `{ scope, scopeId }`.

### Roles & permission matrix (single source: `src/utils/permissions.js`, mirrored in web `src/utils/permissions.js`)
Workspace roles: `owner > admin > member > guest > viewer`. Board roles: `admin > editor > commenter > viewer`.
| Permission | owner | admin | member | guest | viewer |
|---|:-:|:-:|:-:|:-:|:-:|
| `workspace:view` | ✓ | ✓ | ✓ | ✓* | ✓ |
| `workspace:manage` (rename, children, settings, invite links) | ✓ | ✓ | | | |
| `workspace:delete`, `workspace:transfer` | ✓ | | | | |
| `member:manage` | ✓ | ✓ | | | |
| `board:create` | ✓ | ✓ | ✓ | | |
*guest sees only boards explicitly shared with them.

Workspace role → implied board role on boards in that workspace: owner/admin→`admin`, member→`editor`, guest→none (needs explicit board membership), viewer→`viewer`. Effective board role = max(explicit board role, implied).
| Board permission | admin | editor | commenter | viewer |
|---|:-:|:-:|:-:|:-:|
| `board:view` | ✓ | ✓ | ✓ | ✓ |
| `board:comment` | ✓ | ✓ | ✓ | |
| `board:edit` (columns, cards, wiki, sprint config) | ✓ | ✓ | | |
| `board:manage` (members, roles, delete, move, visibility) | ✓ | | | |

Board data: new `members: [{ userId, role }]`. Legacy `ownerIds` ⇒ admin, `memberIds` ⇒ editor (read-compat kept; writes update both `members` and legacy arrays). Public boards: anyone authed = `viewer`. Existing global-`admin` bypass stays.
Board member endpoints (`/v1/boards`): `GET /:id/members` → `[{ user: PublicUser, role, source:'board'|'workspace' }]`, `PUT /:id/members/:userId {role}`, `DELETE /:id/members/:userId`, `POST /:id/invite_links` (same shape as workspace). `GET /v1/boards/:id` response adds `myRole` and `permissions: string[]`; `GET /v1/boards` accepts `?workspaceId=` filter and each board includes `workspaceId`, `myRole`.
Card/column/wiki write routes must enforce `board:edit`; comments enforce `board:comment`.

## 4. Notifications (`/v1/notifications`)
`Notification = { _id, recipientId, actor: PublicUser|null, type, resource:{ kind:'card'|'board'|'workspace'|'wiki', id, boardId?, workspaceId? }, title, body, url, readAt|null, archivedAt|null, createdAt }`
Types: `mention, card_assigned, card_comment, card_status_changed, due_soon, board_invite, workspace_invite, role_changed, security_alert`.
| Method | Path | Result |
|---|---|---|
| GET | `/?tab=all|unread|mention|assigned|invite&cursor&limit` | `{ items, nextCursor, unreadCount }` |
| GET | `/unread_count` | `{ unreadCount }` |
| PUT | `/:id/read` · `/:id/unread` · `/:id/archive` | Notification |
| PUT | `/read_all` | `{ modified }` |
Delivery: persisted + pushed over existing SSE stream `GET /v1/invitations/stream` as `event: BE_NOTIFICATION` `data: Notification`. Email sent (Brevo) only if `notificationSettings.channels[type].email` and not in quiet hours. Default channels: inApp all true; email true for `mention, card_assigned, workspace_invite, board_invite, security_alert`.
Mentions: comment text containing `@username` (regex `@([a-z0-9._-]{3,30})`) → mention notifications to members of that board. Comment payload stores `mentions: [userId]`.
Watchers: card `watcherIds[]`; `PUT /v1/cards/:id/watch {watch:bool}`. Comment / status change notifies assignees (`memberIds`) + watchers (excluding actor).

## 5. Presence (`/v1/presence`)
- `POST /boards/:boardId/heartbeat` `{ editing?: { cardId, field } }` every 20 s while board/CR page open → `{ viewers: [{ user: PublicUser, editing, lastSeen }] }` (in-memory, entries expire after 45 s).
- `DELETE /boards/:boardId` on leave.
- Server also pushes `event: BE_PRESENCE` `data: { boardId, viewers }` over SSE to viewers of that board on change.

## 6. Activity (`activities` collection)
`Activity = { _id, actorId, actor?: PublicUser, verb, boardId, cardId?, workspaceId?, meta:{ title, from, to, field }, createdAt }`
Verbs: `card_created, card_updated, card_moved, card_status_changed, card_completed, comment_added, wiki_created, wiki_updated, board_created, member_added, role_changed`. Logged by services (fire-and-forget, never fails the request).
`GET /v1/boards/:id/activity?cursor` → `{ items, nextCursor }` (`board:view`).

## 7. Data rights & admin
| Method | Path | Notes |
|---|---|---|
| GET | `/v1/users/export` | JSON download of own profile, sessions (no hashes), memberships, boards owned, cards assigned, comments authored, wiki pages, notifications, audit logs |
| POST | `/v1/users/delete_account` | `{ password, confirmEmail }` → `deletionScheduledAt = now + 14d`, revoke sessions, email |
| POST | `/v1/users/cancel_deletion` | authed — cancels (login allowed during grace period; web shows banner) |
| — | purge job | on server start + every 6 h: anonymize users past grace (`displayName:'Người dùng đã xoá'`, email `deleted+<id>@chella.invalid`, clear profile, `_destroy:true`), remove memberships; boards they solely own are transferred to another admin/member or soft-deleted |
| GET | `/v1/admin/users?q&cursor` | global `admin` only → users list with `{ isActive, lockedUntil, createdAt, lastLoginAt, sessionsCount }` |
| PUT | `/v1/admin/users/:id` | `{ isActive?, role? ('client'|'admin'), unlock?:true }` |
| DELETE | `/v1/admin/users/:id/sessions` | force logout |
| GET | `/v1/admin/stats` | `{ users, activeUsers7d, workspaces, boards, signups:[{date,count}] }` |

## 8. Legal
Register requires `acceptTerms === true`; stored `consents:[{ type:'terms', version:'2026-11', acceptedAt, ip }]`. Web routes `/legal/terms`, `/legal/privacy` (static pages, VI/EN/JA/KO).

## 9. Web routes (chello-web)
`/forgot-password`, `/reset-password?email&token`, `/invite/:token`, `/u/:username`, `/workspaces/:workspaceId`, `/workspaces/:workspaceId/members`, `/workspaces/:workspaceId/settings`, `/inbox`, `/my-work`, `/settings/{account,profile,security,sessions,notifications,privacy,appearance,data}`, `/admin` (global admin), `/legal/terms`, `/legal/privacy`, `/onboarding`.
