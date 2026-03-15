import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import { listingSchema } from '../schema.js';
import wrapAsync from '../utils/wrapAsync.js';
import ExpressError from '../utils/ExpressError.js';
import Listing from '../models/listing.js';


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

//New route to show form for creating a new listing
router.get('/new', (req, res) => {
    res.render('listing/new.ejs');
}); 

//create route to handle form submission and create a new listing
// create route require function
function parseDate(dateStr){
  if(!dateStr) return null;

  const parts = dateStr.split("-");
  if(parts[0].length === 2){ 
     return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return new Date(dateStr);
}
router.post(
  "/",
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

    await newListing.save();

    res.redirect("/listings");
  })
);

//Edit route to show form for editing an existing listing
router.get('/:id/edit', wrapAsync(async (req, res, next) => {
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
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    const listingData = req.body.listing;

    listingData.amenities = listingData.amenities
      ? listingData.amenities.split(",").map(a => a.trim())
      : [];

   listingData.availableFrom = parseDate(listingData.availableFrom);
    listingData.availableTo = parseDate(listingData.availableTo);


    await Listing.findByIdAndUpdate(req.params.id, listingData);

    res.redirect(`/listings/${id}`);
  })
);
//show route to display details of a single listing
router.get('/:id', wrapAsync(async (req, res, next) => {
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
router.delete('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
})
);

export default router;