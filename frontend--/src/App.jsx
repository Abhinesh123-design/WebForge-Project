import AuthPage from './AuthPage.jsx'
import HomePage from './HomePage.jsx'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase()

  if (path === '/login') {
    return <AuthPage mode="login" />
  }

  if (path === '/signup') {
    return <AuthPage mode="signup" />
  }

  return (
    <HomePage />
  )
}

export default App
