import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { TERMS_VERSION } from '~/pages/Auth/authHelpers'

const LEGAL_COPY = {
  terms: {
    vi: [
      {
        id: 'scope',
        title: '1. Phạm vi dịch vụ & Chấp nhận điều khoản',
        body: 'Chella là nền tảng quản lý Sprint, Change Request (CR), tài liệu đặc tả FRD và cộng tác không gian làm việc. Khi tạo tài khoản hoặc sử dụng Chella, bạn đồng ý tuân thủ các Điều khoản sử dụng này.'
      },
      {
        id: 'accounts',
        title: '2. Tài khoản, Bảo mật & Xác thực 2 lớp',
        body: 'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập, mã xác thực 2 lớp (TOTP) và các mã dự phòng của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn được xem là do bạn thực hiện.'
      },
      {
        id: 'workspaces',
        title: '3. Workspace, Quyền hạn & Nội dung người dùng',
        body: 'Bạn giữ quyền sở hữu đối với toàn bộ nội dung CR, tài liệu FRD, bình luận và tệp đính kèm do bạn tạo ra. Chủ sở hữu và quản trị viên Workspace có quyền quản lý thành viên, phân quyền và cấu hình không gian làm việc.'
      },
      {
        id: 'acceptable-use',
        title: '4. Quy tắc sử dụng hợp lệ',
        body: 'Không sử dụng Chella để phát tán mã độc, xâm phạm trái phép hệ thống, gửi thư rác hoặc vi phạm pháp luật hiện hành. Tài khoản vi phạm nghiêm trọng có thể bị tạm khóa hoặc chấm dứt.'
      },
      {
        id: 'termination',
        title: '5. Xuất dữ liệu & Xóa tài khoản',
        body: 'Bạn có thể xuất toàn bộ dữ liệu cá nhân ở định dạng JSON hoặc yêu cầu xóa tài khoản bất cứ lúc nào trong phần Cài đặt. Yêu cầu xóa có thời gian ân hạn 14 ngày trước khi dữ liệu bị xóa vĩnh viễn.'
      }
    ],
    en: [
      {
        id: 'scope',
        title: '1. Service Scope & Acceptance',
        body: 'Chella is a collaborative workspace for Sprint boards, Change Requests (CRs), FRD specifications, and team knowledge. By creating an account or using Chella, you agree to these Terms of Service.'
      },
      {
        id: 'accounts',
        title: '2. Accounts, Security & Two-Factor Authentication',
        body: 'You are responsible for safeguarding your password, two-factor authentication (TOTP) device, and backup codes. You are responsible for all activity occurring under your account.'
      },
      {
        id: 'workspaces',
        title: '3. Workspaces, Roles & User Content',
        body: 'You retain ownership of all CR cards, FRD documents, wiki pages, and comments you create. Workspace owners and administrators manage membership, permissions, and workspace settings.'
      },
      {
        id: 'acceptable-use',
        title: '4. Acceptable Use Policy',
        body: 'You may not misuse Chella to distribute malware, probe or bypass security controls, send unsolicited spam, or violate applicable laws. Accounts engaging in abuse may be suspended.'
      },
      {
        id: 'termination',
        title: '5. Data Export & Account Deletion',
        body: 'You can export a portable JSON archive of your account data or schedule account deletion at any time in Settings. Scheduled deletions include a 14-day grace period during which you may cancel.'
      }
    ],
    ja: [
      {
        id: 'scope',
        title: '1. サービスの範囲と規約への同意',
        body: 'Chella は Sprint ボード、変更要求 (CR)、FRD 仕様書、およびチームのナレッジを統合管理するワークスペースです。アカウントの作成または利用により、本規約に同意したものとみなされます。'
      },
      {
        id: 'accounts',
        title: '2. アカウントの保護と 2 段階認証',
        body: 'パスワード、2 段階認証 (TOTP) デバイス、およびバックアップコードの管理は利用者ご自身の責任となります。アカウント上で行われた操作は利用者の行為とみなされます。'
      },
      {
        id: 'workspaces',
        title: '3. Workspace・ロール・コンテンツの権利',
        body: '作成した CR カード、FRD ドキュメント、Wiki ページ、コメントの権利は利用者に帰属します。Workspace のオーナーおよび管理者はメンバーと権限を管理できます。'
      },
      {
        id: 'acceptable-use',
        title: '4. 禁止事項',
        body: 'マルウェアの配布、不正アクセス、スパム送信、法令違反となる行為を禁止します。重大な違反が確認された場合、アカウントを一時停止することがあります。'
      },
      {
        id: 'termination',
        title: '5. データエクスポートとアカウント削除',
        body: '設定画面からいつでも JSON 形式でデータをエクスポートしたり、アカウント削除を申請したりできます。削除申請後も 14 日間の猶予期間内であれば取り消しが可能です。'
      }
    ],
    ko: [
      {
        id: 'scope',
        title: '1. 서비스 범위 및 약관 동의',
        body: 'Chella는 Sprint 보드, 변경 요청(CR), FRD 명세서 및 팀 지식을 관리하는 협업 워크스페이스입니다. 계정을 생성하거나 서비스를 이용하면 본 이용약관에 동의하는 것으로 간주됩니다.'
      },
      {
        id: 'accounts',
        title: '2. 계정 보안 및 2단계 인증',
        body: '비밀번호, 2단계 인증(TOTP) 기기 및 백업 코드를 안전하게 보관할 책임은 사용자에게 있습니다. 계정에서 발생하는 모든 활동은 사용자의 책임입니다.'
      },
      {
        id: 'workspaces',
        title: '3. Workspace, 역할 및 사용자 콘텐츠',
        body: '작성한 CR 카드, FRD 문서, 위키 페이지 및 댓글의 소유권은 사용자에게 유지됩니다. Workspace 소유자와 관리자는 멤버십과 권한을 관리할 수 있습니다.'
      },
      {
        id: 'acceptable-use',
        title: '4. 올바른 서비스 이용',
        body: '악성코드 배포, 보안 통제 우회, 스팸 발송 또는 관련 법률 위반 행위를 금지합니다. 위반 시 계정 이용이 제한될 수 있습니다.'
      },
      {
        id: 'termination',
        title: '5. 데이터 내보내기 및 계정 삭제',
        body: '설정에서 언제든지 개인 데이터를 JSON 형식으로 내보내거나 계정 삭제를 요청할 수 있습니다. 삭제 요청 후 14일의 유예 기간 동안 요청을 취소할 수 있습니다.'
      }
    ]
  },
  privacy: {
    vi: [
      {
        id: 'collected',
        title: '1. Dữ liệu chúng tôi thu thập',
        body: 'Chúng tôi lưu trữ thông tin tài khoản (email, tên hiển thị, username, ảnh đại diện), tùy chọn giao diện/ngôn ngữ, nội dung công việc trên các board/workspace và nhật ký phiên đăng nhập để bảo vệ tài khoản.'
      },
      {
        id: 'usage',
        title: '2. Mục đích sử dụng dữ liệu',
        body: 'Dữ liệu được dùng để cung cấp tính năng cộng tác thời gian thực, gửi thông báo được cấu hình, xác thực bảo mật (2FA, cảnh báo đăng nhập) và đồng bộ tùy chọn cá nhân trên các thiết bị.'
      },
      {
        id: 'privacy-controls',
        title: '3. Quyền kiểm soát hiển thị hồ sơ',
        body: 'Bạn có thể tùy chỉnh mức hiển thị email, số điện thoại, múi giờ, tiểu sử và biểu đồ hoạt động (công khai, chỉ thành viên cùng Workspace hoặc chỉ mình tôi) tại mục Quyền riêng tư trong Cài đặt.'
      },
      {
        id: 'security',
        title: '4. Lưu trữ, Mã hóa & Phiên hoạt động',
        body: 'Mật khẩu được băm an toàn, phiên đăng nhập được theo dõi độc lập và bạn có thể thu hồi bất kỳ phiên thiết bị nào hoặc xem nhật ký bảo mật bất cứ lúc nào.'
      },
      {
        id: 'rights',
        title: '5. Quyền truy cập, Xuất & Xóa dữ liệu',
        body: 'Bạn có toàn quyền tải xuống bản sao dữ liệu cá nhân (JSON) hoặc yêu cầu xóa tài khoản. Khi hết thời gian ân hạn 14 ngày, thông tin định danh cá nhân sẽ được xóa hoặc ẩn danh hóa.'
      }
    ],
    en: [
      {
        id: 'collected',
        title: '1. Information We Collect',
        body: 'We store account profile fields (email, display name, username, avatar), appearance and language preferences, workspace/board collaboration content, and session security metadata.'
      },
      {
        id: 'usage',
        title: '2. How We Use Information',
        body: 'We use your data to power real-time board collaboration, deliver notifications you configure, enforce authentication and 2FA security, and synchronize your preferences across devices.'
      },
      {
        id: 'privacy-controls',
        title: '3. Granular Profile Visibility Controls',
        body: 'You control who can see your email, phone, timezone, bio, and contribution heatmap (Everyone, Shared workspace members only, or Only me) from Settings → Privacy.'
      },
      {
        id: 'security',
        title: '4. Security, Sessions & Audit Trail',
        body: 'Passwords are stored using strong cryptographic hashes. Active device sessions and security audit events are visible in your account settings so you can revoke access at any time.'
      },
      {
        id: 'rights',
        title: '5. Data Portability & Right to Erasure',
        body: 'You can export your personal data as JSON or request account deletion in Settings. After the 14-day grace window, personal identifiers are permanently removed or anonymized.'
      }
    ],
    ja: [
      {
        id: 'collected',
        title: '1. 収集する情報',
        body: 'アカウント情報（メールアドレス、表示名、ユーザー名、アバター）、テーマや言語の設定、Workspace やボード上の共同作業データ、およびセキュリティ保護のためのセッション情報を保存します。'
      },
      {
        id: 'usage',
        title: '2. 情報の利用目的',
        body: 'リアルタイムの共同作業機能の提供、設定に応じた通知の配信、2 段階認証を含むセキュリティ保護、および複数デバイス間での環境設定の同期に利用します。'
      },
      {
        id: 'privacy-controls',
        title: '3. プロフィール公開範囲の制御',
        body: '設定の「プライバシー」から、メールアドレス、電話番号、タイムゾーン、自己紹介、アクティビティの公開範囲（全員 / 同じ Workspace のメンバーのみ / 自分のみ）を個別に選択できます。'
      },
      {
        id: 'security',
        title: '4. セキュリティとセッション管理',
        body: 'パスワードは安全にハッシュ化されて保存されます。ログイン中のデバイスセッションやセキュリティ履歴はいつでも確認・失効させることができます。'
      },
      {
        id: 'rights',
        title: '5. データのエクスポートと削除権',
        body: '設定画面から個人データを JSON としてダウンロードしたり、アカウント削除をリクエストしたりできます。14 日間の猶予期間経過後、個人識別情報は削除または匿名化されます。'
      }
    ],
    ko: [
      {
        id: 'collected',
        title: '1. 수집하는 정보',
        body: '계정 프로필 정보(이메일, 표시 이름, 사용자 이름, 아바타), 테마 및 언어 환경설정, Workspace/보드 협업 콘텐츠 및 계정 보호를 위한 세션 기록을 저장합니다.'
      },
      {
        id: 'usage',
        title: '2. 정보 이용 목적',
        body: '실시간 보드 협업 기능 제공, 설정한 알림 발송, 2단계 인증 등 보안 유지, 기기 간 환경설정 동기화를 위해 데이터를 사용합니다.'
      },
      {
        id: 'privacy-controls',
        title: '3. 프로필 공개 범위 제어',
        body: '설정 → 개인정보 보호에서 이메일, 전화번호, 시간대, 소개 및 활동 히트맵의 공개 범위(전체 공개, 같은 Workspace 멤버만, 나만 보기)를 직접 지정할 수 있습니다.'
      },
      {
        id: 'security',
        title: '4. 보안, 세션 및 감사 로그',
        body: '비밀번호는 안전하게 해시 처리되어 저장됩니다. 활성 기기 세션과 보안 감사 로그를 설정에서 확인하고 언제든지 세션을 해지할 수 있습니다.'
      },
      {
        id: 'rights',
        title: '5. 데이터 이동권 및 삭제 권리',
        body: '설정에서 개인 데이터를 JSON 파일로 내보내거나 계정 삭제를 요청할 수 있습니다. 14일 유예 기간이 지나면 개인 식별 정보는 영구 삭제되거나 익명화됩니다.'
      }
    ]
  }
}

function LegalPage({ doc = 'terms' }) {
  const { lang, languages, changeLanguage, tPrimary, formatMessage } = useTranslation()
  const { themeConfig } = usePersonaTheme()

  const activeDoc = doc === 'privacy' ? 'privacy' : 'terms'
  const docByLang = LEGAL_COPY[activeDoc]
  const sections = docByLang[lang] || docByLang.en
  const title = tPrimary(activeDoc === 'privacy' ? 'legalPrivacyTitle' : 'legalTermsTitle')
  const crossLinkTo = activeDoc === 'privacy' ? '/legal/terms' : '/legal/privacy'
  const crossLinkLabel = tPrimary(activeDoc === 'privacy' ? 'legalSeeTerms' : 'legalSeePrivacy')

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) => (theme.palette.mode === 'dark'
          ? 'var(--chella-ground-dark, #0b1120)'
          : 'var(--chella-ground-light, #f8fafc)')
      }}
    >
      <Box
        component='header'
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) => (theme.palette.mode === 'dark'
            ? 'var(--chella-raised-dark, #131c31)'
            : 'var(--chella-raised-light, #ffffff)')
        }}
      >
        <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, md: 4 }, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              component={Link}
              to='/login'
              size='small'
              startIcon={<ArrowBackRoundedIcon />}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {tPrimary('legalBack')}
            </Button>
            <Divider orientation='vertical' flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SoraRibbonIcon sx={{ fontSize: 20, color: themeConfig.accentColor }} />
              <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
                Chella
              </Typography>
              <Chip
                size='small'
                label={formatMessage('legalVersion', { version: TERMS_VERSION })}
                sx={{ fontFamily: MONO_FONT, fontSize: '0.68rem', fontWeight: 700, height: 22 }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }} role='group' aria-label={tPrimary('legalLanguage')}>
            <LanguageRoundedIcon fontSize='small' sx={{ color: 'text.secondary', mr: 0.25 }} />
            {languages.map((item) => (
              <Button
                key={item.code}
                size='small'
                variant={lang === item.code ? 'contained' : 'outlined'}
                onClick={() => changeLanguage(item.code)}
                aria-pressed={lang === item.code}
                sx={{ minWidth: 42, px: 1, py: 0.25, fontSize: '0.72rem', fontWeight: 800 }}
              >
                {item.short}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      <Box component='main' sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
        <Alert severity='info' sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>
          {formatMessage('legalDraftBanner', { version: TERMS_VERSION })}
        </Alert>

        <Box sx={{ mb: 3 }}>
          <EditorialLabel index={activeDoc === 'terms' ? 1 : 2}>
            {formatMessage('legalVersion', { version: TERMS_VERSION })}
          </EditorialLabel>
          <Typography variant='h4' component='h1' sx={{ mt: 0.5, fontWeight: 800 }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: 3, alignItems: 'start' }}>
          <Box component='nav' aria-label={tPrimary('legalContents')} sx={{ ...surfaceSx, position: { md: 'sticky' }, top: { md: 24 } }}>
            <Typography variant='overline' sx={{ fontFamily: MONO_FONT, fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>
              {tPrimary('legalContents')}
            </Typography>
            <Box component='ol' sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 0.75 }}>
              {sections.map((section) => (
                <Box component='li' key={section.id}>
                  <Typography
                    component='a'
                    href={`#${section.id}`}
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                    }}
                  >
                    {section.title}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Button
              component={Link}
              to={crossLinkTo}
              variant='outlined'
              size='small'
              fullWidth
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {crossLinkLabel}
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 2 }}>
            {sections.map((section) => (
              <Box component='section' id={section.id} key={section.id} sx={surfaceSx}>
                <Typography variant='h6' component='h2' sx={{ fontWeight: 800, fontSize: '1.05rem', mb: 1 }}>
                  {section.title}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.75, maxWidth: '68ch' }}>
                  {section.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default LegalPage
