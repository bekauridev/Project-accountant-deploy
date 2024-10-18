const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String },
  websites: {}, // embeding to websites schema
  tasks: {}, // parent refrencing to tasks
});

const Organization = mongoose.model("Organization", organizationSchema);
module.exports = Organization;
