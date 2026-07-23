const router = require('express').Router();
const { searchGlobal } = require('../controllers/search.controller');

router.get('/', searchGlobal);

module.exports = router;
