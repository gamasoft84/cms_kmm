const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const {isAuthenticated} = require('../helpers/auth');
var scrapiKia = require('./../generatedModelsKia');
const requestPromise = require('request-promise');
//const {featureCategory,vehicleCatalog} = require('./../enum/catalog')

const featureCategory = [
    {
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

  const vehicleCatalog = [
    {
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
  ];

  const yearCatalog = [
    {
      name: "2021",
      codeHtml: "2021",
    },
    {
      name: "2020",
      codeHtml: "2020",
    },
  ];

router.get('/images/add',isAuthenticated, (req,res) =>{
    //console.log(vehicleCatalog);
    //console.log(featureCategory);

    res.render('images/new-image',{featureCategory,yearCatalog,vehicleCatalog});
});

router.get('/images/load_from_kia',isAuthenticated, async (req,res) =>{
    let resp = await scrapiKia();    
    setTimeout(function() {
        saveImages(resp);
    }, 3000);
    req.flash('success_msg', 'Load Images successfully !')
    res.render('images/load-image');
});

const saveImages = async function(resp){
    resp.forEach( async (element) => {
        const {name,description,url,category,year,model,isCover} = element;
        const image = new Image({name,description,url,category,year,model,isCover});        
        await image.save();
    });
}


router.post('/images/new-image', isAuthenticated, async (req, res) =>{
    console.log(req.body);
    const {name, description,url,category,year,model} = req.body;
    const errors = [];

    if(!name){
        errors.push({text : 'Name is required'});
    }
    if(!url){
        errors.push({text : 'Url is required'});
    }
    if(!category){
        errors.push({text : 'Category is required'});
    }
   
    if(errors.length > 0 ){
        res.render('images/new-image',{
            errors,
            name,
            description,
            url,
            category
        })
    }else{
        const image = new Image({name,description,url,category,year,model});
        image.user = req.user.id;
        await image.save();
        req.flash('success_msg', 'Image Add successfully !')
        res.redirect('/images/' + model);
    }
});

//only for redirect 
router.get('/images/edit/:id', isAuthenticated, async (req, res) => {
    const image = await Image.findById(req.params.id);
    res.render('images/edit-image', {image,featureCategory,yearCatalog,vehicleCatalog});
});



router.get('/images/covers', isAuthenticated,  async (req,res) =>{
    const images = await Image.find({isCover:true});
    res.render('images/cover-images', {images,vehicleCatalog});
});

router.get('/images', isAuthenticated,  async (req,res) =>{
    const images = await Image.find({isCover:false});
    res.render('images/all-images', {images,featureCategory});
});


router.get('/images/:model', isAuthenticated,  async (req,res) =>{
    let model = req.params.model;
    const images = await Image.find({model,isCover:false});
    res.render('images/all-images', {images,featureCategory});
});

router.put('/images/edit-image/:id', isAuthenticated, async (req, res) => {
    const {name, description,url,category,year,model}= req.body;
    console.log({name, description,url,category,year,model});
    await Image.findByIdAndUpdate(req.params.id,{name, description,url,category,year,model});
    req.flash('success_msg','Image Updated successfully!');
    res.redirect('/images/'+ model);
});


router.delete('/images/delete/:id/:model', isAuthenticated, async(req,res) =>{
    await Image.findByIdAndDelete(req.params.id);
    req.flash('success_msg','Image Deleted successfully!');
    res.redirect('/images/' + (req.params.model != null ? req.params.model: ''));
});

router.get('/images/delete_all', isAuthenticated, async(req,res) =>{
    await Image.deleteMany();
    req.flash('success_msg','Images Deleted successfully!');
    res.redirect('/images');
});


module.exports = router;
