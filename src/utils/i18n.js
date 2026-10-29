// Multi-language (VI / EN / JA / KO) + Bilingual Mode (Song ngữ) Engine for Chella
// Keeps technical terms (Sprint, CR, FRD, Ticket ID, Status, Handle by, Resource point, Dev Progress, Kanban, Obsidian Graph) intact
import { FEATURE_TRANSLATIONS } from '~/utils/i18nV5'
import { V6_TRANSLATIONS } from '~/utils/i18nV6'
import { EXTRA_TRANSLATIONS } from '~/utils/i18nExtra'
import { GRAPH_TRANSLATIONS } from '~/pages/Boards/BoardContent/KnowledgeGraph/graphI18n'

const LANG_STORAGE_KEY = 'chella_locale_lang'
const BILINGUAL_STORAGE_KEY = 'chella_bilingual_mode'
const SECONDARY_LANG_STORAGE_KEY = 'chella_secondary_lang'

export const SUPPORTED_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', short: 'VI', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧', nativeName: 'English' },
  { code: 'ja', label: '日本語', short: 'JA', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', label: '한국어', short: 'KO', flag: '🇰🇷', nativeName: '한국어' }
]

const BASE_TRANSLATIONS = {
  vi: {
    brandTitle: 'Chella',
    brandTagline: 'A clone of "C"onfluence - tr"ELL"o - jir"A"',
    allBoards: 'Tất cả Sprint Boards',
    boardsBtn: 'Sprint Boards',
    themeMenu: 'Giao diện',
    selectThemeTitle: 'CHỌN CHỦ ĐỀ GIAO DIỆN',
    selectThemeSub: 'Đồng bộ màu sắc, hình nền và âm thanh không gian làm việc',
    recentMenu: 'Gần đây',
    recentBoardsTitle: 'SPRINT BOARDS GẦN ĐÂY',
    noBoardsFound: 'Chưa có bảng nào.',
    starredMenu: 'Đánh dấu',
    starredBoardsTitle: 'BẢNG ĐÁNH DẤU SAO',
    noStarredBoards: 'Chưa có bảng đánh dấu sao. Nhấn biểu tượng ★ trên thanh công cụ để ghim bảng.',
    templatesMenu: 'Mẫu Sprint',
    templatesTitle: 'MẪU SPRINT BOARD KHỞI TẠO NHANH',
    templatesSub: 'Khởi tạo bảng Sprint với các chủ đề CR & tài liệu mẫu',
    commandBtn: '⌘K Lệnh nhanh',
    ostPlaylist: 'Âm thanh',
    ostPopoverTitle: '🎵 Danh sách Nhạc nền & Âm thanh Không gian',
    ostPopoverSub: 'Phát trực tiếp nhạc nền theo chủ đề hoặc tải file âm thanh từ máy tính:',
    stopMusic: 'Tắt nhạc',
    uploadAudioBtn: 'Chọn file âm thanh (.MP3 / .WAV / .OGG) từ máy tính',
    bilingualToggle: 'Song ngữ',
    bilingualOn: 'Đang bật chế độ Song ngữ',
    bilingualOff: 'Đang tắt chế độ Song ngữ',
    languageLabel: 'Ngôn ngữ',
    sprintCycle: 'Chu kỳ Sprint',
    configureSprint: '🗓️ Cấu hình Sprint & Đội ngũ (Resource Roster)',
    sprintConfigSub: 'Mỗi Board tương ứng 1 Sprint. Dữ liệu này đồng bộ trực tiếp với file Excel / CSV mẫu.',
    sprintNumberLabel: 'Sprint (VD: 34)',
    startDateLabel: 'Start date (Ngày bắt đầu)',
    endDateLabel: 'End date (Ngày kết thúc)',
    updateTillLabel: 'Update till (Cập nhật tới)',
    updatedByLabel: 'By (Người cập nhật)',
    sprintNoteLabel: 'Note (Ghi chú kỳ Sprint)',
    teamRosterLabel: 'Danh sách thành viên (Handle by) — Không cần tài khoản',
    addMemberPlaceholder: 'Nhập tên thành viên mới (VD: Nguyen Van A)...',
    addBtn: 'Thêm',
    cancelBtn: 'Hủy',
    saveSprintBtn: 'Lưu cấu hình Sprint',
    onTrack: 'Đúng tiến độ',
    deadlineAlerts: 'Cảnh báo hạn',
    deadlineCenterTitle: '⏰ Theo dõi Due date for dev & Tiến độ CR',
    deadlineCenterSub: 'Nhấn vào bất kỳ CR nào bên dưới để mở chi tiết hoặc chuyển sang CR Studio:',
    allOnTrackMsg: '✅ Tất cả các CR trong kỳ Sprint này đều đang đúng tiến độ!',
    importMdCsvBtn: 'Import MD / CSV',
    exportExcelBtn: 'Xuất Excel Sprint',
    exportCsvBtn: 'Xuất CSV Mẫu',
    viewKanban: 'Kanban',
    viewMatrix: 'Sprint Matrix',
    viewGraph: 'Obsidian Graph',
    filterCrBtn: 'Lọc CR',
    filterPopoverTitle: '🔍 Tìm kiếm & Lọc theo Ticket ID, Chủ đề CR, Handle by',
    filterPlaceholder: 'Nhập Ticket ID (VD: BNPL-945), CR Description, Handle by...',
    clearFilter: 'Xóa bộ lọc',
    addTopicColumn: 'Thêm Chủ đề CR (Column)',
    enterColumnTitle: 'Nhập tên chủ đề CR (VD: Usage Limit)...',
    addNewCrCard: 'Thêm CR mới',
    enterCrTitle: 'Nhập mô tả CR (CR Description)...',
    openCrStudio: 'CR Studio & Mô phỏng',
    totalCrs: 'TỔNG SỐ CR',
    devProgressAvg: 'TRUNG BÌNH DEV PROGRESS',
    totalResourceUsed: 'TỔNG RESOURCE POINT',
    deadlineWarningCount: 'CẢNH BÁO DUE DATE',
    sprintMatrixTitle: '📋 Bảng Theo Dõi Sprint CR & Resource Matrix (Chuẩn Template Excel)',
    crTrackingSection: 'Thông tin CR (Ticket ID • Status • Handle by • Dev Progress • Resource)',
    saveCrBtn: 'Lưu thông tin CR',
    frdSectionTitle: 'Tài liệu FRD & Liên kết Kiến thức Obsidian [[WikiLink]]',
    attachFrdBtn: 'Đính kèm FRD (.MD / .PDF / .DOCX)',
    exportCrMdBtn: 'Xuất CR (.MD)',
    linkedCrsLabel: 'Liên kết CR / Module hệ thống',
    linkBtn: 'Liên kết',
    insertTemplateBtn: 'Chèn khung FRD & Sequence',
    createNewSprintBoard: 'Khởi tạo Bảng Sprint Mới',
    openBoard: 'Mở Sprint'
  },
  en: {
    brandTitle: 'Chella',
    brandTagline: 'A clone of "C"onfluence - tr"ELL"o - jir"A"',
    allBoards: 'All Sprint Boards',
    boardsBtn: 'Sprint Boards',
    themeMenu: 'Theme',
    selectThemeTitle: 'SELECT WORKSPACE THEME',
    selectThemeSub: 'Customize colors, backdrop artwork, and ambient soundscape',
    recentMenu: 'Recent',
    recentBoardsTitle: 'RECENT SPRINT BOARDS',
    noBoardsFound: 'No boards found.',
    starredMenu: 'Starred',
    starredBoardsTitle: 'STARRED SPRINT BOARDS',
    noStarredBoards: 'No starred boards yet. Click the ★ icon inside any board to pin it here.',
    templatesMenu: 'Templates',
    templatesTitle: '1-CLICK SPRINT TEMPLATES',
    templatesSub: 'Create a ready-to-use Sprint board with CR topics & sample specs',
    commandBtn: '⌘K Command',
    ostPlaylist: 'Soundscape',
    ostPopoverTitle: '🎵 Ambient Soundscape & OST Playlist',
    ostPopoverSub: 'Stream theme soundtracks or play a local audio file from your computer:',
    stopMusic: 'Stop Audio',
    uploadAudioBtn: 'Select audio file (.MP3 / .WAV / .OGG) from computer',
    bilingualToggle: 'Bilingual',
    bilingualOn: 'Bilingual display enabled',
    bilingualOff: 'Single-language display',
    languageLabel: 'Language',
    sprintCycle: 'Sprint Cycle',
    configureSprint: '🗓️ Configure Sprint & Team Resource Roster',
    sprintConfigSub: 'Each Board represents a Sprint. Syncs directly with the Sprint Excel / CSV template.',
    sprintNumberLabel: 'Sprint (e.g. 34)',
    startDateLabel: 'Start date',
    endDateLabel: 'End date',
    updateTillLabel: 'Update till',
    updatedByLabel: 'By (Updated by)',
    sprintNoteLabel: 'Note (Sprint Note)',
    teamRosterLabel: 'Team Roster (Handle by) — No account required',
    addMemberPlaceholder: 'Add team member name (e.g. Lam Chi Kien)...',
    addBtn: 'Add',
    cancelBtn: 'Cancel',
    saveSprintBtn: 'Save Sprint Config',
    onTrack: 'On Track',
    deadlineAlerts: 'Due Alerts',
    deadlineCenterTitle: '⏰ Due Date for Dev & CR Progress Alerts',
    deadlineCenterSub: 'Click any CR below to inspect details or open CR Studio:',
    allOnTrackMsg: '✅ All CRs in this Sprint are currently on track!',
    importMdCsvBtn: 'Import MD / CSV',
    exportExcelBtn: 'Export Sprint Excel',
    exportCsvBtn: 'Export CSV',
    viewKanban: 'Kanban',
    viewMatrix: 'Sprint Matrix',
    viewGraph: 'Obsidian Graph',
    filterCrBtn: 'Filter CR',
    filterPopoverTitle: '🔍 Filter by Ticket ID, CR Topic, or Handle by',
    filterPlaceholder: 'Search Ticket ID (e.g. BNPL-945), CR Description, Handle by...',
    clearFilter: 'Clear filter',
    addTopicColumn: 'Add CR Topic (Column)',
    enterColumnTitle: 'Enter CR topic title (e.g. Usage Limit)...',
    addNewCrCard: 'Add new CR',
    enterCrTitle: 'Enter CR Description...',
    openCrStudio: 'CR Studio & Simulator',
    totalCrs: 'TOTAL CRS',
    devProgressAvg: 'AVG DEV PROGRESS',
    totalResourceUsed: 'TOTAL RESOURCE POINTS',
    deadlineWarningCount: 'DUE DATE ALERTS',
    sprintMatrixTitle: '📋 Sprint CR Tracking & Resource Matrix (Excel Template Standard)',
    crTrackingSection: 'CR Metadata (Ticket ID • Status • Handle by • Dev Progress • Resource)',
    saveCrBtn: 'Save CR Info',
    frdSectionTitle: 'FRD Documents & Obsidian [[WikiLink]] Knowledge Graph',
    attachFrdBtn: 'Attach FRD (.MD / .PDF / .DOCX)',
    exportCrMdBtn: 'Export CR (.MD)',
    linkedCrsLabel: 'Linked CRs / System Modules',
    linkBtn: 'Link CR',
    insertTemplateBtn: 'Insert FRD & Sequence Template',
    createNewSprintBoard: 'Create New Sprint Board',
    openBoard: 'Open Sprint'
  },
  ja: {
    brandTitle: 'Chella',
    brandTagline: 'A clone of "C"onfluence - tr"ELL"o - jir"A"',
    allBoards: 'すべての Sprint ボード',
    boardsBtn: 'Sprint ボード',
    themeMenu: 'テーマ',
    selectThemeTitle: 'ワークスペース・テーマ選択',
    selectThemeSub: '色彩・背景アート・環境サウンドを切り替え',
    recentMenu: '最近',
    recentBoardsTitle: '最近の SPRINT ボード',
    noBoardsFound: 'ボードが見つかりません。',
    starredMenu: 'スター付き',
    starredBoardsTitle: 'スター付きボード',
    noStarredBoards: 'スター付きボードはありません。ボード内の ★ アイコンで固定できます。',
    templatesMenu: 'テンプレート',
    templatesTitle: 'ワンクリック SPRINT テンプレート',
    templatesSub: 'CR トピック列とサンプル FRD を含む Sprint ボードを作成',
    commandBtn: '⌘K コマンド',
    ostPlaylist: 'サウンド',
    ostPopoverTitle: '🎵 環境サウンド & BGM プレイリスト',
    ostPopoverSub: 'テーマ別の BGM や PC 内のオーディオファイルを再生:',
    stopMusic: '停止',
    uploadAudioBtn: 'PCから音声ファイル (.MP3 / .WAV / .OGG) を選択',
    bilingualToggle: '二ヶ国語',
    bilingualOn: 'バイリンガル表示 ON',
    bilingualOff: '単一言語表示',
    languageLabel: '言語',
    sprintCycle: 'Sprint 期間',
    configureSprint: '🗓️ Sprint 設定 & 担当メンバー (Resource Roster)',
    sprintConfigSub: '1 ボード = 1 Sprint。Excel / CSV テンプレートと完全同期します。',
    sprintNumberLabel: 'Sprint 番号 (例: 34)',
    startDateLabel: 'Start date (開始日)',
    endDateLabel: 'End date (終了日)',
    updateTillLabel: 'Update till (更新日)',
    updatedByLabel: 'By (更新者)',
    sprintNoteLabel: 'Note (Sprint メモ)',
    teamRosterLabel: '担当者リスト (Handle by) — アカウント不要',
    addMemberPlaceholder: '担当者名を追加 (例: Lam Chi Kien)...',
    addBtn: '追加',
    cancelBtn: 'キャンセル',
    saveSprintBtn: 'Sprint 設定を保存',
    onTrack: '順調 (On Track)',
    deadlineAlerts: '期限アラート',
    deadlineCenterTitle: '⏰ Due date for dev & CR 進捗アラート',
    deadlineCenterSub: 'CR をクリックして詳細または CR Studio を開く:',
    allOnTrackMsg: '✅ この Sprint のすべての CR は順調に進行中です！',
    importMdCsvBtn: 'MD / CSV 読込',
    exportExcelBtn: 'Excel 出力',
    exportCsvBtn: 'CSV 出力',
    viewKanban: 'Kanban',
    viewMatrix: 'Sprint Matrix',
    viewGraph: 'Obsidian Graph',
    filterCrBtn: 'CR 絞込',
    filterPopoverTitle: '🔍 Ticket ID・CR トピック・担当者で検索',
    filterPlaceholder: 'Ticket ID (例: BNPL-945)、CR Description、Handle by...',
    clearFilter: 'クリア',
    addTopicColumn: 'CR トピック列を追加',
    enterColumnTitle: 'CR トピック名を入力 (例: Usage Limit)...',
    addNewCrCard: '新規 CR を追加',
    enterCrTitle: 'CR Description を入力...',
    openCrStudio: 'CR Studio & シミュレーター',
    totalCrs: '総 CR 数',
    devProgressAvg: '平均 DEV PROGRESS',
    totalResourceUsed: '総 RESOURCE POINT',
    deadlineWarningCount: '期限アラート',
    sprintMatrixTitle: '📋 Sprint CR 追跡 & リソースマトリックス (Excel テンプレート準拠)',
    crTrackingSection: 'CR 情報 (Ticket ID • Status • Handle by • Dev Progress • Resource)',
    saveCrBtn: 'CR 情報を保存',
    frdSectionTitle: 'FRD ドキュメント & Obsidian [[WikiLink]] 知識リンク',
    attachFrdBtn: 'FRD 添付 (.MD / .PDF / .DOCX)',
    exportCrMdBtn: 'CR 出力 (.MD)',
    linkedCrsLabel: '関連 CR / システムモジュール',
    linkBtn: 'リンク追加',
    insertTemplateBtn: 'FRD & シーケンステンプレート挿入',
    createNewSprintBoard: '新規 Sprint ボード作成',
    openBoard: '開く'
  },
  ko: {
    brandTitle: 'Chella',
    brandTagline: 'A clone of "C"onfluence - tr"ELL"o - jir"A"',
    allBoards: '전체 Sprint 보드',
    boardsBtn: 'Sprint 보드',
    themeMenu: '테마',
    selectThemeTitle: '워크스페이스 테마 선택',
    selectThemeSub: '색상, 배경 아트워크 및 앰비언트 사운드 설정',
    recentMenu: '최근 보드',
    recentBoardsTitle: '최근 SPRINT 보드',
    noBoardsFound: '보드가 없습니다.',
    starredMenu: '즐겨찾기',
    starredBoardsTitle: '즐겨찾는 SPRINT 보드',
    noStarredBoards: '즐겨찾는 보드가 없습니다. 보드 내 ★ 아이콘을 눌러 고정하세요.',
    templatesMenu: '템플릿',
    templatesTitle: '원클릭 SPRINT 템플릿',
    templatesSub: 'CR 주제 컬럼과 샘플 FRD가 포함된 Sprint 보드 생성',
    commandBtn: '⌘K 명령어',
    ostPlaylist: '사운드',
    ostPopoverTitle: '🎵 앰비언트 사운드 & 배경음악 플레이리스트',
    ostPopoverSub: '테마 사운드트랙을 스트리밍하거나 PC의 오디오 파일을 재생하세요:',
    stopMusic: '음악 끄기',
    uploadAudioBtn: 'PC에서 오디오 파일 (.MP3 / .WAV / .OGG) 선택',
    bilingualToggle: '이중 언어',
    bilingualOn: '이중 언어 표시 켜짐',
    bilingualOff: '단일 언어 표시',
    languageLabel: '언어',
    sprintCycle: 'Sprint 주기',
    configureSprint: '🗓️ Sprint 설정 & 담당자 로스터 (Resource Roster)',
    sprintConfigSub: '1 보드 = 1 Sprint. Excel / CSV 템플릿과 직접 동기화됩니다.',
    sprintNumberLabel: 'Sprint 번호 (예: 34)',
    startDateLabel: 'Start date (시작일)',
    endDateLabel: 'End date (종료일)',
    updateTillLabel: 'Update till (업데이트 기준일)',
    updatedByLabel: 'By (작성자)',
    sprintNoteLabel: 'Note (Sprint 메모)',
    teamRosterLabel: '담당자 명단 (Handle by) — 계정 불필요',
    addMemberPlaceholder: '새 담당자 이름 입력 (예: Lam Chi Kien)...',
    addBtn: '추가',
    cancelBtn: '취소',
    saveSprintBtn: 'Sprint 설정 저장',
    onTrack: '정상 진행',
    deadlineAlerts: '마감 알림',
    deadlineCenterTitle: '⏰ Due date for dev & CR 진행 알림',
    deadlineCenterSub: '아래 CR을 클릭하여 상세 정보 또는 CR Studio를 여세요:',
    allOnTrackMsg: '✅ 이번 Sprint의 모든 CR이 정상 진행 중입니다!',
    importMdCsvBtn: 'MD / CSV 가져오기',
    exportExcelBtn: 'Sprint Excel 내보내기',
    exportCsvBtn: 'CSV 내보내기',
    viewKanban: 'Kanban',
    viewMatrix: 'Sprint Matrix',
    viewGraph: 'Obsidian Graph',
    filterCrBtn: 'CR 필터',
    filterPopoverTitle: '🔍 Ticket ID, CR 주제, Handle by 검색',
    filterPlaceholder: 'Ticket ID (예: BNPL-945), CR Description, Handle by...',
    clearFilter: '필터 초기화',
    addTopicColumn: 'CR 주제 컬럼 추가',
    enterColumnTitle: 'CR 주제 입력 (예: Usage Limit)...',
    addNewCrCard: '새 CR 추가',
    enterCrTitle: 'CR Description 입력...',
    openCrStudio: 'CR Studio & 시뮬레이터',
    totalCrs: '전체 CR 수',
    devProgressAvg: '평균 DEV PROGRESS',
    totalResourceUsed: '총 RESOURCE POINT',
    deadlineWarningCount: '마감일 알림',
    sprintMatrixTitle: '📋 Sprint CR 추적 & 리소스 매트릭스 (Excel 템플릿 표준)',
    crTrackingSection: 'CR 메타데이터 (Ticket ID • Status • Handle by • Dev Progress • Resource)',
    saveCrBtn: 'CR 정보 저장',
    frdSectionTitle: 'FRD 문서 & Obsidian [[WikiLink]] 지식 그래프',
    attachFrdBtn: 'FRD 첨부 (.MD / .PDF / .DOCX)',
    exportCrMdBtn: 'CR 내보내기 (.MD)',
    linkedCrsLabel: '연결된 CR / 시스템 모듈',
    linkBtn: 'CR 연결',
    insertTemplateBtn: 'FRD & 시퀀스 템플릿 삽입',
    createNewSprintBoard: '새 Sprint 보드 만들기',
    openBoard: '보드 열기'
  }
}

// Base UI dictionary + v5/v6/extra/graph feature dictionaries, merged per language
export const TRANSLATIONS = Object.fromEntries(
  Object.keys(BASE_TRANSLATIONS).map(code => [
    code,
    {
      ...BASE_TRANSLATIONS[code],
      ...(FEATURE_TRANSLATIONS[code] || {}),
      ...(V6_TRANSLATIONS[code] || {}),
      ...(EXTRA_TRANSLATIONS[code] || {}),
      ...(GRAPH_TRANSLATIONS[code] || {})
    }
  ])
)

export const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    return SUPPORTED_LANGUAGES.some(l => l.code === saved) ? saved : 'vi'
  } catch (e) {
    return 'vi'
  }
}

export const getSavedSecondaryLanguage = () => {
  try {
    const saved = localStorage.getItem(SECONDARY_LANG_STORAGE_KEY)
    return SUPPORTED_LANGUAGES.some(l => l.code === saved) ? saved : 'en'
  } catch (e) {
    return 'en'
  }
}

export const getSavedBilingualMode = () => {
  try {
    return localStorage.getItem(BILINGUAL_STORAGE_KEY) === 'true'
  } catch (e) {
    return false
  }
}

export const setAppLanguage = (langCode) => {
  try {
    const valid = SUPPORTED_LANGUAGES.some(l => l.code === langCode) ? langCode : 'vi'
    localStorage.setItem(LANG_STORAGE_KEY, valid)
    window.dispatchEvent(new CustomEvent('chella-i18n-change', {
      detail: {
        lang: valid,
        secondaryLang: getSavedSecondaryLanguage(),
        bilingual: getSavedBilingualMode()
      }
    }))
  } catch (e) {
    // Ignore storage errors
  }
}

export const setSecondaryLanguage = (langCode) => {
  try {
    const valid = SUPPORTED_LANGUAGES.some(l => l.code === langCode) ? langCode : 'en'
    localStorage.setItem(SECONDARY_LANG_STORAGE_KEY, valid)
    window.dispatchEvent(new CustomEvent('chella-i18n-change', {
      detail: {
        lang: getSavedLanguage(),
        secondaryLang: valid,
        bilingual: getSavedBilingualMode()
      }
    }))
  } catch (e) {
    // Ignore storage errors
  }
}

export const setBilingualMode = (enabled) => {
  try {
    const boolVal = Boolean(enabled)
    localStorage.setItem(BILINGUAL_STORAGE_KEY, String(boolVal))
    window.dispatchEvent(new CustomEvent('chella-i18n-change', {
      detail: {
        lang: getSavedLanguage(),
        secondaryLang: getSavedSecondaryLanguage(),
        bilingual: boolVal
      }
    }))
  } catch (e) {
    // Ignore storage errors
  }
}
