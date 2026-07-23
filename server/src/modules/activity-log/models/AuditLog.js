const mongoose = require('mongoose');
const { ACTIVITY_TYPES } = require('../../../constants/logistics.constants');

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, enum: Object.values(ACTIVITY_TYPES), required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: { type: String, trim: true, maxlength: 80, default: null },
    entityId: { type: String, trim: true, maxlength: 120, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
