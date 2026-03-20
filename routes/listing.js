import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import { listingSchema } from '../schema.js';
import wrapAsync from '../utils/wrapAsync.js';
import ExpressError from '../utils/ExpressError.js';
import Listing from '../models/listing.js';
import { isLoggedIn, isOwner } from '../middleware.js';


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
//Index route to display all listings
router.get('/', wrapAsync(async (req, res, next) => {
        const allListings = await Listing.find({});
        res.render ("listing/index.ejs", {allListings});
})
);

//New route for creating a new listing
router.get('/new', isLoggedIn, isOwner, (req, res) => {//req.user is added by passport and it contains the authenticated user info. 
  //isLoggedIn middleware checks if req.user exists, if not it redirects to login page. This way we can protect the route and only allow authenticated users to access it.
    res.render('listing/new.ejs');
}); 

// create route require function
function parseDate(dateStr){
  if(!dateStr) return null;

  const parts = dateStr.split("-");
  if(parts[0].length === 2){ 
     return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return new Date(dateStr);
}

//create route to handle form submission and create a new listing
router.post(
  "/", isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {

    const listingData = req.body.listing;

    // amenities processing
    listingData.amenities = listingData.amenities
      ? listingData.amenities.split(",").map(a => a.trim())
      : [];

    // date processing
    listingData.availableFrom = parseDate(listingData.availableFrom);
    listingData.availableTo = parseDate(listingData.availableTo);

    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;

    await newListing.save();
    req.flash('success', 'New listing created successfully!');
    res.redirect("/listings");
  })
);

//Edit route to show form for editing an existing listing
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send('Listing not found');
    }
    res.render('listing/edit.ejs', { listing });
})
);

//Update route to handle form submission and update an existing listing
router.put(
  "/:id", isLoggedIn, 
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('/listings');
    }
    const listingData = req.body.listing;

    listingData.amenities = listingData.amenities
      ? listingData.amenities.split(",").map(a => a.trim())
      : [];

   listingData.availableFrom = parseDate(listingData.availableFrom);
    listingData.availableTo = parseDate(listingData.availableTo);


    await Listing.findByIdAndUpdate(req.params.id, listingData);
    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
  })
);
//show route to display details of a single listing
router.get('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
     if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ExpressError(400, "Invalid listing ID"));
    }
    const listing = await Listing.findById(id).populate("reviews").populate("owner", "username");
    if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }
    res.render('listing/show.ejs', { listing });
})
);

//Delete route to handle deletion of a listing
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
})
);

export default router;