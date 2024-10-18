const taskSchema = new Schema({
  recurrence: [{ type: String, required: true }], // e.g., ["monthly"]
  name: { type: String, required: true },
  status: { type: String, required: true },
});
