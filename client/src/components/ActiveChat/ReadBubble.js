import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Avatar } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    justifyContent: "right",
    paddingBottom: 10
  },
  avatar: {
    height: 20,
    width: 20,
    marginRight: 11,
    marginTop: 6,
  }
}));

const ReadBubble = ({ otherUser }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Avatar
        alt={otherUser.username}
        src={otherUser.photoUrl}
        className={classes.avatar}
      />
    </Box>
  );
};

export default ReadBubble;
