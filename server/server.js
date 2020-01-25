const { ApolloServer, PubSub, gql } = require("apollo-server");

const pubSub = new PubSub();
const chats = [];
const CHAT_CHANNEL = "CHAT_CHANNEL";

pubSub.ee.setMaxListeners(1000);

const server = new ApolloServer({
  typeDefs: gql`
    type Chat {
      id: Int!
      from: String!
      message: String!
    }

    type Query {
      chats: [Chat!]
    }

    type Mutation {
      sendMessage(from: String!, message: String!): Chat
    }

    type Subscription {
      messageSent: Chat
    }
  `,
  resolvers: {
    Subscription: {
      messageSent: {
        subscribe: () => pubSub.asyncIterator([CHAT_CHANNEL])
      }
    },
    Query: {
      chats(_, args, ctx, info) {
        return chats;
      }
    },
    Mutation: {
      sendMessage(_, { from, message }, ctx, info) {
        const chat = { id: chats.length + 1, from, message };

        chats.push(chat);
        pubSub.publish("CHAT_CHANNEL", { messageSent: chat });

        return chat;
      }
    }
  },
  subscriptions: {
    onConnect: (connectionParams, webSocket) => {}
  },
  context({ req }) {
    return {
      pubSub
    };
  }
});

server.listen(8080).then(({ url, subscriptionsUrl }) => {
  console.log(`Graphql server is running 🏃🏃 at ${url}`);
  console.log(`subscriptions are ready at ${subscriptionsUrl}`);
});
