import Listing from './models/listing.js';
import ExpressError from './utils/ExpressError.js';
import mongoose from 'mongoose';
export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to access this page!');
        return res.redirect('/login');
    }
    next();
};

export const savedRedirectUrI = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

export const validateListing = (req, res, next) =>{
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
};


export const isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }
    if (listing.owner.toString() !== req.user._id.toString()) {
        req.flash('error', 'You are not the owner of this listing');
        return res.redirect(`/listings/${id}`);
    }
    next();
};