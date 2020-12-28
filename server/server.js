import { ApolloServer, gql, UserInputError } from 'apollo-server'
import axios from 'axios'

const typeDefs = gql`
  type Speaker {
    id: ID!
    first: String!
    last: String!
    firstLast: String
    favorite: Boolean
  }

  input SpeakerInput {
    first: String!
    last: String!
    favorite: Boolean!
  }

  type SpeakerResults {
    datalist: [Speaker]
  }

  type Query {
    speakers: SpeakerResults
  }

  type Mutation {
    toggleSpeakerFavorite(speakerId: ID!): Speaker
    addSpeaker(speaker: SpeakerInput!): Speaker
    deleteSpeaker(speakerId: ID!): Speaker
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
  Mutation: {
    async toggleSpeakerFavorite(parent, args, context, info) {
      const response = await axios.get(`http://localhost:5000/speakers/${args.speakerId}`)
      const toggledData = { ...response.data, favorite: !response.data.favorite }
      await axios.put(`http://localhost:5000/speakers/${args.speakerId}`, toggledData)
      return toggledData
    },
    async addSpeaker(parent, args, context, info) {
      const { first, last, favorite } = args.speaker

      const allSpeakers = await axios.get('http://localhost:5000/speakers')

      const foundRec = allSpeakers.data.find(
        (speaker) => speaker.first === first && speaker.last === last
      )
      if (foundRec) {
        throw new UserInputError('first and last already exist', { invalidArgs: Object.keys(args) })
      }

      const newSpeaker = await axios.post('http://localhost:5000/speakers', {
        first,
        last,
        favorite,
      })
      return newSpeaker.data
    },
    async deleteSpeaker(parent, args, context, info) {
      const url = `http://localhost:5000/speakers/${args.speakerId}`
      const foundRec = await axios.get(url)
      await axios.delete(url)
      return foundRec.data
    },
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
