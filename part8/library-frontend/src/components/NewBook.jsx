import { useState } from 'react'
import { useApolloClient, useMutation } from '@apollo/client/react'
import { ADD_BOOK } from '../queries'
import { refreshLibrary } from '../client'
export default function NewBook() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [message, setMessage] = useState('')
  const [addBook, { loading }] = useMutation(ADD_BOOK)
  const client = useApolloClient()
  const addGenre = () => {
    if (genre.trim()) setGenres([...new Set([...genres, genre.trim()])])
    setGenre('')
  }
  const submit = async event => {
    event.preventDefault()
    setMessage('')
    const chosen = [...new Set([...genres, ...(genre.trim() ? [genre.trim()] : [])])]
    try {
      await addBook({ variables: { title, author, published: Number(published), genres: chosen } })
      await refreshLibrary(client)
      setTitle(''); setAuthor(''); setPublished(''); setGenres([]); setGenre('')
      setMessage('Book saved')
    } catch (error) { setMessage(error.message) }
  }
  return <form onSubmit={submit}>
    <h2>add book</h2>
    <label>title <input required value={title} onChange={e => setTitle(e.target.value)} /></label><br />
    <label>author <input required value={author} onChange={e => setAuthor(e.target.value)} /></label><br />
    <label>published <input required type="number" value={published} onChange={e => setPublished(e.target.value)} /></label><br />
    <label>genre <input value={genre} onChange={e => setGenre(e.target.value)} /></label>
    <button type="button" onClick={addGenre}>add genre</button>
    <p>genres: {genres.join(' ')}</p>
    <button disabled={loading}>create book</button>
    {message && <p role="status">{message}</p>}
  </form>
}
