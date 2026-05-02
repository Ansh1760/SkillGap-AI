import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Frontend', 'Backend', 'SQL', 'MongoDB'],
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length === 4, 'Options must exactly have 4 items'],
  },
  correctAnswer: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
