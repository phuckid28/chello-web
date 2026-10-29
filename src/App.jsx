import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NotFound from './pages/404/NotFound'
import Auth from './pages/Auth/Auth'
import AccountVerification from './pages/Auth/AccountVerification'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import PageTransition from '~/fx/PageTransition'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

// Route-level code splitting: each workspace area is downloaded only when visited
const Boards = lazy(() => import('~/pages/Boards'))
const Board = lazy(() => import('~/pages/Boards/_id'))
const CrStudio = lazy(() => import('~/pages/CrStudio/CrStudio'))
const KnowledgeHub = lazy(() => import('~/pages/KnowledgeHub/KnowledgeHub'))
const Settings = lazy(() => import('~/pages/Settings/Settings'))

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/login' replace={true} />
  return (
    <Suspense fallback={<PageLoadingSpinner caption='Chella' />}>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </Suspense>
  )
}

function App() {
  const currentUser = useSelector(selectCurrentUser)

  return (
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
        <Route path='/settings/account' element={<Settings />} />
        <Route path='/settings/security' element={<Settings />} />
        <Route path='/settings/appearance' element={<Settings />} />
      </Route>

      {/* Authentication */}
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />
      <Route path='/account/verification' element={<AccountVerification />} />

      {/* 404 not found page */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
