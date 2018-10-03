/**
 * @author Gaurav Chauhan
 * @description User's role management Schema.
 */

import mongoose, { Schema } from 'mongoose';

/**
 * Schema for system roles
 */

const SystemRoleSchema = new Schema({
  name: { type: String },
});

const UserRoleSchema = new Schema(
  {
    roleId: { type: String, required: true },
    roleName: { type: String, required: true },
    instituteId: {
      type: String,
      description: 'Institute Id of the given Institute',
      required: true,
    },
    readAccess: [SystemRoleSchema],
    writeAccess: [SystemRoleSchema],
    active: { type: Boolean, default: true },
    visible: { type: Boolean, default: true },
    defaultRole: { type: Boolean, default: false },
  },
  {
    collection: 'userRoles',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

UserRoleSchema.path('instituteId').validate(
  instituteId => instituteId.length,
  'instituteId cannot be blank',
);

UserRoleSchema.path('roleName').validate(
  roleName => roleName.length,
  'Role name cannot be blank',
);

export default mongoose.model('UserRoles', UserRoleSchema);
