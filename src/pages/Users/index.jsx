// Legacy `/users` route → boards home (the v7 directory lives in workspace member pages)
import { Navigate } from 'react-router-dom'

export default function Users() {
  return <Navigate to='/boards' replace={true} />
}
