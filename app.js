const express= require('express');
const app = express();
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const path= require('path');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate= require('ejs-mate');
const mongoose = require('mongoose');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
.then(()=> {console.log("Database Connected!")})
.catch(err => {
    console.log("Not connected!!")
    console.log(err)
}
 )

 app.use(express.urlencoded({ extended: true })); //used to parse for posting
 app.use(methodOverride('_method'));
 app.use(express.static(path.join(__dirname, 'public'))) //to access static public assets

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    //cookie expires after 7 days
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

//setting up flash middleware before calling routes
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

 app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.listen(3000, ()=>
{
    console.log("Connected!!");
})

app.get('/', (req, res) => {
    res.render('home')
});


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