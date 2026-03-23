import express from 'express';
const router = express.Router({ mergeParams: true });
import wrapAsync from '../utils/wrapAsync.js';
import { isReviewOwner,isLoggedIn, validateReview } from '../middleware.js';
import * as reviewController from '../controllers/reviews.js';
//==========REVIEW==============

// creating a new review for a listing
router.post('/',isLoggedIn, validateReview, wrapAsync(reviewController.createReview));


//Deleting a review from a listing
router.delete("/:reviewId",isLoggedIn, isReviewOwner, wrapAsync(reviewController.destroyReview));


export default router;