// Localized companion dialogue shown in the board HUD. "{sprint}" is replaced with the active Sprint name.

const LINES = {
  cosmos: {
    vi: [
      'Dưới dải ngân hà và vòng hoàng đạo, mỗi CR là một vì sao trong chòm sao của {sprint}. 🌌',
      'Mở Obsidian Graph để ngắm toàn bộ mạng lưới CR, người phụ trách và tài liệu! ✦',
      'Knowledge Hub là đài thiên văn tri thức — ghi lại quyết định và liên kết bằng [[WikiLink]] nhé. 🪐'
    ],
    en: [
      'Beneath the Milky Way and the zodiac, every CR is a star in the {sprint} constellation. 🌌',
      'Open Obsidian Graph to see the whole web of CRs, owners and documents! ✦',
      'The Knowledge Hub is your observatory — record decisions and connect them with [[WikiLink]]. 🪐'
    ],
    ja: [
      '天の川と黄道の下、すべての CR は {sprint} という星座の星です。🌌',
      'Obsidian Graph を開いて、CR・担当者・ドキュメントのつながりを眺めましょう！ ✦',
      'Knowledge Hub は知識の天文台 — 意思決定を記録し [[WikiLink]] でつなぎましょう。🪐'
    ],
    ko: [
      '은하수와 황도 아래, 모든 CR 은 {sprint} 별자리의 별입니다. 🌌',
      'Obsidian Graph 를 열어 CR, 담당자, 문서의 연결망을 살펴보세요! ✦',
      'Knowledge Hub 는 지식의 천문대 — 결정을 기록하고 [[WikiLink]] 로 연결하세요. 🪐'
    ]
  },
  'wind-chime': {
    vi: [
      'Gió nhẹ thoang thoảng tiếng chuông gió... thong thả rà soát từng CR trong {sprint} nhé. 🎐',
      'Chuyển sang Timeline để xem CR nào sắp chạm Due date for dev. 🍃',
      'Vào Công cụ → Báo cáo Sprint để có ngay bản Stand-up gửi cả đội. ☁️'
    ],
    en: [
      'A soft breeze and the ring of wind chimes... take your time reviewing each CR in {sprint}. 🎐',
      'Switch to Timeline to see which CRs are approaching their Due date for dev. 🍃',
      'Tools → Sprint Report gives you a ready-to-send Stand-up for the team. ☁️'
    ],
    ja: [
      'そよ風と風鈴の音… {sprint} の CR をゆっくり確認しましょう。🎐',
      'Timeline に切り替えて、Due date for dev が近い CR を確認しましょう。🍃',
      'ツール → Sprint レポートで、チーム向けスタンドアップをすぐ作成できます。☁️'
    ],
    ko: [
      '산들바람과 풍경 소리… {sprint} 의 CR 을 천천히 검토해 보세요. 🎐',
      'Timeline 으로 전환해 Due date for dev 가 다가오는 CR 을 확인하세요. 🍃',
      '도구 → Sprint 보고서로 팀에 보낼 스탠드업을 바로 만들 수 있어요. ☁️'
    ]
  },
  furina: {
    vi: [
      'Chào mừng đến Opera Epiclese! Mọi CR trong {sprint} đều xứng đáng một màn trình diễn hoàn hảo! 💧',
      'Đừng quên kiểm tra tài liệu FRD trước giờ mở màn nghiệm thu nhé! 🎩',
      'Bộ lọc nhanh giúp tìm ngay CR quá hạn — khán giả không thích chờ đợi đâu! 🍰',
      'Nhấn Ctrl + K để triệu hồi bảng điều khiển nhanh của Fontaine! ✨'
    ],
    en: [
      'Welcome to the Opera Epiclese! Every CR in {sprint} deserves a flawless performance! 💧',
      'Remember to check the FRD before the acceptance curtain rises! 🎩',
      'Quick filters find overdue CRs instantly — the audience hates waiting! 🍰',
      'Press Ctrl + K to summon Fontaine\'s quick command panel! ✨'
    ],
    ja: [
      'エピクレシス歌劇場へようこそ！{sprint} のすべての CR に完璧な舞台を！💧',
      '受け入れの幕が上がる前に FRD を確認してね！🎩',
      'クイックフィルターで期限超過の CR をすぐ発見 — 観客は待たされるのが嫌いなの！🍰',
      'Ctrl + K でフォンテーヌのクイックコマンドを呼び出して！✨'
    ],
    ko: [
      '에피클레스 오페라 하우스에 온 걸 환영해! {sprint} 의 모든 CR 은 완벽한 무대를 누릴 자격이 있어! 💧',
      '인수 테스트 막이 오르기 전에 FRD 를 꼭 확인해! 🎩',
      '빠른 필터로 기한 초과 CR 을 바로 찾아 — 관객은 기다리는 걸 싫어하거든! 🍰',
      'Ctrl + K 로 폰타인의 빠른 명령 패널을 불러봐! ✨'
    ]
  },
  nahida: {
    vi: [
      'Mỗi tài liệu FRD và quy tắc hệ thống là một nhánh tri thức trong cây Irminsul. 🌿',
      'Hãy ghi lại quyết định vào Knowledge Hub để tri thức không bị thất lạc nhé. 📖',
      'Bạn có thể Import file Markdown (.md) hoặc CSV thành CR chỉ với một cú nhấp! 🍀',
      'CR Assistant trong chi tiết CR sẽ gợi ý subtask dựa trên nội dung yêu cầu. ✨'
    ],
    en: [
      'Every FRD and system rule is a branch of knowledge on the Irminsul tree. 🌿',
      'Record decisions in the Knowledge Hub so no wisdom gets lost. 📖',
      'Import a Markdown (.md) or CSV file into CRs with a single click! 🍀',
      'The CR Assistant inside each CR suggests subtasks based on the requirement. ✨'
    ],
    ja: [
      'FRD もシステムルールも、すべてはアーミンスルの知恵の枝です。🌿',
      '意思決定は Knowledge Hub に記録して、知恵を失わないようにしましょう。📖',
      'Markdown (.md) や CSV をワンクリックで CR に取り込めます！🍀',
      '各 CR の CR Assistant が、要件に基づいてサブタスクを提案します。✨'
    ],
    ko: [
      '모든 FRD 와 시스템 규칙은 이르민술 나무의 지식 가지랍니다. 🌿',
      '결정은 Knowledge Hub 에 기록해 지혜를 잃지 않도록 해요. 📖',
      'Markdown (.md) 이나 CSV 를 한 번에 CR 로 가져올 수 있어요! 🍀',
      '각 CR 의 CR Assistant 가 요구사항을 바탕으로 하위 작업을 제안해요. ✨'
    ]
  },
  default: {
    vi: [
      'Thỏ bông Usagi luôn đồng hành cùng bạn theo dõi các CR trong {sprint}... 🐰',
      'Dưới bầu trời bình yên, hãy hoàn thiện từng đặc tả FRD thật tỉ mỉ nhé. ☁️',
      'Đừng quên kiểm tra cảnh báo Due date trên thanh công cụ để không lỡ mốc nào. 💌',
      'Nhấn Ctrl + K bất cứ lúc nào để mở nhanh bảng lệnh! 🎀'
    ],
    en: [
      'Usagi the plush bunny is always here to help you track every CR in {sprint}... 🐰',
      'Under the peaceful sky, polish each FRD specification with care. ☁️',
      'Keep an eye on the Due date alerts in the toolbar so no milestone slips by. 💌',
      'Press Ctrl + K anytime to open the command palette! 🎀'
    ],
    ja: [
      'うさぎのぬいぐるみ Usagi が {sprint} の CR 管理をいつもお手伝い… 🐰',
      '穏やかな空の下、FRD をひとつずつ丁寧に仕上げましょう。☁️',
      'ツールバーの期限アラートを確認して、マイルストーンを逃さないように。💌',
      'Ctrl + K でいつでもコマンドパレットを開けます！🎀'
    ],
    ko: [
      '토끼 인형 Usagi 가 {sprint} 의 모든 CR 추적을 함께해요… 🐰',
      '평화로운 하늘 아래, FRD 명세를 하나하나 꼼꼼히 완성해요. ☁️',
      '툴바의 기한 알림을 확인해 마일스톤을 놓치지 마세요. 💌',
      'Ctrl + K 로 언제든 명령 팔레트를 열 수 있어요! 🎀'
    ]
  }
}

export const getCompanionLines = (themeKey, lang = 'vi', sprintName = 'Sprint') => {
  const byTheme = LINES[themeKey] || LINES.default
  const list = byTheme[lang] || byTheme.en
  return list.map(line => line.replace('{sprint}', sprintName))
}
