import express from 'express';
const router = express.Router({ mergeParams: true });
import Listing from '../models/listing.js';
import { reviewSchema } from '../schema.js';
import wrapAsync from '../utils/wrapAsync.js';
import Review from '../models/review.js';
const validateReview = (req, res, next) =>{
    let {error} = reviewSchema.validate(req.body, { abortEarly: false });
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
//==========REVIEW==============

// creating a new review for a listing
router.post('/listings/:id/reviews', wrapAsync(async (req, res, next) => {
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
router.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) =>{
    let{id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
})
);
export default router;