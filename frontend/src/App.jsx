import { useAuthContext } from './context/AuthContext'
import AppRouter from './router/index.jsx'

function App() {
  const { isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--text)'
      }}>
        Cargando...
      </div>
    )
  }

  return <AppRouter />
}

export default App
