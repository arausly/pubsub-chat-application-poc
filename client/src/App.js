import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";

//apollo-client
import client from "./client";

//components
import Chat from "./Chat";

const App = () => {
  return (
    <ApolloProvider client={client}>
      <div className="container">
        <h1 className="text-center">ChatMix</h1>
        <Chat />
      </div>
    </ApolloProvider>
  );
};

export default App;
