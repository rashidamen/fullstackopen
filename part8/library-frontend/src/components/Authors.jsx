import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

export default function Authors({ loggedIn }) {
  const { data, loading, error } = useQuery(ALL_AUTHORS)
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const [message, setMessage] = useState('')
  const [editAuthor, { loading: saving }] = useMutation(EDIT_AUTHOR)
  const authors = data?.allAuthors || []
  const selected = name || authors[0]?.name || ''
  const submit = async event => {
    event.preventDefault()
    setMessage('')
    try {
      await editAuthor({ variables: { name: selected, setBornTo: Number(born) } })
      setBorn('')
    } catch (error) { setMessage(error.message) }
  }
  return <section>
    <h2>authors</h2>
    {loading && <p>loading...</p>}
    {error && <p role="alert">{error.message}</p>}
    <table><thead><tr><th></th><th>born</th><th>books</th></tr></thead>
      <tbody>{authors.map(author => <tr key={author.id}>
        <td>{author.name}</td><td>{author.born}</td><td>{author.bookCount}</td>
      </tr>)}</tbody>
    </table>
    {loggedIn && <form onSubmit={submit}>
      <h2>Set birthyear</h2>
      <label>name <select name="name" value={selected} onChange={event => setName(event.target.value)}>
        {authors.map(author => <option key={author.id} value={author.name}>{author.name}</option>)}
      </select></label><br />
      <label>born <input type="number" required value={born} onChange={event => setBorn(event.target.value)} /></label><br />
      <button disabled={saving || !selected}>update author</button>
      {message && <p role="alert">{message}</p>}
    </form>}
  </section>
}
