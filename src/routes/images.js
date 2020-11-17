const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const Version = require('../models/Version');

const { isAuthenticated } = require('../helpers/auth');
var scrapiKia = require('./../generatedModelsKia');
const requestPromise = require('request-promise');
var request = require('request');
var HashMap = require("hashmap");

//const {featureCategory,vehicleCatalog} = require('./../enum/catalog')

const featureCategory = [{
        name: "Exterior",
        abbreviation: "GFCFCEX",
        code: "EX",
    },
    {
        name: "Interior",
        abbreviation: "GFCFCIN",
        code: "IN",
    },
    {
        name: "Technology",
        abbreviation: "GFCFCTE",
        code: "TE",
    },
    {
        name: "Performance",
        abbreviation: "GFCFCPE",
        code: "PE",
    },
    {
        name: "Safety",
        abbreviation: "GFCFCSA",
        code: "SA",
    },
    {
        name: "MediaLink",
        abbreviation: "GFCFCML",
        code: "ML",
    },
];

const vehicleCatalog = [{
        name: "KIA Rio Sedán",
        codeHtml: "rio-sedan",
    },
    {
        name: "KIA Rio Hatchback",
        codeHtml: "rio-hatchback",
    },
    {
        name: "KIA Forte Sedán",
        codeHtml: "forte-sedan",
    },
    {
        name: "KIA Forte Hatchback",
        codeHtml: "forte-hatchback",
    },
    {
        name: "KIA Sportage",
        codeHtml: "sportage",
    },
    {
        name: "KIA Soul",
        codeHtml: "soul",
    },
];

const yearCatalog = [{
        name: "2021",
        codeHtml: "2021",
    },
    {
        name: "2020",
        codeHtml: "2020",
    },
];

let mapVersions = new HashMap();
mapVersions.set("L T/M", 1);
mapVersions.set("L CVT", 2);
mapVersions.set("L T/A", 3);
mapVersions.set("LX T/M", 4);
mapVersions.set("LX T/A", 5);
mapVersions.set("LX CVT", 6);
mapVersions.set("EX T/M", 7);
mapVersions.set("EX T/A", 8);
mapVersions.set("EX CVT", 9);
mapVersions.set("EX DCT", 10);
mapVersions.set("EX PACK T/A", 11);
mapVersions.set("EX PACK CVT", 12);
mapVersions.set("S PACK T/M", 13);
mapVersions.set("S PACK T/A", 14);
mapVersions.set("GT T/M", 15);
mapVersions.set("GT DCT", 16);
mapVersions.set("GT-line T/M", 17);
mapVersions.set("GT-line CVT", 18);
mapVersions.set("SX T/M", 19);
mapVersions.set("SX T/A", 20);
mapVersions.set("SX CVT", 21);
mapVersions.set("SX DCT", 22);
mapVersions.set("SXL T/M", 23);
mapVersions.set("SXL T/A", 24);
mapVersions.set("SXL DCT", 25);



router.get('/images/add', isAuthenticated, async(req, res) => {
    //console.log(vehicleCatalog);
    //console.log(featureCategory);
    res.render('images/new-image', { featureCategory, yearCatalog, vehicleCatalog });
});

router.get('/images/load_from_kia', isAuthenticated, async(req, res) => {
    let resp = await scrapiKia();
    setTimeout(function() {
        saveImages(resp);
    }, 5000);
    req.flash('success_msg', 'Load Images successfully !')
    res.render('images/load-image');
});




const saveImages = async function(resp) {
    let allVersion = await Version.find();
    allVersion.forEach(element => {
            element.tmName = element.tmName.replace(" 6 VELOCIDADES FWD", "").replace(" 7 VELOCIDADES FWD", "").replace(" 7 VELOCIDADES FWD", "");
        })
        //var versions =allVersion.map((version) => version.tmCd);
        // console.log(versions);

    resp.forEach(async(element) => {
        const { name, description, url, category, year, model, isCover } = element;
        var versions = allVersion.filter((version) => version.modlNameHtml === model)
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

                return {
                    code: version.tmCd,
                    desc: version.trimNm + ' ' + version.tmName,
                    actv: actv
                }
            });
        const image = new Image({ name, description, url, category, year, model, isCover, versions });
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
        const image = new Image({ name, description, url, category, year, model });
        image.user = req.user.id;
        await image.save();
        req.flash('success_msg', 'Image Add successfully !')
        res.redirect('/images/' + model);
    }
});

//only for redirect 
router.get('/images/edit/:id', isAuthenticated, async(req, res) => {
    const image = await Image.findById(req.params.id);
    image.versions.sort(compare);
    res.render('images/edit-image', { image, featureCategory, yearCatalog, vehicleCatalog });
});



router.get('/images/covers', isAuthenticated, async(req, res) => {
    const images = await Image.find({ isCover: true }).sort({model:1});
    res.render('images/cover-images', { images, vehicleCatalog });
});

router.get('/images', isAuthenticated, async(req, res) => {
    const images = await Image.find({ isCover: false });
    let model = "allmodels";
    res.render('images/all-images', { images, featureCategory, model });
});


router.get('/images/:model', isAuthenticated, async(req, res) => {
    let model = req.params.model;
    let modelName = ""
    const images = await Image.find({ model, isCover: false });
    if (model != 'allmodels') {
        modelName = (vehicleCatalog.filter((v) => v.codeHtml === model))[0].name;
    } else {
        modelName = 'All KIA models'
    }
    console.log(model, modelName)
        //order models
    images.forEach(function(img) {
        img.versions = img.versions.sort(compare);
    });
    res.render('images/all-images', { images, featureCategory, model, modelName });
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


router.put('/images/edit-image/:id', isAuthenticated, async(req, res) => {
    const { name, description, url, category, year, model, versionsFront } = req.body;
    console.log(versionsFront);

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
    res.redirect('/images/' + model);
});


router.delete('/images/delete/:id/:model', isAuthenticated, async(req, res) => {
    await Image.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Image Deleted successfully!');
    res.redirect('/images/' + (req.params.model != null ? req.params.model : ''));
});

router.get('/images/delete_all', isAuthenticated, async(req, res) => {
    await Image.deleteMany();
    req.flash('success_msg', 'Images Deleted successfully!');
    res.redirect('/images');
});



router.put('/images/edit-versions_image/:id', isAuthenticated, async(req, res) => {
    console.log(req.body) //particular
    let { code, actv } = req.body;
    if (!code) {
        code = "E7";
        actv = true;
    }

    let image = await Image.findByIdAndUpdate(req.params.id);
    let versions = image.versions;

    image.versions.forEach(function(v) {
        if (v.code === code) {
            v.actv = actv;
        }
    });

    await Image.findByIdAndUpdate(req.params.id, { versions });
    req.flash('success_msg', 'Image Updated successfully!');
    res.send('OK');
});


router.get('/images/json/:model/:category/:iscode', isAuthenticated, async(req, res) => {
    let model = req.params.model;
    let category = req.params.category;
    let iscode = req.params.iscode;
    let content = null;

    //all covers
    if (category === 'allcategory' && model === 'allcovers') {
        content = await Image.find({ isCover: true });
    } else {
        //all models and all categorys
        if (category === 'allcategory' && model === 'allmodels') {
            content = await Image.find();
        } else {
            if (category === 'allcategory') {
                content = await Image.find({ model });
            } else if (model === 'allmodels') {
                content = await Image.find({ category });
            } else {
                content = await Image.find({ model, category });
            }
        }
    }


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


module.exports = router;