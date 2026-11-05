# Graph Report - chello-web  (2026-11-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1872 nodes · 6518 edges · 81 communities (72 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 106 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `196eb280`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InboxPage.jsx
- useTranslation
- ThemeFxProvider.jsx
- AdminConsole.jsx
- LoginForm.jsx
- KnowledgeHub.jsx
- apis/index.js
- ProfileTab.jsx
- App.jsx
- Settings.jsx
- environment
- presenceStore.js
- selectCurrentUser
- graphRenderer.js
- KnowledgeGraphView.jsx
- GraphInspector.jsx
- build-image
- SecurityTab.jsx
- Boards/_id.jsx
- SprintPulse.jsx
- excelExporter.js
- WorkspaceInviteLinksSection.jsx
- BoardBar.jsx
- OnboardingPage.jsx
- graphEngine.js
- Boards/index.jsx
- ActiveCard.jsx
- WorkspaceSettings.jsx
- animeTheme.js
- vitest
- workspaceApi.js
- AppBar.jsx
- ProfilePage.jsx
- graphConstants.js
- graphPhysics.js
- SprintCommandDashboard.jsx
- ImportMarkdownModal.jsx
- workspaceTree.js
- dependencies
- preferencesSync.js
- permissions.js
- workingHours.js
- workspacesSlice.js
- graphQuery.js
- i18nV7.js
- LocalGraphMini.jsx
- devDependencies
- heatmap.js
- package.json
- focusMode.js
- src/utils/preferences.js
- CardActivitySection
- graphLabels.js
- TimelineView.jsx
- SprintConfigPopover.jsx
- boardEvents.js
- soundEffects.js
- vite
- scripts
- compilerOptions
- randomColor.js
- axios
- @babel/preset-react@^7.27.1
- mock-data.js
- customHooks/index.js
- Users/index.jsx
- vercel.json
- .eslintrc.cjs
- collectBoardCardsWithColumn
- PermissionMatrixTab.jsx
- TimelineView.jsx
- fxSettings.js
- compilerOptions
- randomColor.js
- cross-env@^7.0.3
- @emotion/styled@^11.11.0
- material-ui-confirm
- react-markdown
- mock-data.js
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `useTranslation()` - 186 edges
2. `@mui/material` - 138 edges
3. `react` - 104 edges
4. `@mui/icons-material` - 84 edges
5. `selectCurrentUser()` - 62 edges
6. `react-redux` - 54 edges
7. `react-router-dom` - 52 edges
8. `usePersonaTheme()` - 49 edges
9. `playUiChime()` - 49 edges
10. `AdminConsole()` - 49 edges

## Surprising Connections (you probably didn't know these)
- `usePersonaTheme()` --indirect_call--> `getSavedPersonaTheme()`  [INFERRED]
  src/customHooks/usePersonaTheme.js → src/utils/animeTheme.js
- `AccountTab()` --indirect_call--> `selectCurrentUser()`  [INFERRED]
  src/pages/Settings/AccountTab.jsx → src/redux/user/userSlice.js
- `Auth()` --indirect_call--> `selectCurrentUser()`  [INFERRED]
  src/pages/Auth/Auth.jsx → src/redux/user/userSlice.js
- `LocalGraphMini()` --indirect_call--> `selectCurrentActiveBoard()`  [INFERRED]
  src/pages/Boards/BoardContent/KnowledgeGraph/LocalGraphMini.jsx → src/redux/activeBoard/activeBoardSlice.js
- `BoardBar()` --indirect_call--> `exportSprintCrsToCsv()`  [INFERRED]
  src/pages/Boards/BoardBar/BoardBar.jsx → src/utils/excelExporter.js

## Import Cycles
- 2-file cycle: `src/redux/user/userSlice.js -> src/utils/authorizeAxios.js -> src/redux/user/userSlice.js`
- 2-file cycle: `src/apis/index.js -> src/utils/authorizeAxios.js -> src/apis/index.js`
- 3-file cycle: `src/apis/adminApi.js -> src/utils/authorizeAxios.js -> src/apis/index.js -> src/apis/adminApi.js`
- 3-file cycle: `src/apis/index.js -> src/apis/presenceApi.js -> src/utils/authorizeAxios.js -> src/apis/index.js`
- 3-file cycle: `src/apis/index.js -> src/apis/workspaceApi.js -> src/utils/authorizeAxios.js -> src/apis/index.js`
- 3-file cycle: `src/apis/index.js -> src/apis/userApi.js -> src/utils/authorizeAxios.js -> src/apis/index.js`
- 3-file cycle: `src/apis/index.js -> src/apis/notificationApi.js -> src/utils/authorizeAxios.js -> src/apis/index.js`

## Communities (81 total, 9 thin omitted)

### Community 0 - "InboxPage.jsx"
Cohesion: 0.05
Nodes (74): @mui/icons-material, @mui/material, react, react-hook-form, react-router-dom, forgotPasswordAPI(), registerAccountAPI(), resendVerificationAPI() (+66 more)

### Community 1 - "useTranslation"
Cohesion: 0.07
Nodes (57): fetchWikiPagesAPI(), ANIM(), BOX, InlineRing(), SCENES, ThemedLoader(), buildCursorUris(), buildCursorValues() (+49 more)

### Community 2 - "ThemeFxProvider.jsx"
Cohesion: 0.06
Nodes (45): vitest, GRAPH_TRANSLATIONS, savePersonaTheme(), BASE_TRANSLATIONS, getSavedBilingualMode(), getSavedLanguage(), getSavedSecondaryLanguage(), setAppLanguage() (+37 more)

### Community 3 - "AdminConsole.jsx"
Cohesion: 0.05
Nodes (32): getFxThemeKey(), listeners, personaKey, subscribe(), useFxThemeKey(), NAME_ERR_KEYS, OnboardingPage(), ROLE_LABEL_KEYS (+24 more)

### Community 4 - "LoginForm.jsx"
Cohesion: 0.09
Nodes (49): DOWNSTREAM_COLOR, EVIDENCE_BEACON_COLOR, LINK_KINDS, SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH, UPSTREAM_COLOR, GraphInspector(), InsightsSection() (+41 more)

### Community 5 - "KnowledgeHub.jsx"
Cohesion: 0.09
Nodes (42): createWikiPageAPI(), deleteWikiPageAPI(), updateWikiPageAPI(), setBoardThemeOverride(), glassSx, KnowledgeHub(), LABEL_KEYS, TemplatePicker() (+34 more)

### Community 6 - "apis/index.js"
Cohesion: 0.09
Nodes (37): @dnd-kit/core@^6.0.8, @dnd-kit/core, MouseSensor, TouchSensor, FX_AI_CURSOR_EVENT, BASE_MIDI_E2, BASE_MIDI_E3, buildSprintSwarmBlueprint() (+29 more)

### Community 7 - "ProfileTab.jsx"
Cohesion: 0.04
Nodes (47): VITE_API_ROOT, args, context, build, container_name, depends_on, environment, ports (+39 more)

### Community 8 - "App.jsx"
Cohesion: 0.09
Nodes (29): @dnd-kit/sortable, lodash, createNewCardAPI(), createNewColumnAPI(), deleteBoardDetailsAPI(), deleteColumnDetailsAPI(), fetchBoardDetailsDirectAPI(), fetchBoardsAPI() (+21 more)

### Community 9 - "Settings.jsx"
Cohesion: 0.11
Nodes (33): del(), fetchSessionsAPI(), revokeOtherSessionsAPI(), revokeSessionAPI(), updatePrivacyAPI(), SettingsSection(), SettingsStack(), AppearanceTab() (+25 more)

### Community 10 - "environment"
Cohesion: 0.15
Nodes (27): react-toastify, updateBoardDetailsAPI(), downloadTextFile(), SprintReportDialog(), formatTimer(), usePomodoro(), useTranslation(), triggerSprintSwarmReplay() (+19 more)

### Community 11 - "presenceStore.js"
Cohesion: 0.06
Nodes (36): expire_in, paths, when, build-image, artifacts, before_script, image, needs (+28 more)

### Community 12 - "selectCurrentUser"
Cohesion: 0.11
Nodes (32): drawBackground(), getGlowSprite(), glowCache, STARS, easeOutBack(), NODE_BASE_RADIUS, PATH_COLOR, SPRINT_FALLBACK_COLOR (+24 more)

### Community 13 - "graphRenderer.js"
Cohesion: 0.16
Nodes (32): bulkImportAdminUsersAPI(), clearAdminApiLogsAPI(), createAdminIpRuleAPI(), createAdminUserAPI(), deleteAdminIpRuleAPI(), deleteAdminProxyServerAPI(), deleteAdminServerNodeAPI(), executeAdminEmergencyPlaybookAPI() (+24 more)

### Community 14 - "KnowledgeGraphView.jsx"
Cohesion: 0.13
Nodes (25): deleteCardDetailsAPI(), updateCardDetailsAPI(), uploadFrdToGoogleDriveAPI(), LoadingButton(), ActiveCard(), SidebarItem, toDateInputValue(), extractGoogleDriveFileId() (+17 more)

### Community 15 - "GraphInspector.jsx"
Cohesion: 0.19
Nodes (30): DataLineageDrawer(), BoardAnalyticsView(), createCrNode(), Card(), requestSwitchBoardView(), mapCardToDatasetRow(), BA_STATUS_OPTIONS, computeTeamResourcePoints() (+22 more)

### Community 16 - "build-image"
Cohesion: 0.17
Nodes (28): AppBar(), Recent(), Starred(), Templates(), Workspaces(), CommandPalette(), SoraBunnyIcon(), ModeSelect() (+20 more)

### Community 17 - "SecurityTab.jsx"
Cohesion: 0.14
Nodes (26): DueLoadBars(), LEVEL_STYLE, SprintPulse(), Stat(), toPercent(), parseDeadlineTimestamp(), buildDueLoad(), clamp01() (+18 more)

### Community 18 - "Boards/_id.jsx"
Cohesion: 0.15
Nodes (28): updateProfileAPI(), updateUsernameAPI(), LOCALE_NAMES, ProfileTab(), apiErrorCode(), apiErrorStatus(), weekdayLabel(), buildProfileForm() (+20 more)

### Community 19 - "SprintPulse.jsx"
Cohesion: 0.13
Nodes (24): LOCAL_DEPTHS, TYPE_COLORS, CountChip(), DISPLAY_TOGGLES, GraphFiltersPanel(), TYPE_LABEL_KEYS, buildGroups(), ColorSwatch() (+16 more)

### Community 20 - "excelExporter.js"
Cohesion: 0.14
Nodes (22): EditorialLabel(), MONO_FONT, surfaceSx, containmentPanelSx, CronJobsTab(), INTERVAL_OPTIONS, stickyHeadCellSx, stickyTableWrapperSx (+14 more)

### Community 21 - "WorkspaceInviteLinksSection.jsx"
Cohesion: 0.26
Nodes (22): createNewBoardAPI(), acceptInviteAPI(), fetchInviteAPI(), fetchWorkspaceDetailsAPI(), PageShell(), PageLoadingSpinner(), PermissionGate(), InviteAccept() (+14 more)

### Community 22 - "BoardBar.jsx"
Cohesion: 0.13
Nodes (25): verifyUserAPI(), AdminConsole, AdminRoute(), App(), Board, Boards, CrStudio, ForgotPassword (+17 more)

### Community 23 - "OnboardingPage.jsx"
Cohesion: 0.12
Nodes (23): boardCursor, boardEditing, boardListeners, boardViewers, cursorThrottleState, notifyBoardListeners(), sendPresenceHeartbeatAPI(), setActiveCard() (+15 more)

### Community 24 - "graphEngine.js"
Cohesion: 0.16
Nodes (22): centerCamera(), clampZoom(), DEFAULT_CAMERA, easeInOutCubic(), fitCamera(), lerpCamera(), screenToWorld(), visibleWorldRect() (+14 more)

### Community 25 - "Boards/index.jsx"
Cohesion: 0.19
Nodes (19): CardDescriptionMdEditor(), FrdVisualDocument(), SequenceDiagramRenderer(), DeleteSprintBoardDialog(), EditSprintBoardModal(), SprintBoardCard(), formatDateKey(), formatDisplayDmy() (+11 more)

### Community 26 - "ActiveCard.jsx"
Cohesion: 0.11
Nodes (24): BORN_DURATION_MS, BORN_STAGGER_MAX_MS, BORN_STAGGER_MS, DEFAULT_FILTERS, DEFAULT_LOCAL_DEPTH, DETAIL_ZOOM, EDGE_KINDS, FIT_DURATION_MS (+16 more)

### Community 27 - "WorkspaceSettings.jsx"
Cohesion: 0.17
Nodes (20): moveCardToDifferentColumnAPI(), joinPresence(), DEADLINE_OPTIONS, FilterChip(), FilterPopover(), Section(), toggleIn(), Board() (+12 more)

### Community 28 - "animeTheme.js"
Cohesion: 0.21
Nodes (18): Notifications(), InboxPage(), TAB_LABEL_KEYS, resolveNotificationPath(), archiveNotification, fetchInboxTab, fetchUnreadCount, markAllNotificationsRead (+10 more)

### Community 29 - "vitest"
Cohesion: 0.16
Nodes (23): ACCEPTED_IMAGE_TYPES, blobToBase64(), canvasToBlob(), computeCoverCrop(), computeOutputSize(), drawCropped(), encodeWithinLimit(), estimateBase64Bytes() (+15 more)

### Community 30 - "workspaceApi.js"
Cohesion: 0.17
Nodes (22): inviteUserToBoardAPI(), attachBoardToWorkspaceAPI(), createBoardInviteLinkAPI(), del(), fetchBoardInviteLinksAPI(), fetchBoardMembersAPI(), fetchWorkspaceInviteLinksAPI(), fetchWorkspaceMembersAPI() (+14 more)

### Community 31 - "AppBar.jsx"
Cohesion: 0.18
Nodes (20): updateStatusAPI(), MODE_LABEL_KEY, Profiles(), STATUS_DOT_COLOR, CLEAR_OPTIONS, computeUntilTimestamp(), EMOJI_PRESETS, MODE_OPTIONS (+12 more)

### Community 32 - "ProfilePage.jsx"
Cohesion: 0.14
Nodes (20): createWorkspaceAPI(), deleteWorkspaceAPI(), isHexColor(), validateWorkspaceDescription(), validateWorkspaceName(), WorkspaceSidebarSection(), COLOR_PRESETS, ICON_PRESETS (+12 more)

### Community 33 - "graphConstants.js"
Cohesion: 0.19
Nodes (20): appendUniqueUsers(), buildCredentialsCsv(), buildDualLineChart(), buildSignupChart(), buildStackedStatusChart(), escapeCsvCell(), formatBytes(), formatUptime() (+12 more)

### Community 34 - "graphPhysics.js"
Cohesion: 0.22
Nodes (20): createInboxState(), emptyTabState(), findNotification(), INBOX_TABS, insertIntoTabs(), isUnread(), markAllInTabs(), mergePage() (+12 more)

### Community 35 - "SprintCommandDashboard.jsx"
Cohesion: 0.19
Nodes (19): createWorkspaceInviteLinkAPI(), inviteToWorkspaceByEmailAPI(), post(), revokeWorkspaceInviteLinkAPI(), transferWorkspaceOwnershipAPI(), addDomain(), buildInviteLinkPayload(), INVITE_EXPIRY_HOURS (+11 more)

### Community 36 - "ImportMarkdownModal.jsx"
Cohesion: 0.15
Nodes (17): generateAiCrAssistanceAPI(), AI_MODE_BADGES, CrAssistantPanel(), GEMINI_MODEL_OPTIONS, GROUPS, isTypingTarget(), Kbd(), ShortcutsDialog() (+9 more)

### Community 37 - "workspaceTree.js"
Cohesion: 0.19
Nodes (17): leavePresenceAPI(), beat(), claims, createSession(), session, currentEditing(), editingKey(), EMPTY_VIEWERS (+9 more)

### Community 38 - "dependencies"
Cohesion: 0.17
Nodes (19): DEFAULT_FORCES, convexHull(), cross(), drawHulls(), groupByTopic(), accumulate(), buildTree(), createJiggle() (+11 more)

### Community 39 - "preferencesSync.js"
Cohesion: 0.21
Nodes (14): react-redux, fetchPublicSystemStatusAPI(), ProtectedRoute(), DeletionBanner(), ForcePasswordChangeDialog(), PreferencesSync(), SystemStatusBanner(), fetchMeAPI (+6 more)

### Community 40 - "permissions.js"
Cohesion: 0.22
Nodes (18): cancelDeletionAPI(), changePasswordAPI(), deleteAccountAPI(), disableTwoFactorAPI(), enableTwoFactorAPI(), exportMyDataAPI(), fetchAuditLogsAPI(), post() (+10 more)

### Community 41 - "workingHours.js"
Cohesion: 0.17
Nodes (18): fetchMeAPI(), fetchProfileActivityAPI(), fetchProfileHeatmapAPI(), fetchProfileWorkloadAPI(), fetchPublicProfileAPI(), get(), searchUsersAPI(), extractActivityItems() (+10 more)

### Community 42 - "workspacesSlice.js"
Cohesion: 0.25
Nodes (17): tree, asList(), assignableWorkspaceRoles(), buildSelectOptions(), canHaveChildren(), canMoveToRoot(), childrenOf(), collectDescendantIds() (+9 more)

### Community 43 - "graphQuery.js"
Cohesion: 0.11
Nodes (18): dependencies, axios@^1.5.1, @babel/preset-react@^7.27.1, @dnd-kit/sortable@^7.0.2, @dnd-kit/utilities@^3.2.1, lodash@^4.17.21, @mui/icons-material@^5.11.16, @mui/material@^5.13.0 (+10 more)

### Community 44 - "i18nV7.js"
Cohesion: 0.25
Nodes (14): byDueDate(), cardPath(), DUE_BUCKETS, dueBucket(), groupByBoard(), groupByDueBucket(), startOfDay(), toTs() (+6 more)

### Community 45 - "LocalGraphMini.jsx"
Cohesion: 0.22
Nodes (16): buildSprintDatasetSources(), CHELLA_CATEGORICAL_PALETTE, DARK_BAND, DEFAULT_SURFACES, hexToLinearRgb(), hexToOklch(), hexToSrgb(), LIGHT_BAND (+8 more)

### Community 46 - "devDependencies"
Cohesion: 0.22
Nodes (16): BOARD_MATRIX, BOARD_ROLES, can(), canBoard(), canWorkspace(), compareRoles(), effectiveBoardRole(), impliedBoardRole() (+8 more)

### Community 47 - "heatmap.js"
Cohesion: 0.25
Nodes (16): NOW, WH, DEFAULT_WORKING_DAYS, formatOffsetDiff(), formatTime(), getLocalTimeInfo(), getTimezoneOffsetMinutes(), getZonedParts() (+8 more)

### Community 48 - "package.json"
Cohesion: 0.35
Nodes (13): ProgressSelect(), CrDetails(), buildSimulationModel(), CrStudio(), downloadAttachedFrdFile(), exportCardAsFrdMarkdown(), formatProgress(), getProgressColor() (+5 more)

### Community 49 - "focusMode.js"
Cohesion: 0.21
Nodes (16): NODE_TYPES, QUERY_KEYS, applyQuery(), collectValues(), getQuerySuggestions(), isEmptyQuery(), lastTokenStart(), lower() (+8 more)

### Community 50 - "src/utils/preferences.js"
Cohesion: 0.26
Nodes (13): AUDIT_EVENTS, auditEventKey(), backupCodesText(), BROWSERS, deviceLabel(), firstMatch(), groupSecret(), PASSWORD_ERROR_KEYS (+5 more)

### Community 51 - "CardActivitySection"
Cohesion: 0.31
Nodes (12): fetchBoardActivityAPI(), activityTargetPath(), activityVerbKey(), formatRelativeTime(), groupByDay(), RELATIVE_STEPS, relativeDayName(), toDayKey() (+4 more)

### Community 52 - "graphLabels.js"
Cohesion: 0.27
Nodes (14): DEFAULT_DISPLAY, FORCE_LIMITS, clampForce(), isPlainObject(), loadPins(), loadSettings(), pickBooleans(), readJson() (+6 more)

### Community 53 - "TimelineView.jsx"
Cohesion: 0.14
Nodes (14): devDependencies, eslint@^8.38.0, eslint-plugin-react@^7.32.2, eslint-plugin-react-hooks@^4.6.0, eslint-plugin-react-refresh@^0.3.4, @types/react@^18.2.25, @types/react-dom@^18.2.14, vitest@0.34.6 (+6 more)

### Community 54 - "SprintConfigPopover.jsx"
Cohesion: 0.30
Nodes (10): SEVERITY_COLORS, SpecKitConvergencePanel(), auditCrConvergence(), buildSddSpecSnippet(), DONE_STATUSES, extractSpecRequirements(), extractUncertaintyMarkers(), scanTextForMarkers() (+2 more)

### Community 55 - "boardEvents.js"
Cohesion: 0.22
Nodes (9): TEMPLATE_DEFAULT_COVER_KEYS, flattenItems(), TimelineBar(), TimelineView(), activeCardReducer, activeCardSlice, initialState, getPriorityOption() (+1 more)

### Community 56 - "soundEffects.js"
Cohesion: 0.15
Nodes (12): author, @emotion/react@^11.11.0, remark-gfm@4.0.0, description, engines, node, name, private (+4 more)

### Community 57 - "vite"
Cohesion: 0.18
Nodes (10): @reduxjs/toolkit@^2.0.1, @reduxjs/toolkit, activeBoardReducer, inboxReducer, notificationsReducer, store, userReducer, workspacesReducer (+2 more)

### Community 58 - "scripts"
Cohesion: 0.41
Nodes (10): addDays(), buildHeatmap(), buildMonthLabels(), computeStreaks(), intensityLevel(), normalizeToday(), pad2(), parseDateKey() (+2 more)

### Community 59 - "compilerOptions"
Cohesion: 0.41
Nodes (9): CardActivitySection(), blank(), extractMentions(), findMentions(), getMentionQuery(), insertMention(), maskCode(), QUERY_RE (+1 more)

### Community 60 - "randomColor.js"
Cohesion: 0.36
Nodes (9): archiveNotificationAPI(), fetchNotificationsAPI(), fetchUnreadCountAPI(), get(), markAllNotificationsReadAPI(), markNotificationReadAPI(), markNotificationUnreadAPI(), put() (+1 more)

### Community 61 - "axios"
Cohesion: 0.29
Nodes (9): containmentPanelSx, getRoleId(), getRoleLabel(), getScopeLabel(), getScopeTier(), IMMUTABLE_ADMIN_KEYS, PermissionMatrixTab(), stickyHeadCellSx (+1 more)

### Community 62 - "@babel/preset-react@^7.27.1"
Cohesion: 0.33
Nodes (8): RelativeTime(), copyToClipboard(), exportFileName(), formatDateTime(), formatRelativeTime(), pad(), relativeTimeParts(), UNITS

### Community 63 - "mock-data.js"
Cohesion: 0.33
Nodes (7): getPresenceViewers(), subscribePresence(), MODE_DOT_COLOR, MODE_LABEL_KEY, UserHoverCard(), BoardUserGroup(), LOCALE_BY_LANG

### Community 64 - "customHooks/index.js"
Cohesion: 0.36
Nodes (7): raisedBg(), Settings(), TAB_VIEWS, DEFAULT_SETTINGS_TAB, resolveSettingsTab(), SETTINGS_TAB_KEYS, TAB_LABEL_KEYS

### Community 65 - "Users/index.jsx"
Cohesion: 0.31
Nodes (8): BOARD_VIEWS, consumePendingReport(), OPEN_REPORT_EVENT, readBoardView(), requestOpenSprintReport(), requestSprintReport, safeStorage(), SWITCH_VIEW_EVENT

### Community 66 - "vercel.json"
Cohesion: 0.29
Nodes (7): getThreatBadgeMeta(), AccessDdosTab(), containmentPanelSx, ellipsisCellSx, nowrapMonoCellSx, stickyHeadCellSx, stickyTableWrapperSx

### Community 67 - ".eslintrc.cjs"
Cohesion: 0.29
Nodes (6): vite@^4.3.2, vite-plugin-svgr@3.2.0, @vitejs/plugin-react-swc@^3.0.0, vite, vite-plugin-svgr, @vitejs/plugin-react-swc

### Community 68 - "collectBoardCardsWithColumn"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, test:watch

### Community 69 - "PermissionMatrixTab.jsx"
Cohesion: 0.38
Nodes (6): ApiLogsTab(), containmentPanelSx, methodChipColor(), statusChipColor(), stickyHeadCellSx, stickyTableWrapperSx

### Community 70 - "TimelineView.jsx"
Cohesion: 0.67
Nodes (5): alreadyRemindedToday(), markReminded(), todayKey(), useDeadlineReminder(), collectBoardCardsWithColumn()

### Community 71 - "fxSettings.js"
Cohesion: 0.83
Nodes (3): getOrigin(), getRevealRadius(), runWithReveal()

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTranslation()` connect `environment` to `InboxPage.jsx`, `useTranslation`, `ThemeFxProvider.jsx`, `AdminConsole.jsx`, `LoginForm.jsx`, `KnowledgeHub.jsx`, `App.jsx`, `Settings.jsx`, `graphRenderer.js`, `KnowledgeGraphView.jsx`, `GraphInspector.jsx`, `build-image`, `SecurityTab.jsx`, `Boards/_id.jsx`, `excelExporter.js`, `WorkspaceInviteLinksSection.jsx`, `BoardBar.jsx`, `Boards/index.jsx`, `WorkspaceSettings.jsx`, `animeTheme.js`, `workspaceApi.js`, `AppBar.jsx`, `ProfilePage.jsx`, `graphConstants.js`, `SprintCommandDashboard.jsx`, `ImportMarkdownModal.jsx`, `preferencesSync.js`, `permissions.js`, `workingHours.js`, `i18nV7.js`, `package.json`, `src/utils/preferences.js`, `CardActivitySection`, `boardEvents.js`, `compilerOptions`, `@babel/preset-react@^7.27.1`, `mock-data.js`, `customHooks/index.js`, `vercel.json`, `PermissionMatrixTab.jsx`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `useTranslation()` (e.g. with `getSavedBilingualMode()` and `setAppLanguage()`) actually correct?**
  _`useTranslation()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `InboxPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05141113653699466 - nodes in this community are weakly interconnected._
- **Why does `@mui/material` connect `InboxPage.jsx` to `useTranslation`, `AdminConsole.jsx`, `LoginForm.jsx`, `KnowledgeHub.jsx`, `apis/index.js`, `App.jsx`, `Settings.jsx`, `environment`, `graphRenderer.js`, `KnowledgeGraphView.jsx`, `GraphInspector.jsx`, `build-image`, `SecurityTab.jsx`, `Boards/_id.jsx`, `SprintPulse.jsx`, `excelExporter.js`, `WorkspaceInviteLinksSection.jsx`, `OnboardingPage.jsx`, `graphEngine.js`, `Boards/index.jsx`, `WorkspaceSettings.jsx`, `animeTheme.js`, `workspaceApi.js`, `AppBar.jsx`, `ProfilePage.jsx`, `graphConstants.js`, `SprintCommandDashboard.jsx`, `ImportMarkdownModal.jsx`, `preferencesSync.js`, `permissions.js`, `workingHours.js`, `graphQuery.js`, `i18nV7.js`, `package.json`, `src/utils/preferences.js`, `CardActivitySection`, `SprintConfigPopover.jsx`, `boardEvents.js`, `soundEffects.js`, `vite`, `compilerOptions`, `axios`, `@babel/preset-react@^7.27.1`, `mock-data.js`, `customHooks/index.js`, `vercel.json`, `PermissionMatrixTab.jsx`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Are the 31 inferred relationships involving `selectCurrentUser()` (e.g. with `App()` and `DeletionBanner()`) actually correct?**
  _`selectCurrentUser()` has 31 INFERRED edges - model-reasoned connections that need verification._
- **Should `useTranslation` be split into smaller, more focused modules?**
  _Cohesion score 0.07203751065643649 - nodes in this community are weakly interconnected._
- **Why does `react` connect `InboxPage.jsx` to `useTranslation`, `ThemeFxProvider.jsx`, `AdminConsole.jsx`, `LoginForm.jsx`, `KnowledgeHub.jsx`, `apis/index.js`, `App.jsx`, `Settings.jsx`, `environment`, `graphRenderer.js`, `KnowledgeGraphView.jsx`, `GraphInspector.jsx`, `build-image`, `SecurityTab.jsx`, `Boards/_id.jsx`, `SprintPulse.jsx`, `excelExporter.js`, `WorkspaceInviteLinksSection.jsx`, `BoardBar.jsx`, `OnboardingPage.jsx`, `graphEngine.js`, `Boards/index.jsx`, `WorkspaceSettings.jsx`, `animeTheme.js`, `workspaceApi.js`, `AppBar.jsx`, `ProfilePage.jsx`, `SprintCommandDashboard.jsx`, `ImportMarkdownModal.jsx`, `preferencesSync.js`, `permissions.js`, `workingHours.js`, `graphQuery.js`, `i18nV7.js`, `package.json`, `src/utils/preferences.js`, `CardActivitySection`, `SprintConfigPopover.jsx`, `boardEvents.js`, `soundEffects.js`, `compilerOptions`, `axios`, `mock-data.js`, `PermissionMatrixTab.jsx`, `TimelineView.jsx`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._