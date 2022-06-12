import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: (props) => (props.unreadMessageCount > 0 ? "black" : "#9CADC8"),
    letterSpacing: -0.17,
    fontWeight: (props) => (props.unreadMessageCount > 0 ? 600 : "inherit"),
  },
  highlightedText: (props) => ({}),
}));

const ChatContent = ({ conversation, unreadMessageCount }) => {
  const classes = useStyles({
    unreadMessageCount,
  });

  const { otherUser } = conversation;
  const latestMessageText = conversation.id && conversation.latestMessageText;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={classes.previewText}>
          {latestMessageText}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatContent;
