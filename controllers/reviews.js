import Review from '../models/review.js';
import Listing from '../models/listing.js';
import ExpressError from '../utils/ExpressError.js';
export const createReview = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send('Listing not found');
    }
    let newReview = new Review(req.body.review);
    newReview.author= req.user._id;
    await newReview.save();
    listing.reviews.push(newReview._id); 
    await listing.save();
    // Process the review submission here
    req.flash('success', 'Review added successfully!');
    res.redirect(`/listings/${id}`); // Redirect back to the listing page after submitting the review
};
export const destroyReview = async (req, res) =>{
    let{id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listings/${id}`);
};