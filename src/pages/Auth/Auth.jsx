import { useLocation, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import AuthLayout from './AuthLayout'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

function Auth() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  const isRegister = location.pathname === '/register'

  const currentUser = useSelector(selectCurrentUser)
  if (currentUser) {
    return <Navigate to='/' replace={true} />
  }

  return (
    <AuthLayout>
      {isLogin && <LoginForm />}
      {isRegister && <RegisterForm />}
    </AuthLayout>
  )
}

export default Auth
