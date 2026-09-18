import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import { client } from './client'
import App from './App'
ReactDOM.createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}><App /></ApolloProvider>,
)
