const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(()=> {console.log("Connection open!")})
.catch(err => {
    console.log("Nahi chal raha")
    console.log(err)
}
 )
 const sample = array => array[Math.floor(Math.random() * array.length)]; //fxn to get random element from seedhelpers file.

//fxn to create a db with random elements from both cities and seedHelpers file
const seedDB = async () => {
    await Campground.deleteMany({}); // deletes prev stored camps
    for (let i = 0; i < 50; i++) { // loop to access random cities from cities file
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({ //creating a new camp
           author: '60f7c000ac6cb63cc4e1d15e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
        })
        await camp.save(); // saving the camp to db
    }
}
// executing the db function
seedDB().then(() => {
    mongoose.connection.close(); //closing the db
})
