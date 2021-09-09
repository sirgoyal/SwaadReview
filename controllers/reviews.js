const Campground = require('../models/campground');
const Review = require('../models/review');
const moment= require('moment');
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    review.dateCreated = moment().format('MM/DD/YY, HH:mm:ss');
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/foodOutlets/${campground._id}`);
}

module.exports.renderEditForm = async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findById(id);
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Cannot find that review!');
        return res.redirect('/foodOutlets');
    }
    res.render('reviews/edit', {campground, review});
}

module.exports.updateReview = async (req, res) => {

    const { id, reviewId } = req.params;
    const review = await Review.findByIdAndUpdate(reviewId, req.body.review);
    req.flash('success', 'Successfully updated review!');
    res.redirect(`/foodOutlets/${id}`);
}
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/foodOutlets/${id}`);
}
