import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client/react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommendations from './components/Recommendations'
import { BOOK_ADDED } from './queries'
import { refreshLibrary } from './client'

export default function App() {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(() => localStorage.getItem('library-token'))
  const [notice, setNotice] = useState('')
  const client = useApolloClient()
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const book = data.data?.bookAdded
      if (book) {
        setNotice('A new book was added to the library.')
        refreshLibrary(client).catch(error => setNotice(error.message))
      }
    },
  })
  const logout = async () => {
    localStorage.removeItem('library-token')
    setToken(null)
    setPage('authors')
    await client.resetStore()
  }
  return <main>
    <nav>
      <button onClick={() => setPage('authors')}>authors</button>{' '}
      <button onClick={() => setPage('books')}>books</button>{' '}
      {token ? <>
        <button onClick={() => setPage('add')}>add book</button>{' '}
        <button onClick={() => setPage('recommend')}>recommend</button>{' '}
        <button onClick={logout}>logout</button>
      </> : <button onClick={() => setPage('login')}>login</button>}
    </nav>
    {notice && <p role="status">{notice} <button onClick={() => setNotice('')}>dismiss</button></p>}
    {page === 'authors' && <Authors loggedIn={!!token} />}
    {page === 'books' && <Books />}
    {page === 'add' && token && <NewBook />}
    {page === 'recommend' && token && <Recommendations />}
    {page === 'login' && <Login onLogin={value => { setToken(value); setPage('authors') }} />}
  </main>
}
