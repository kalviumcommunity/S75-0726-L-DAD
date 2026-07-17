const mongoose = require('mongoose');
const { SHIPMENT_STATUSES } = require('../../../constants/logistics.constants');

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 50,
    },
    origin: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    destination: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    currentStatus: {
      type: String,
      enum: Object.values(SHIPMENT_STATUSES),
      default: SHIPMENT_STATUSES.DISPATCHED,
      required: true,
    },
    dispatchDate: { type: Date, required: true },
    expectedDeliveryDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.dispatchDate || value >= this.dispatchDate;
        },
        message: 'Expected delivery date must be on or after dispatch date',
      },
    },
    actualDeliveryDate: {
      type: Date,
      default: null,
      validate: {
        validator(value) {
          return value == null || !this.dispatchDate || value >= this.dispatchDate;
        },
        message: 'Actual delivery date must be on or after dispatch date',
      },
    },
    currentLocation: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: (_document, returnedObject) => returnedObject },
  },
);

shipmentSchema.index({ shipmentId: 1 }, { unique: true });
shipmentSchema.index({ currentStatus: 1, expectedDeliveryDate: 1 });
shipmentSchema.index({ origin: 1, destination: 1 });

shipmentSchema.pre('validate', function validateDeliveryState(next) {
  if (this.currentStatus === SHIPMENT_STATUSES.DELIVERED && !this.actualDeliveryDate) {
    this.invalidate('actualDeliveryDate', 'Actual delivery date is required for delivered shipments');
  }
  next();
});

module.exports = mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema);
