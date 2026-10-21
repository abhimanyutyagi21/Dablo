import { useNavigate } from 'react-router-dom'

// Landing-page CTAs open the app on its sign-up screen.
export function useOpenApp() {
  const navigate = useNavigate()
  return () => navigate('/app?mode=signup')
}
