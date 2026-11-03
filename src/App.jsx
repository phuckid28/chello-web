import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NotFound from './pages/404/NotFound'
import Auth from './pages/Auth/Auth'
import AccountVerification from './pages/Auth/AccountVerification'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import PageTransition from '~/fx/PageTransition'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import PreferencesSync from '~/components/Account/PreferencesSync'
import DeletionBanner from '~/components/Account/DeletionBanner'
import SystemStatusBanner from '~/components/Account/SystemStatusBanner'

// Route-level code splitting: each workspace area is downloaded only when visited
const Boards = lazy(() => import('~/pages/Boards'))
const Board = lazy(() => import('~/pages/Boards/_id'))
const CrStudio = lazy(() => import('~/pages/CrStudio/CrStudio'))
const KnowledgeHub = lazy(() => import('~/pages/KnowledgeHub/KnowledgeHub'))
const Settings = lazy(() => import('~/pages/Settings/Settings'))
// v7 User System pages
const ForgotPassword = lazy(() => import('~/pages/Auth/ForgotPassword'))
const ResetPassword = lazy(() => import('~/pages/Auth/ResetPassword'))
const LegalPage = lazy(() => import('~/pages/Legal/LegalPage'))
const InviteAccept = lazy(() => import('~/pages/Invite/InviteAccept'))
const ProfilePage = lazy(() => import('~/pages/Profile/ProfilePage'))
const LegacyUserRedirect = lazy(() => import('~/pages/Users/_id'))
const WorkspaceOverview = lazy(() => import('~/pages/Workspaces/WorkspaceOverview'))
const WorkspaceMembers = lazy(() => import('~/pages/Workspaces/WorkspaceMembers'))
const WorkspaceSettings = lazy(() => import('~/pages/Workspaces/WorkspaceSettings'))
const InboxPage = lazy(() => import('~/pages/Inbox/InboxPage'))
const MyWorkPage = lazy(() => import('~/pages/MyWork/MyWorkPage'))
const OnboardingPage = lazy(() => import('~/pages/Onboarding/OnboardingPage'))
const AdminConsole = lazy(() => import('~/pages/Admin/AdminConsole'))

const SETTINGS_TABS = ['account', 'profile', 'security', 'sessions', 'notifications', 'privacy', 'appearance', 'data']

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/login' replace={true} />
  return (
    <Suspense fallback={<PageLoadingSpinner caption='Chella' />}>
      <SystemStatusBanner />
      <DeletionBanner />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </Suspense>
  )
}

// Global admin console guard (contract §7): non-admins never see the route
const AdminRoute = ({ user }) => {
  if (user?.role !== 'admin') return <Navigate to='/boards' replace={true} />
  return <Outlet />
}

// Public pages (legal, password recovery, invite preview) still lazy-load
const PublicRoute = () => (
  <Suspense fallback={<PageLoadingSpinner caption='Chella' />}>
    <Outlet />
  </Suspense>
)

function App() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <>
      {currentUser && <PreferencesSync />}
      <Routes>
        {/* Redirect Route */}
        <Route path='/' element={
          <Navigate to='/boards' replace={true} />
        } />

        {/* Protected Routes: Chỉ cho phép truy cập sau khi đã đăng nhập */}
        <Route element={<ProtectedRoute user={currentUser} />}>
          <Route path='/boards' element={<Boards />} />
          <Route path='/boards/:boardId' element={<Board />} />
          <Route path='/boards/:boardId/cr/:cardId' element={<CrStudio />} />
          <Route path='/boards/:boardId/wiki' element={<KnowledgeHub />} />
          <Route path='/boards/:boardId/wiki/:pageId' element={<KnowledgeHub />} />
          <Route path='/settings' element={<Navigate to='/settings/account' replace={true} />} />
          {SETTINGS_TABS.map(tab => (
            <Route key={tab} path={`/settings/${tab}`} element={<Settings />} />
          ))}
          <Route path='/u/:username' element={<ProfilePage />} />
          <Route path='/users/:userId' element={<LegacyUserRedirect />} />
          <Route path='/workspaces/:workspaceId' element={<WorkspaceOverview />} />
          <Route path='/workspaces/:workspaceId/members' element={<WorkspaceMembers />} />
          <Route path='/workspaces/:workspaceId/settings' element={<WorkspaceSettings />} />
          <Route path='/inbox' element={<InboxPage />} />
          <Route path='/my-work' element={<MyWorkPage />} />
          <Route path='/onboarding' element={<OnboardingPage />} />
          <Route element={<AdminRoute user={currentUser} />}>
            <Route path='/admin' element={<AdminConsole />} />
          </Route>
        </Route>

        {/* Authentication */}
        <Route path='/login' element={<Auth />} />
        <Route path='/register' element={<Auth />} />
        <Route path='/account/verification' element={<AccountVerification />} />

        {/* Public v7 pages */}
        <Route element={<PublicRoute />}>
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/invite/:token' element={<InviteAccept />} />
          <Route path='/legal/terms' element={<LegalPage doc='terms' />} />
          <Route path='/legal/privacy' element={<LegalPage doc='privacy' />} />
        </Route>

        {/* 404 not found page */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
