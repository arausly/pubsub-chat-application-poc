import React, { useState, useEffect } from "react";

//graphql
import gql from "graphql-tag";
import { useMutation, useSubscription, useQuery } from "@apollo/react-hooks";

const CHAT_SUBSCRIPTION = gql`
  subscription onMessageSent {
    messageSent {
      from
      message
    }
  }
`;

const CHAT_MUTATION = gql`
  mutation sendMessageMutation($from: String!, $message: String!) {
    sendMessage(from: $from, message: $message) {
      id
      from
      message
    }
  }
`;

const CHAT_QUERY = gql`
  query getAllChats {
    chats {
      id
      from
      message
    }
  }
`;

export default () => {
  const [username, setUserName] = useState("");
  const { error, data, loading } = useSubscription(CHAT_SUBSCRIPTION);
  const [sendMessage] = useMutation(CHAT_MUTATION);
  const chatsQuery = useQuery(CHAT_QUERY);
  const [allChats, setAllChats] = useState([]);

  useEffect(() => {
    if (!allChats.length && chatsQuery.data) {
      setAllChats(chatsQuery.data.chats);
    }
    chatsQuery.subscribeToMore({
      document: CHAT_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        let previousChats = prev.chats;
        if (prev.chats.length !== allChats.length) {
          previousChats = allChats;
        }
        let newAllChats = [...previousChats, subscriptionData.data.messageSent];
        console.log(prev.chats);
        setAllChats(newAllChats);
      }
    });
  });

  const enterChat = e => {
    e.preventDefault();
    if (username) {
      sendMessage({
        variables: {
          from: username,
          message: e.target.chat.value
        }
      });
      e.target.chat.value = "";
    } else {
      setUserName(e.target.username.value);
      e.target.username.value = "";
    }
  };

  return (
    <div id="app" className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-header">Chatbox</div>
                    <div className="card-body">
                      <ul>
                        {(chatsQuery.loading && <p>Loading...</p>) ||
                          allChats.map(({ from, message }, key) => (
                            <li key={key}>
                              <p>{from}</p>
                              <p>{message}</p>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <form method="post" onSubmit={enterChat}>
                    <div className="form-group">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder={
                            (username && "Enter new Chat") ||
                            "Enter your username"
                          }
                          name={(username && "chat") || "username"}
                        />
                        <div className="input-group-append">
                          <button
                            className="btn btn-primary"
                            onClick={() => {}}
                          >
                            Enter
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
