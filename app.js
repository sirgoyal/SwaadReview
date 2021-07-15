const express= require('express');
const app = express();
const ExpressError = require('./utils/ExpressError');
const catchAsync= require('./utils/catchAsync');
const methodOverride = require('method-override');
const path= require('path');
const ejsMate= require('ejs-mate');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const {campgroundSchema}= require('./schemas'); //destructuring for particular validation schema
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(()=> {console.log("Connection open!")})
.catch(err => {
    console.log("Not connected!!")
    console.log(err)
}
 )

 app.use(express.urlencoded({ extended: true })); //used to parse for posting
 app.use(methodOverride('_method'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.listen(3000, ()=>
{
    console.log("Connected!!");
})

//validation middleware (checks if the campground is valid and if not, throws an error else next func is executed)

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
app.get('/', (req, res) => {
    res.render('home')
});
//page to list all campgrounds
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}); //grabbing data from collection
    res.render('campgrounds/index', { campgrounds })
}));

//new rout
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

//posts the new received campgrounds from the form to our index

app.post('/campgrounds',validateCampground, catchAsync(async (req, res) => { 
  // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

// show by id

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id) // grabbing the CG by id.
    res.render('campgrounds/show', { campground });
}));


app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id) // grabbing the CG by id to edit.
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => { // updating the particular id with new data
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));
app.delete('/campgrounds/:id', catchAsync(async (req, res) => { 
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

//if the req isnt found, we send the error to the middleware with the message and status
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//error handling middleware
// An object is sent with rendered page, also, we need to seperately set the value for message and it cant be done while destructuring coz that is just to extract the info and not update!

app.use((err, req, res, next)=>
{
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})