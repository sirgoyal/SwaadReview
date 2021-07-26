//if(process.env.NODE_ENV!== 'production')
//{
  //  require('dotenv').config();
//}
require('dotenv').config();

const express= require('express');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const path= require('path');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate= require('ejs-mate');
const mongoose = require('mongoose');
const passport= require('passport');
const LocalStrategy= require('passport-local');
const User= require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL ||'mongodb://localhost:27017/yelp-camp';

const foodOutletRoutes = require('./routes/foodOutlets');
const reviewRoutes = require('./routes/reviews');
const userRoutes= require('./routes/users');

const MongoDBStore = require("connect-mongo")(session);
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
.then(()=> {console.log("Database Connected!")})
.catch(err => {
    console.log("Not connected!!")
    console.log(err)
}
 );

 const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); //used to parse for posting
 app.use(methodOverride('_method'));
 app.use(express.static(path.join(__dirname, 'public'))) //to access static public assets
app.use(mongoSanitize({
    replaceWith: '_'
}))

app.locals.moment = require('moment');

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = new MongoDBStore({
    url: dbUrl,
      secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
});

const sessionConfig = {
  store,
  name: 'session',
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
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = ["https://use.fontawesome.com/"];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/sirgoyal/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
                "https://thumbs.dreamstime.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//setting up flash middleware before calling routes

app.use((req, res, next) => {
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
        req.session.previousReturnTo = req.session.returnTo; // store the previous url
        req.session.returnTo = req.originalUrl; // assign a new url
        console.log('req.session.previousReturnTo', req.session.previousReturnTo)
        console.log('req.session.returnTo', req.session.returnTo);
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/foodOutlets', foodOutletRoutes)
app.use('/foodOutlets/:id/reviews', reviewRoutes)



app.get('/', (req, res) => {
    res.render('home')
});


//if the req isnt found, we send the error to the middleware with the message and status
app.all('*', (req, res, next) => {
    req.session.returnTo = req.session.previousReturnTo;
    console.log('Previous returnTo reset to:', req.session.returnTo )
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
