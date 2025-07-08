const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: [true, "Article heading is required"],
    minlength: [3, "Heading must be at least 3 characters long"],
    trim: true
  },
  picture: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return v === null || /^https?:\/\/\S+\.\S+/.test(v);
      },
      message: "Picture must be a valid URL or null"
    }
  },
  source:{
    type: String,
    required: false,
    minlength: [3, "Author must be at least 3 characters long"],
    trim: true
  },
  website_url: {
    type: String,
    required: [true, "Website URL is required"],
    unique: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/\S+\.\S+/.test(v);
      },
      message: "Please provide a valid website URL"
    }
  },
  description: {
    type: String,
    required: true,
    minlength: [10, "Description must be at least 10 characters long if provided"],
    trim: true
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
  },
  publishedAt:{
    type: Date,
    default: Date.now
  }
});

const articleModel = mongoose.model("Article", articleSchema);

module.exports = articleModel;