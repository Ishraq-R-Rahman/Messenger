import React, {
  useCallback,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { SidebarContainer } from "../components/Sidebar";
import { ActiveChat } from "../components/ActiveChat";
import { SocketContext } from "../context/socket";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();

  const socket = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const activeConversationIdRef = useRef(activeConversationId);

  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const addSearchedUsers = (users) => {
    const currentUsers = {};

    // make table of current users so we can lookup faster
    conversations.forEach((convo) => {
      currentUsers[convo.otherUser.id] = true;
    });

    const newState = [...conversations];
    users.forEach((user) => {
      // only create a fake convo if we don't already have a convo with this user
      if (!currentUsers[user.id]) {
        let fakeConvo = { otherUser: user, messages: [] };
        newState.push(fakeConvo);
      }
    });

    setConversations(newState);
  };

  const clearSearchedUsers = () => {
    setConversations((prev) => prev.filter((convo) => convo.id));
  };

  const saveMessage = async (body) => {
    const { data } = await axios.post("/api/messages", body);
    return data;
  };

  const sendMessage = (data, body) => {
    socket.emit("new-message", {
      message: data.message,
      recipientId: body.recipientId,
      sender: data.sender,
    });
  };

  const postMessage = async (body) => {
    try {
      const data = await saveMessage(body);

      if (!body.conversationId) {
        addNewConvo(body.recipientId, data.message);
      } else {
        addMessageToConversation(data);
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
  };

  const viewChat = async (conversation, unreadMessageCount) => {
    await setActiveChat(conversation.otherUser.username);
    await setActiveChatId(conversation.id);
    await updateMessageReadStatus(
      {
        conversationId: conversation.id,
      },
      unreadMessageCount
    );
  };

  /** This function checks if both user has the chat active for each other */
  const checkIfBothActive = (message , newConvo = false) => {
    if( newConvo )
      setActiveChatId(message.conversationId);

    if (activeConversationIdRef.current === message.conversationId) {
      updateMessageReadStatus(
        {
          conversationId: message.conversationId,
        },
        1
      );
    }
  }

  /** This function sets the read status for appropriate messages for a user
   * selfCheck allows the function update read status either for themselves or for the other user
   */
  const saveReadMessageStatus = (conversationId, selfCheck) => {
    setConversations((prev) =>
      prev.map((conversation) => {
        const conversationCopy = { ...conversation };
        if (conversationCopy?.id === conversationId) {
          const conversationMessagesCopy = [...conversationCopy?.messages];
          conversationMessagesCopy.forEach( (message) => {
            if (
              selfCheck &&
              message.senderId === conversationCopy?.otherUser.id
            )
              message.read = true;
            else if (!selfCheck && message.senderId === user.id)
              message.read = true;
          });
          conversationCopy.messages = conversationMessagesCopy;
        }

        return conversationCopy;
      })
    );
  };

  const updateMessageReadStatus = async (body, unreadMessageCount) => {
    try {
      if (unreadMessageCount > 0)
        saveReadMessageStatus(body.conversationId, true);

      await axios.put("/api/messages/read-status", body);

      socket.emit("active-chat", {
        conversationId: body.conversationId,
        unreadMessageCount,
      });
    } catch (error) {
      console.error(error);
    }
  };

  /** This function runs if the user is currently active in the conversation */
  const userCurrentlyActive = useCallback((data) => {
    if (data.unreadMessageCount > 0)
      saveReadMessageStatus(data.conversationId, false);
  }, []);

  const addNewConvo = useCallback(
    (recipientId, message) => {
      setConversations((prev) => {
        const conversationsListCopy = [];
        prev.forEach((convo) => {
          if (convo.otherUser.id === recipientId) {
            const convoCopy = { ...convo };
            convoCopy.messages = [...convoCopy.messages, message];
            convoCopy.latestMessageText = message.text;
            convoCopy.id = message.conversationId;
            conversationsListCopy.unshift(convoCopy);
          } else {
            conversationsListCopy.push(convo);
          }
        });

        return conversationsListCopy;
      });

      checkIfBothActive(message , true);
    },
    [setConversations]
  );

  const addMessageToConversation = useCallback(
    (data) => {
      // if sender isn't null, that means the message needs to be put in a brand new convo
      const { message, sender = null } = data;
      if (sender !== null) {
        const newConvo = {
          id: message.conversationId,
          otherUser: sender,
          messages: [message],
        };
        newConvo.latestMessageText = message.text;
        setConversations((prev) => [newConvo, ...prev]);
      } else {
        setConversations((prev) => {
          const conversationsListCopy = [];
          prev.forEach((convo) => {
            if (convo.id === message.conversationId) {
              const convoCopy = { ...convo };
              convoCopy.messages = [...convoCopy.messages, message];
              convoCopy.latestMessageText = message.text;
              conversationsListCopy.unshift(convoCopy);
            } else {
              conversationsListCopy.push(convo);
            }
          });

          return conversationsListCopy;
        });
      }

      checkIfBothActive(message);
    },
    [setConversations]
  );

  const setActiveChat = (username) => {
    setActiveConversation(username);
  };

  const setActiveChatId = (conversationId) => {
    setActiveConversationId(conversationId);
  };

  const addOnlineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const removeOfflineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  // Lifecycle

  useEffect(() => {
    // Socket init
    socket.on("add-online-user", addOnlineUser);
    socket.on("remove-offline-user", removeOfflineUser);
    socket.on("new-message", addMessageToConversation);
    socket.on("active-chat", userCurrentlyActive);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off("add-online-user", addOnlineUser);
      socket.off("remove-offline-user", removeOfflineUser);
      socket.off("new-message", addMessageToConversation);
      socket.off("active-chat", userCurrentlyActive);
    };
  }, [
    addMessageToConversation,
    addOnlineUser,
    removeOfflineUser,
    userCurrentlyActive,
    socket,
  ]);

  useEffect(() => {
    // when fetching, prevent redirect
    if (user?.isFetching) return;

    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      // If we were previously logged in, redirect to login instead of register
      if (isLoggedIn) history.push("/login");
      else history.push("/register");
    }
  }, [user, history, isLoggedIn]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get("/api/conversations");
        data.forEach((user) => {
          user.messages = user.messages.reverse(); // Reversing the order of messages so that texts appear in ascending order of time
        });
        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (!user.isFetching) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer
          conversations={conversations}
          user={user}
          clearSearchedUsers={clearSearchedUsers}
          addSearchedUsers={addSearchedUsers}
          setActiveChat={setActiveChat}
          setActiveChatId={setActiveChatId}
          updateMessageReadStatus={updateMessageReadStatus}
          viewChat={viewChat}
        />
        <ActiveChat
          activeConversation={activeConversation}
          conversations={conversations}
          user={user}
          postMessage={postMessage}
        />
      </Grid>
    </>
  );
};

export default Home;
