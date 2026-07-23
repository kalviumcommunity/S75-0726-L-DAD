const { globalSearch } = require('../services/search.service');

async function searchGlobal(req, res) {
  try {
    const term = String(req.query.q || '').trim();
    const limit = Number(req.query.limit || 8);
    const results = await globalSearch(term, limit);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Search failed' });
  }
}

module.exports = { searchGlobal };
