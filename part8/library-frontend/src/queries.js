import { gql } from '@apollo/client'
export const BOOK_FIELDS = gql`
  fragment BookFields on Book { id title published genres author { id name born bookCount } }
`
export const ALL_BOOKS = gql`
  query AllBooks($genre: String) { allBooks(genre: $genre) { ...BookFields } }
  ${BOOK_FIELDS}
`
export const ALL_AUTHORS = gql`query AllAuthors { allAuthors { id name born bookCount } }`
export const ME = gql`query Me { me { id username favoriteGenre } }`
export const LOGIN = gql`mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) { value }
}`
export const ADD_BOOK = gql`
  mutation AddBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(title: $title, author: $author, published: $published, genres: $genres) { ...BookFields }
  }
  ${BOOK_FIELDS}
`
export const EDIT_AUTHOR = gql`mutation EditAuthor($name: String!, $setBornTo: Int!) {
  editAuthor(name: $name, setBornTo: $setBornTo) { id name born bookCount }
}`
export const BOOK_ADDED = gql`subscription BookAdded { bookAdded { ...BookFields } } ${BOOK_FIELDS}`
