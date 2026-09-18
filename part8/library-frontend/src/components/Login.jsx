import { useState } from 'react'
import { useApolloClient, useMutation } from '@apollo/client/react'
import { LOGIN } from '../queries'
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [login, { loading }] = useMutation(LOGIN)
  const client = useApolloClient()
  const submit = async event => {
    event.preventDefault()
    setError('')
    try {
      const { data } = await login({ variables: { username, password } })
      localStorage.setItem('library-token', data.login.value)
      await client.clearStore()
      onLogin(data.login.value)
    } catch { setError('login failed: check username and password') }
  }
  return <form onSubmit={submit}><h2>login</h2>
    <label>username <input required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} /></label><br />
    <label>password <input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label><br />
    <button disabled={loading}>login</button>
    {error && <p role="alert">{error}</p>}
  </form>
}
