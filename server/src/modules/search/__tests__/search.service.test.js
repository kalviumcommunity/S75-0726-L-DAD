const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSearchQuery, normalizeSearchTerm } = require('../services/search.service');

test('normalizes search terms for case-insensitive matching', () => {
  assert.equal(normalizeSearchTerm('  LDAD-SHP-1001  '), 'ldad-shp-1001');
  assert.equal(normalizeSearchTerm('Warehouse A'), 'warehouse a');
});

test('builds optimized search query for text and identifier fields', () => {
  const result = buildSearchQuery('LDAD-SHP-1001');

  assert.equal(result.searchTerm, 'ldad-shp-1001');
  assert.deepEqual(result.filters, [
    { field: 'shipmentId', regex: 'ldad-shp-1001' },
    { field: 'origin', regex: 'ldad-shp-1001' },
    { field: 'destination', regex: 'ldad-shp-1001' },
    { field: 'currentLocation', regex: 'ldad-shp-1001' },
    { field: 'fromWarehouse', regex: 'ldad-shp-1001' },
    { field: 'toWarehouse', regex: 'ldad-shp-1001' },
    { field: 'delayReason', regex: 'ldad-shp-1001' },
    { field: 'remarks', regex: 'ldad-shp-1001' },
  ]);
});
