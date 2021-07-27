const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

ImageSchema.virtual('imgdefault').get(function () {
    return this.url.replace('/upload', '/upload/c_scale,h_300,w_350');
});

ImageSchema.virtual('imgcarousel').get(function () {
    return this.url.replace('/upload', '/upload/c_scale,h_225,w_350');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOfCreation: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        },
    ]
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/foodOutlets/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

//deletion middleware for deleting reviews from review model if a campground is deleted.
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc.reviews.length) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
