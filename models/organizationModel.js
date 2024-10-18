const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
    },
    message: { type: String },
    // websites: {}, // embeding to websites schema
    // tasks: {}, // parent refrencing to tasks

    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Organization must belogn to a user"],
    },
  },

  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Organization = mongoose.model("Organization", organizationSchema);
module.exports = Organization;
