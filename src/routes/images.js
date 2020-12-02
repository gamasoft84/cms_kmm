const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const Version = require('../models/Version');
const { isAuthenticated } = require('../helpers/auth');
var { getVehicleCatalog, yearCatalog, featureCategory, mapVersions } = require('../enum/catalog');
var scrapiKia = require('./../generatedModelsKia');
var request = require('request');


router.get('/images/add', isAuthenticated, async(req, res) => {
    vehicleCatalog = await getVehicleCatalog();
    res.render('images/new-image', { featureCategory, yearCatalog, vehicleCatalog });
});

const saveImages = async function(respScrapi) {
    let allVersion = await Version.find();
    respScrapi.forEach(async(elementScrapi) => {
        const { name, description, url, category, year, model, isCover } = elementScrapi;
        let modelCd = null;
        var versions = allVersion
            .filter((version) => version.modlNameHtml === model)
            .filter((version) => version.year === year)
            .map(function(version) {
                let actv = true;
                //T/M, T/A, CVT, DCT   tmName
                //LX EX GT GT-LINE     trimNm
                if (name.includes('TRANSMISIÓN MANUAL') && !version.tmName.includes('T/M')) {
                    actv = false;
                }
                if ((name.includes('TRANSMISIÓN AUTOMÁTICA') || name.includes('IVT')) &&
                    version.tmName.includes('T/M')) {
                    actv = false;
                }

                if (name.includes('MOTOR 1.6 L ')) {
                    if (version.modlNameHtml.includes('soul') && !version.trimNm.includes('LX')) {
                        actv = false;
                    }
                    if (version.modlNameHtml.includes('forte-sedan') && !version.tmName.includes('DCT')) {
                        actv = false;
                    }
                    if (version.modlNameHtml.includes('forte-hatchback') && !version.tmName.includes('DCT')) {
                        //console.log(version.modlNameHtml, version.tmName);
                        actv = false;
                    }

                }

                if (name.includes('ATKINSON') && version.tmName.includes('DCT')) {
                    actv = false;
                }

                if (name.includes('MOTOR 2.0')) {
                    if (version.modlNameHtml.includes('sportage') && (version.trimNm.includes('EX PACK') || version.trimNm.includes('SXL'))) {
                        actv = false;
                    }
                    if (version.modlNameHtml.includes('soul') && !version.trimNm.includes('EX')) {
                        actv = false;
                    }
                }

                if (name.includes('THETA 2.4') && version.modlNameHtml.includes('sportage') && !(version.trimNm.includes('EX PACK') || version.trimNm.includes('SXL'))) {
                    actv = false;
                }
                modelCd = version.modlCd;
                return {
                    code: version.tmCd,
                    desc: version.version,
                    actv: actv
                }
            });
        versions.sort(compare);
        const image = new Image({ name, description, url, category, year, model, modelCd, isCover, versions });
        await image.save();
    });
}


router.post('/images/new-image', isAuthenticated, async(req, res) => {
    console.log(req.body);
    const { name, description, url, category, year, model } = req.body;
    const errors = [];

    if (!name) {
        errors.push({ text: 'Name is required' });
    }
    if (!url) {
        errors.push({ text: 'Url is required' });
    }
    if (!category) {
        errors.push({ text: 'Category is required' });
    }

    if (errors.length > 0) {
        res.render('images/new-image', {
            errors,
            name,
            description,
            url,
            category
        })
    } else {

        let versions = await Version.find({ modlNameHtml: model, year });
        let modelCd = null;
        versions = versions.map(function(version) {
            modelCd = version.modlCd;
            return {
                code: version.tmCd,
                desc: version.version,
                actv: true
            }
        });
        versions.sort(compare);

        const image = new Image({ name, description, url, category, year, model, modelCd, versions });
        image.user = req.user.id;
        await image.save();
        req.flash('success_msg', 'Image Add successfully !')
        res.redirect('/images/' + model + '/' + year);
    }
});

//only for redirect 
router.get('/images/edit/:id', isAuthenticated, async(req, res) => {
    const image = await Image.findById(req.params.id);
    vehicleCatalog = await getVehicleCatalog();
    res.render('images/edit-image', { image, featureCategory, yearCatalog, vehicleCatalog });
});



router.get('/images/covers', isAuthenticated, async(req, res) => {
    const images = await Image.find({ isCover: true }).sort({ model: 1 });
    vehicleCatalog = await getVehicleCatalog();
    res.render('images/cover-images', { images, yearCatalog, vehicleCatalog });
});

router.get('/images', isAuthenticated, async(req, res) => {
    const images = await Image.find({ isCover: false });
    let model = "allmodels";
    res.render('images/all-images', { images, featureCategory, model });
});


router.get('/images/:model/:year', isAuthenticated, async(req, res) => {
    let model = req.params.model;
    let year = req.params.year;
    let modelName = ""
    const images = await Image.find({ model, year, isCover: false });
    if (model != 'allmodels') {
        vehicleCatalog = await getVehicleCatalog();
        modelName = (vehicleCatalog.filter((v) => v.codeHtml === model))[0].name;
    } else {
        modelName = 'All KIA models'
    }
    res.render('images/all-images', { images, featureCategory, model, modelName, year });
});

router.put('/images/edit-image/:id', isAuthenticated, async(req, res) => {
    const { name, description, url, category, year, model, versionsFront } = req.body;
    let image = await Image.findByIdAndUpdate(req.params.id);
    let versions = image.versions;
    image.versions.forEach(function(v) {

        if (versionsFront.includes(v.code)) {
            v.actv = true;
        } else {
            v.actv = false;
        }
    });
    await Image.findByIdAndUpdate(req.params.id, { name, description, url, category, year, model, versions });
    req.flash('success_msg', 'Image Updated successfully!');
    res.redirect('/images/' + model + '/' + year);
});


router.delete('/images/delete/:id/:model/:year', isAuthenticated, async(req, res) => {
    await Image.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Image Deleted successfully!');
    res.redirect('/images/' + (req.params.model != null ? req.params.model : '') + '/' + req.params.year);
});

router.put('/images/edit-versions_image/:id', isAuthenticated, async(req, res) => {
    let { code, value } = req.body;
    //console.log(req.params.id);
    let image = await Image.findByIdAndUpdate(req.params.id);
    let versions = image.versions;
    versions.forEach(function(v) {
        if (v.code === code) {
            v.actv = value;
        }
    })
    await Image.findByIdAndUpdate(req.params.id, { versions });
    res.send('OK');
})


router.get('/images/json/:model/:category/:year/:iscode', isAuthenticated, async(req, res) => {
    let model = req.params.model;
    let category = req.params.category;
    let iscode = req.params.iscode;
    let year = req.params.year;
    let content = null;

    //all covers
    if (category === 'allcategory' && model === 'allcovers') {
        content = await Image.find({ isCover: true, year });
    } else {
        //all models and all categorys
        if (category === 'allcategory' && model === 'allmodels') {
            content = await Image.find({ year });
        } else {
            if (category === 'allcategory') {
                content = await Image.find({ model, year });
            } else if (model === 'allmodels') {
                content = await Image.find({ category, year });
            } else {
                content = await Image.find({ model, category, year });
            }
        }
    }

    content.forEach(function(img) {
        img.versions = img.versions.filter((v) => v.actv === true);
    })

    let messageId = "MS_Configurator001";
    let transactionId = "TS_Configurator001"

    let data = {
        messageId,
        transactionId,
        content
    }

    if (iscode === 'true') {
        //req.flash('success_msg', 'Images code generated successfully!');
        res.send(data);
    } else {
        await request.post({
                url: 'http://localhost:8080/DP/submitImageToAzure',
                json: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            function(error, response, body) {
                // console.log(error);
                // console.log(response);
                console.log('------');
                console.log(body.resultCode);
                console.log('body:', body);
                if (body.errorManagement) {
                    console.log(body.errorManagement.errorDescription);
                }
                console.log(body);
                console.log('------');
            });
        req.flash('success_msg', 'Images Sent successfully!');
        res.redirect('/images/' + (model != null && model != 'allmodels' ? model : ''));

    }
});

router.get('/images_load', isAuthenticated, async(req, res) => {
    vehicleCatalog = await getVehicleCatalog();
    res.render('images/load-image', { vehicleCatalog, yearCatalog });
});

router.post('/images/load-images', isAuthenticated, async(req, res) => {
    resp = req.body;
    let vehicleCatalog = [];
    for (const [key, value] of Object.entries(resp)) {
        let year = key.substring(key.indexOf("_") + 1, key.length);
        let model = key.substring(0, key.indexOf("_"));
        console.log(year, model);
        if (model != 'select') {
            vehicleCatalog.push({ codeHtml: model, year });
        }
    }
    console.log(vehicleCatalog);
    let scrapi = await scrapiKia(vehicleCatalog);
    console.log('Total Images: ' + scrapi.length);
    saveImages(scrapi);
    req.flash('success_msg', 'Load Images successfully !')
    res.redirect('/images/covers');
});

router.get('/images_delete', isAuthenticated, async(req, res) => {
    vehicleCatalog = await getVehicleCatalog();
    res.render('images/delete-images', { vehicleCatalog, yearCatalog });
});

router.post('/images/delete-images', isAuthenticated, async(req, res) => {
    resp = req.body;
    for (const [key, value] of Object.entries(resp)) {
        let year = key.substring(key.indexOf("_") + 1, key.length);
        let model = key.substring(0, key.indexOf("_"));
        console.log(year, model);
        await Image.deleteMany({ model, year });
    }
    req.flash('success_msg', 'Images Deleted successfully!');
    res.redirect('/images/covers');
});


function compare(a, b) {
    let ad = mapVersions.get(a.desc);
    let bd = mapVersions.get(b.desc);
    if (ad < bd) {
        return -1;
    }
    if (ad > bd) {
        return 1;
    }
    return 0;
}

module.exports = router;