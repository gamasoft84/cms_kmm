const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const { isAuthenticated } = require('../helpers/auth');
var { getVehicleCatalogByYear } = require('../enum/catalog');

router.get('/vehicles/:year', isAuthenticated, async(req, res) => {
    let year = req.params.year;
    let modelName = ""
    const vehicleCatalog = await getVehicleCatalogByYear(year); 
    res.json(vehicleCatalog);
});


module.exports = router;