const mongoose = require("mongoose");
const validator = require("validator");

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

    websites: [
      {
        name: {
          type: String,
          required: [true, "Website must have a name"],
        },
        url: {
          type: String,
          validate: {
            validator: function (value) {
              // Validate the URL
              return (
                validator.isURL(value, {
                  require_protocol: true, // Require protocol
                  allow_underscores: true, // Allow underscores if needed
                }) && value.startsWith("https://")
              );
            },
            message: (props) =>
              `Provided URL: ${props.value} is not valid, or it does not begin with https://.
`,
          },
        },
        identificationCodeRecord: {
          type: String,
          required: [true, "Identification code is required"],
        },
        passwordRecord: {
          type: String,
          required: [true, "Password is required"],
        },
      },
    ],

    // tasks: {}, // parent refrencing to tasks

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Organization must belong to a user"],
    },
  },

  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Organization = mongoose.model("Organization", organizationSchema);
module.exports = Organization;
