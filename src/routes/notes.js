const express = require('express');
const router = express.Router();

const Note = require('../models/Note');
const {isAuthenticated} = require('../helpers/auth');

router.get('/notes/add',isAuthenticated, (req,res) =>{
    res.render('notes/new-note');
});

router.post('/notes/new-note', isAuthenticated, async (req, res) =>{
    console.log(req.body);
    const {title, description} = req.body;
    const errors = [];
    console.log(title);
    console.log(description);
    if(!title){
        errors.push({text : 'Title is required'});
    }
    if(!description){
        errors.push({text : 'Description is required'});
    }
    if(errors.length > 0 ){
        res.render('notes/new-note',{
            errors,
            title,
            description
        })
    }else{
        const note = new Note({title,description});
        note.user = req.user.id;
        await note.save();
        req.flash('success_msg', 'Note Add successfully !')
        res.redirect('/notes');
    }
});


router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id);
    res.render('notes/edit-note', {note});
});


router.get('/notes', isAuthenticated,  async (req,res) =>{
    const notes = await Note.find({user: req.user.id}).sort({date: 'desc'});
    console.info('Notas recuperadas: ' + notes);
    res.render('notes/all-notes', {notes});
});

router.put('/notes/edit-note/:id', isAuthenticated, async (req, res) => {
    const {title, description} = req.body;
    await Note.findByIdAndUpdate(req.params.id,{title,description});
    req.flash('success_msg','Note Updated successfully!');
    res.redirect('/notes');
});


router.delete('/notes/delete/:id', isAuthenticated, async(req,res) =>{
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg','Note Deleted successfully!');
    res.redirect('/notes');
});



module.exports = router;
