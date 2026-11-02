// v7 User System dictionary (accounts, profiles, workspaces, inbox, collaboration, admin, legal).
// Each feature keeps its own file under ~/utils/i18nV7/ to stay small; all are merged per language
// here and then into TRANSLATIONS by ~/utils/i18n. Every key must exist in vi/en/ja/ko.
import { COMMON_V7 } from '~/utils/i18nV7/common'
import { AUTH_V7 } from '~/utils/i18nV7/auth'
import { SETTINGS_V7 } from '~/utils/i18nV7/settings'
import { PROFILE_V7 } from '~/utils/i18nV7/profile'
import { WORKSPACE_V7 } from '~/utils/i18nV7/workspace'
import { COLLAB_V7 } from '~/utils/i18nV7/collab'
import { ADMIN_V7 } from '~/utils/i18nV7/admin'

const V7_PARTS = [COMMON_V7, AUTH_V7, SETTINGS_V7, PROFILE_V7, WORKSPACE_V7, COLLAB_V7, ADMIN_V7]

export const V7_TRANSLATIONS = ['vi', 'en', 'ja', 'ko'].reduce((acc, code) => ({
  ...acc,
  [code]: V7_PARTS.reduce((dict, part) => ({ ...dict, ...(part[code] || {}) }), {})
}), {})
