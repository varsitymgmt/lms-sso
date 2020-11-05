/**
 *@description
 *    This File contains the Mongoose Schema defined for Logger
 * @Author :
 *    Aslam Shaik
 * @date
 *    21/07/2020.
 * version
 *    1.0.0
 */
import mongoose from 'mongoose';

const loggerSchema = new mongoose.Schema(
  {
    // id: { type: String, required: true },
    email: { type: String },
    password: { type: String },
    hostname: { type: String },
    method: { type: String },
    url: { type: String },
    responseLength: { type: Number },
    responseTime: { type: Number },
    status: { type: Number },
    statusMessage: { type: String },
    remoteAddress: { type: String },
    isAuthenticated: { type: Boolean },
    date: { type: Date },
    referrer: { type: String },
    marker: { type: String, default: 'green' },
    requestParams: {},
    requestBody: {},
  },
  {
    collection: 'logs',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export default mongoose.model('Log', loggerSchema);
