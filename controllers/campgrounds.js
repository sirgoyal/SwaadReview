const Campground = require('../models/campground');
const ObjectID = require('mongodb').ObjectID;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
const moment= require('moment');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('foodOutlets/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('foodOutlets/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images= req.files.map(f=> ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    campground.dateOfCreation= moment().format('MM/DD/YY, HH:mm:ss');
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new Food Outlet!');
    res.redirect(`/foodOutlets/${campground._id}`)
}


module.exports.showCampground = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        if(!req.session.previousReturnTo)
        {
            req.flash('error', 'Invalid ID');
            return res.redirect('/foodOutlets');
        }
        req.session.returnTo = req.session.previousReturnTo;
        console.log('Invalid Food Outlet show id, returnTo reset to:', req.session.returnTo);
    }
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Cannot find that Food Outlet!');
        return res.redirect('/foodOutlets');
    }
    res.render('foodOutlets/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that Food Outlet!');
        return res.redirect('/foodOutlets');
    }
    res.render('foodOutlets/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
const imgs=req.files.map(f=> ({url: f.path, filename: f.filename}));
campground.images.push(...imgs);
await campground.save();
//delete deleted images from cloudinary and mongo

if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
}
    req.flash('success', 'Successfully updated Food Outlet!');
    res.redirect(`/foodOutlets/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Food Outlet')
    res.redirect('/foodOutlets');
}
