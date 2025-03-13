import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  className: String,
});

// Prevent redefining the model if it already exists
const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;
