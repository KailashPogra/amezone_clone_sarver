const mongoose = require("mongoose");
const uSerSchema = mongoose.Schema({
  name: {
    required: true,
    type: String,
    trim: true,
  },

  email: {
    unique: true,
    required: true,
    type: String,
    trim: true,
    validate: {
      validator: (value) => {
        const re =
          /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return value.match(re);
      },
      message: "Please enter a valid email address",
    },
  },
  password: {
    required: true,
    type: String,
    validate: {
      validator: (value) => {
        return value.length > 6;
      },
      message: "Please enter a longer password",
    },
  },
  address: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "user",
  },
  profileImage: {
    required: true,
    type: String,
    default: "",
  },
});
const User = mongoose.model("User", uSerSchema);

module.exports = User;
