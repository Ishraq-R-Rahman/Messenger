const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");

// associations

User.belongsToMany(Conversation, { through: "participants" });
Conversation.belongsToMany(User, { through: "participants" });
Message.belongsTo(Conversation);
Conversation.hasMany(Message);

Message.belongsToMany(User, { through: "read_messages" });
User.belongsToMany(Message, { through: "read_messages" });

module.exports = {
  User,
  Conversation,
  Message,
};
