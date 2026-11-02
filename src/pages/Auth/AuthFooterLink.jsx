import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'

// Footer line of the auth card: muted prompt + accent router link ("New to Chella? Create account")
function AuthFooterLink({ prompt, to, label }) {
  return (
    <>
      {prompt && <Typography variant='body2' color='text.secondary'>{prompt}</Typography>}
      <Typography
        component={Link}
        to={to}
        variant='body2'
        sx={{ display: 'inline-block', mt: 0.25, fontWeight: 800, color: 'primary.main', textDecoration: 'none', '&:hover, &:focus-visible': { textDecoration: 'underline' } }}
      >
        {label}
      </Typography>
    </>
  )
}

export default AuthFooterLink
