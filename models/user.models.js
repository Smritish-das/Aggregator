const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
      minlength: [3, "First name must be 3 characters long."],
    },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: [6, "Email must be 6 characters long"],
    match: [/\S+@\S+\.\S+/, "Please provide a valid Email"],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  categories: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0 && v.every(cat => ['Technology', 'Business', 'Entertainment', 'Environment', 'Finance', 'Smart Home', 'Social Media', 'Retail'].includes(cat));
      },
      message: 'At least one valid category (Technology, Business, Entertainment, Environment, Finance, Smart Home, Social Media, Retail) must be selected'
    }
  }
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
