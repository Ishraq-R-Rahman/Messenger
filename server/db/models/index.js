const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");

// associations

User.belongsToMany(Conversation, { through: "participants" });
Conversation.belongsToMany(User, { through: "participants" });
Message.belongsTo(Conversation);
Conversation.hasMany(Message);


module.exports = {
  User,
  Conversation,
  Message,
};
