import Listing from '../models/listing.js';
import mongoose from 'mongoose';
import ExpressError from '../utils/ExpressError.js';

export const index = async (req, res, next) => {
        const allListings = await Listing.find({});
        res.render ("listing/index.ejs", {allListings});
};

export const renderNewForm = (req, res) => {//req.user is added by passport and it contains the authenticated user info. 
    res.render('listing/new.ejs');
};

export const showListing = async (req, res, next) => {
    const { id } = req.params;
     if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ExpressError(400, "Invalid listing ID"));
    }
    const listing = await Listing.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author"
    }
  }).populate("owner", "username");
    if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }
    res.render('listing/show.ejs', { listing });
};

// create route require function
function parseDate(dateStr){
  if(!dateStr) return null;

  const parts = dateStr.split("-");
  if(parts[0].length === 2){ 
     return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return new Date(dateStr);
}
export const createListing = async (req, res) => {
    if (!req.file) {
    throw new Error("Image upload failed or missing");
    }
    let url= req.file.path;
    let filename = req.file.filename;
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
    newListing.image = {url, filename};

    await newListing.save();
    req.flash('success', 'New listing created successfully!');
    res.redirect("/listings");
};

export const renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send('Listing not found');
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload", "/upload/h_150,w_300");
    res.render('listing/edit.ejs', { listing, originalImageUrl });
};
     
export const updateListing = async (req, res) => {
    const { id } = req.params;
    const listingData = req.body.listing;

    listingData.amenities = listingData.amenities
      ? listingData.amenities.split(",").map(a => a.trim())
      : [];

   listingData.availableFrom = parseDate(listingData.availableFrom);
    listingData.availableTo = parseDate(listingData.availableTo);

    const listing = await Listing.findByIdAndUpdate(req.params.id, listingData);
    if(typeof req.file !== "undefined"){
    let url= req.file.path;
    let filename = req.file.filename; 
    listing.image = {url, filename};
    await listing.save();
    }

    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
};

export const deleteListing =async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
};