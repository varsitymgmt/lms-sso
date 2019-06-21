/* eslint no-invalid-this:0 */
/* eslint-disable */
import mongoose, { Schema } from 'mongoose';

const AllStudentsSchema = new Schema(
  {
    studentId: { type: String },
  },
  {
    collection: 'allStudents',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export default mongoose.model('AllStudents', AllStudentsSchema);
