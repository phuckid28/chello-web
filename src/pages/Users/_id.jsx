// Legacy `/users/:id` route → v7 public profile `/u/:username` (the API resolves usernames; ids are passed through)
import { Navigate, useParams } from 'react-router-dom'

export default function UserDetails() {
  const { userId } = useParams()
  return <Navigate to={userId ? `/u/${encodeURIComponent(userId)}` : '/boards'} replace={true} />
}
