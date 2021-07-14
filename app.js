const express= require('express');
const app = express();
const methodOverride = require('method-override');
const path= require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(()=> {console.log("Connection open!")})
.catch(err => {
    console.log("Nahi chal raha")
    console.log(err)
}
 )

 app.use(express.urlencoded({ extended: true })); //used to parse for posting
 app.use(methodOverride('_method'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.listen(3000, ()=>
{
    console.log("Chal raha hai!!");
})

app.get('/', (req, res) => {
    res.render('home')
});
//page to list all campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({}); //grabbing data from collection
    res.render('campgrounds/index', { campgrounds })
});

//new rout
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => { //posts the new received campgrounds from the form to our index
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

// show by id

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id) // grabbing the CG by id.
    res.render('campgrounds/show', { campground });
});


app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id) // grabbing the CG by id to edit.
    res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => { // updating the particular id with new data
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
});
app.delete('/campgrounds/:id', async (req, res) => { 
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}
    )