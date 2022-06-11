const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");
const { Op } = require("sequelize");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      const message = await Message.create({ senderId, text, conversationId });
      return res.json({ message, sender });
    }
    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (onlineUsers.includes(sender.id)) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

// expects {conversationId} in body, updates read status of all the messages from the sender in the conversation
router.put("/read-status", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(400);
    }

    // Making sure the req.user is part of the conversation
    const conversation = await Conversation.findByPk(req.body.conversationId);

    if (
      !conversation ||
      (conversation.user1Id !== req.user.id &&
        conversation.user2Id !== req.user.id)
    ) {
      return res.sendStatus(400);
    }

    await Message.update(
      {
        read: true,
      },
      {
        where: {
          conversationId: req.body.conversationId,
          read: false,
          senderId: {
            [Op.not]: req.user.id,
          },
        },
      }
    );

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
