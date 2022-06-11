import React from "react";
import { Box, Badge } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";

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
  unreadBubble: {
    backgroundColor: "#3F92FF",
    marginRight: 20,
    fontSize: "10px",
    fontWeight: 700,
    lineHeight: "14px",
  },
  text: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: -0.2,
    padding: 8,
  },
}));

const Chat = ({ conversation, viewChat }) => {
  const classes = useStyles();
  const { otherUser } = conversation;

  const countUnreadMessages = (conversation) => {
    return conversation?.messages.reduce((prev, message) => {
      if (message.senderId === conversation.otherUser.id && !message.read)
        return prev + 1;
      return prev;
    }, 0);
  };

  const unreadMessageCount = countUnreadMessages(conversation);

  const handleClick = async (conversation) => {
    await viewChat(conversation, unreadMessageCount);
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
      <Badge
        badgeContent={unreadMessageCount}
        color="primary"
        classes={{ badge: classes.unreadBubble }}
      />
    </Box>
  );
};

export default Chat;
