import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import ejs from 'ejs';
import Listing from './models/listing.js';
import methodOverride from 'method-override';
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
let port = 3000;
let MONGO_URI = 'mongodb://localhost:27017/nova_horizons';
// Connect to MongoDB
main().then(() => { 
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB:', err);
});

async function main() {
   await mongoose.connect(MONGO_URI);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.send('Welcome to Nova Horizons!');
});

//Index route to display all listings
app.get('/listings', async (req, res) => {
        const allListings = await Listing.find({});
        res.render ("listing/index.ejs", {allListings});
});

//New route to show form for creating a new listing
app.get('/listings/new', (req, res) => {
    res.render('listing/new.ejs');
}); 
//create route to handle form submission and create a new listing
app.post('/listings', async (req, res) => {
    const { title, destination, type, description, price, durationInDays, capacity, amenities, imageUrl, availableFrom, availableTo } = req.body;
    const newListing = new Listing({
        title,
        destination,
        type,
        description,
        price,
        durationInDays,
        capacity,
        amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
        imageUrl,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null
    });
    await newListing.save();
    res.redirect('/listings');
});

//Edit route to show form for editing an existing listing
app.get('/listings/:id/edit', async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send('Listing not found');
    }
    res.render('listing/edit.ejs', { listing });
});

//Update route to handle form submission and update an existing listing
app.put('/listings/:id', async (req, res) => {
    const { id } = req.params;
    const { title, destination, type, description, price, durationInDays, capacity, amenities, imageUrl, availableFrom, availableTo } = req.body;
    const updatedListing = await Listing.findByIdAndUpdate(id, {
        title,
        destination,
        type,
        description,
        price,
        durationInDays,
        capacity,
        amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
        imageUrl,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null
    }, { returnDocument: 'after' });//older version of mongoose used { new: true } ---> for changed value
    if (!updatedListing) {
        return res.status(404).send('Listing not found');
    }
    res.redirect(`/listings/${id}`);
});
//show route to display details of a single listing
app.get('/listings/:id', async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send('Listing not found');
    }
    res.render('listing/show.ejs', { listing });
});

//Delete route to handle deletion of a listing
app.delete('/listings/:id', async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});