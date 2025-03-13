import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
    studentId: String,
    amount: Number,
    status: String,
});

// Prevent overwriting the model
const Fee = mongoose.models.Fee || mongoose.model('Fee', feeSchema);

export default Fee;



