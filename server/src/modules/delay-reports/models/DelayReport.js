const mongoose = require('mongoose');
const { DELAY_CATEGORIES } = require('../../../constants/logistics.constants');

const delayReportSchema = new mongoose.Schema(
  {
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    delayReason: { type: String, required: true, trim: true, minlength: 3, maxlength: 500 },
    delayCategory: { type: String, required: true, enum: Object.values(DELAY_CATEGORIES) },
    delayTimestamp: { type: Date, required: true, default: Date.now },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    remarks: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: (_document, returnedObject) => returnedObject },
  },
);

delayReportSchema.index({ shipment: 1, delayTimestamp: -1 });
delayReportSchema.index({ delayCategory: 1, delayTimestamp: -1 });
delayReportSchema.index({ reportedBy: 1, delayTimestamp: -1 });

module.exports = mongoose.models.DelayReport || mongoose.model('DelayReport', delayReportSchema);
