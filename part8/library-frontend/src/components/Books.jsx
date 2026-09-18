import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'
export function BookTable({ books }) {
  return <table><thead><tr><th></th><th>author</th><th>published</th></tr></thead>
    <tbody>{books.map(book => <tr key={book.id}>
      <td>{book.title}</td><td>{book.author.name}</td><td>{book.published}</td>
    </tr>)}</tbody>
  </table>
}
export default function Books() {
  const [genre, setGenre] = useState(null)
  const all = useQuery(ALL_BOOKS, { variables: { genre: null } })
  const filtered = useQuery(ALL_BOOKS, { variables: { genre } })
  const genres = [...new Set((all.data?.allBooks || []).flatMap(book => book.genres))]
  return <section><h2>books</h2>
    {genre && <p>in genre <strong>{genre}</strong></p>}
    {filtered.loading && <p>loading...</p>}
    {filtered.error && <p role="alert">{filtered.error.message}</p>}
    <BookTable books={filtered.data?.allBooks || []} />
    {genres.map(item => <button key={item} onClick={() => setGenre(item)}>{item}</button>)}
    <button onClick={() => setGenre(null)}>all genres</button>
  </section>
}
