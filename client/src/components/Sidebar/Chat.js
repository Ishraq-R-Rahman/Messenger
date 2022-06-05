import React from "react";
import { Box, Typography } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import _ from "lodash";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
  bubble: {
    backgroundImage: "linear-gradient(225deg, #6CC1FF 0%, #3A8DFF 100%)",
    borderRadius: "100px",
    marginRight: 10,
  },
  text: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: -0.2,
    padding: 8,
  },
}));

const Chat = ({
  conversation,
  setActiveChat,
  setActiveChatId,
  updateMessageReadStatus,
}) => {
  const classes = useStyles();
  const { otherUser } = conversation;

  const countUnreadMessages = (conversation) => {
    return _.countBy(
      conversation?.messages,
      (message) =>
        message.senderId === conversation.otherUser.id && !message.read
    ).true;
  };

  const unreadMessageCount = countUnreadMessages(conversation);

  const handleClick = async (conversation) => {
    await setActiveChat(conversation.otherUser.username);
    await setActiveChatId(conversation.id);
    await updateMessageReadStatus({
      conversationId: conversation.id,
    }, unreadMessageCount );
  };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent
        conversation={conversation}
        unreadMessageCount={unreadMessageCount}
      />
      {unreadMessageCount > 0 ? (
        <Box className={classes.bubble}>
          <Typography className={classes.text}>{unreadMessageCount}</Typography>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default Chat;
