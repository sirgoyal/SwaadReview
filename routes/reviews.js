const express = require('express');
//mergeparams used to get params from the other route like CG id.
const router = express.Router({ mergeParams: true });
const {validateReview, isLoggedIn, isReviewAuthor}= require('../middleware')
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router.post('/',  isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;