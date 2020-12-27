import { ApolloServer, gql } from 'apollo-server'
import axios from 'axios'

const typeDefs = gql`
  type Speaker {
    id: ID!
    first: String
    last: String
    firstLast: String
    favorite: Boolean
  }

  type SpeakerResults {
    datalist: [Speaker]
  }

  type Query {
    speakers: SpeakerResults
  }
`

const resolvers = {
  Query: {
    async speakers(parent, args, context, info) {
      const response = await axios.get('http://localhost:5000/speakers')
      return {
        datalist: response.data,
      }
    },
  },
  SpeakerResults: {
    // datalist: (parent, args, context, info) => {
    //   return parent.datalist
    // },
  },
  Speaker: {
    // id: (parent, args, context, info) => {
    //   return parent.id
    // },
    // first: (parent, args, context, info) => {
    //   return parent.first
    // },
    // last: (parent, args, context, info) => {
    //   return parent.first
    // },
    firstLast: (parent, args, context, info) => {
      return `${parent.first} ${parent.last}`
    },
    // favorite: (parent, args, context, info) => {
    //   return parent.favorite
    // },
  },
}

async function apolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const PORT = process.env.PORT || 4000

  server.listen(PORT, () => {
    console.log(`ApolloServer GraphQL Simple running at port ${PORT}`)
  })
}

apolloServer()
