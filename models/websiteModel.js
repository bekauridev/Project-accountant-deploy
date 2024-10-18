const websiteSchema = new Schema({
  name: { type: String, required: true },
  identificationCode: { type: String, required: true },
  password: { type: String, required: true },
});
