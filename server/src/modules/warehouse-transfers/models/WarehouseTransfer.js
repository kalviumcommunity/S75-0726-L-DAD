const mongoose = require('mongoose');

const warehouseTransferSchema = new mongoose.Schema(
  {
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    fromWarehouse: { type: String, required: true, trim: true, maxlength: 150 },
    toWarehouse: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      validate: {
        validator(value) {
          return !this.fromWarehouse || value.toLowerCase() !== this.fromWarehouse.toLowerCase();
        },
        message: 'Destination warehouse must differ from source warehouse',
      },
    },
    transferTimestamp: { type: Date, required: true, default: Date.now },
    remarks: { type: String, trim: true, maxlength: 1000, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: (_document, returnedObject) => returnedObject },
  },
);

warehouseTransferSchema.index({ shipment: 1, transferTimestamp: -1 });
warehouseTransferSchema.index({ fromWarehouse: 1, toWarehouse: 1, transferTimestamp: -1 });

module.exports = mongoose.models.WarehouseTransfer || mongoose.model('WarehouseTransfer', warehouseTransferSchema);
