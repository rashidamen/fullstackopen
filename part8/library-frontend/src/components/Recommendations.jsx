import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'
import { BookTable } from './Books'
export default function Recommendations() {
  const user = useQuery(ME)
  const genre = user.data?.me?.favoriteGenre
  const books = useQuery(ALL_BOOKS, { variables: { genre }, skip: !genre })
  return <section><h2>recommendations</h2>
    {(user.loading || books.loading) && <p>loading...</p>}
    {(user.error || books.error) && <p role="alert">{(user.error || books.error).message}</p>}
    {genre && <><p>books in your favorite genre <strong>{genre}</strong></p>
      <BookTable books={books.data?.allBooks || []} /></>}
  </section>
}
