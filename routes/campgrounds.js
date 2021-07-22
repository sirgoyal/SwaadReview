const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware')
const Campground = require('../models/campground');
const ObjectID = require('mongodb').ObjectID;
const ExpressError = require('../../YelpCamp-40d8f37a93d140b53a59ee847e3bed3aeb94ecc4/utils/ExpressError');


//page to list all campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

//new rout
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

//posts the new received campgrounds from the form to our index
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    
    const campground = new Campground(req.body.campground);
    campground.author= req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        if(!req.session.previousReturnTo)
        {
            req.flash('error', 'Invalid Campground ID');
            return res.redirect('/campgrounds');
        }
        req.session.returnTo = req.session.previousReturnTo;
        console.log('Invalid campground show id, returnTo reset to:', req.session.returnTo);
    }
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));

module.exports = router;