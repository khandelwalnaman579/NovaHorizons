import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import ejs from 'ejs';
import ejsMate from 'ejs-mate';
import Listing from './models/listing.js';
import methodOverride from 'method-override';
import wrapAsync from './utils/wrapAsync.js';
import ExpressError from './utils/ExpressError.js';
import {listingSchema, reviewSchema} from './schema.js';
import Review from './models/review.js';  
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
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.send('Welcome to Nova Horizons!');
});

app.use((req, res, next) => {
    if (req.method === "POST" || req.method === "PUT") {
        if (!req.body || Object.keys(req.body).length === 0) {
            return next(new ExpressError(400, "Request body cannot be empty"));
        }
    }
    next();
});

const validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body, { abortEarly: false });
    if(error){
        // let errMsg = error.details.map((el) => el.message).join(", ");
        let errMsg = error.details
             .map(el => el.message.replace(/"listing\./g, "").replace(/"/g, ""))
            .join(", ");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

const validateReview = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body, { abortEarly: false });
    if(error){
        // let errMsg = error.details.map((el) => el.message).join(", ");
        let errMsg = error.details
             .map(el => el.message.replace(/"review\./g, "").replace(/"/g, ""))
            .join(", ");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//Index route to display all listings
app.get('/listings', wrapAsync(async (req, res, next) => {
        const allListings = await Listing.find({});
        res.render ("listing/index.ejs", {allListings});
})
);

//New route to show form for creating a new listing
app.get('/listings/new', (req, res) => {
    res.render('listing/new.ejs');
}); 
//create route to handle form submission and create a new listing
app.post('/listings',validateListing, wrapAsync(async (req, res, next) => {
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
})
);

//Edit route to show form for editing an existing listing
app.get('/listings/:id/edit', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send('Listing not found');
    }
    res.render('listing/edit.ejs', { listing });
})
);

//Update route to handle form submission and update an existing listing
app.put('/listings/:id', validateListing, wrapAsync(async (req, res, next) => {
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
})
);
//show route to display details of a single listing
app.get('/listings/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
     if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ExpressError(400, "Invalid listing ID"));
    }
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        return res.status(404).send('Listing not found');
    }
    res.render('listing/show.ejs', { listing });
})
);

//Delete route to handle deletion of a listing
app.delete('/listings/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
})
);
//==========REVIEW==============

// creating a new review for a listing
app.post('/listings/:id/reviews', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send('Listing not found');
    }
    let newReview = new Review({
        comment: req.body.review.comment,
        rating: req.body.review.rating 
    });
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    // Process the review submission here
    res.redirect(`/listings/${id}`); // Redirect back to the listing page after submitting the review
}));


//Deleting a review from a listing
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) =>{
    let{id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
})
);

app.use((req, res, next) =>{
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next)=>{
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});