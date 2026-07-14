/** Shared domain values. Keep persisted enum strings stable once data exists. */
const USER_ROLES = Object.freeze({
  MANAGER: 'Manager',
  ANALYST: 'Analyst',
  COORDINATOR: 'Coordinator',
});

const SHIPMENT_STATUSES = Object.freeze({
  DISPATCHED: 'Dispatched',
  IN_TRANSIT: 'In Transit',
  AT_WAREHOUSE: 'At Warehouse',
  DELAYED: 'Delayed',
  DELIVERED: 'Delivered',
});

const DELAY_CATEGORIES = Object.freeze({
  WEATHER: 'Weather',
  VEHICLE_ISSUE: 'Vehicle Issue',
  WAREHOUSE_DELAY: 'Warehouse Delay',
  CUSTOMS: 'Customs',
  TRAFFIC: 'Traffic',
  OTHER: 'Other',
});

module.exports = { USER_ROLES, SHIPMENT_STATUSES, DELAY_CATEGORIES };
