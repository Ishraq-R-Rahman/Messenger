import React from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble, ReadBubble } from ".";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, userId, lastSeenText } = props;

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");
        return (
          <>
            {message.senderId === userId ? (
              <SenderBubble key={message.id} text={message.text} time={time} />
            ) : (
              <OtherUserBubble
                key={message.id}
                text={message.text}
                time={time}
                otherUser={otherUser}
              />
            )}
            {lastSeenText.id === message.id ? (
              <ReadBubble otherUser={otherUser}></ReadBubble>
            ) : (
              <></>
            )}
          </>
        );
      })}
    </Box>
  );
};

export default Messages;
