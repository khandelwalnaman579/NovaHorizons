import express from 'express';
const router = express.Router();
import wrapAsync from '../utils/wrapAsync.js';
import { validateListing, isLoggedIn, isOwner } from '../middleware.js';
import * as listingController from '../controllers/listings.js';

import path from 'path';
import { fileURLToPath } from "url";
import multer from "multer";
// needed because __dirname doesn't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { cloudinary, storage } from "../cloudConfig.js";
//multipart/files- uploading
const upload = multer({storage});
      
router.route("/")

  //Index route to display all listings      
.get(wrapAsync(listingController.index))

  // create route to handle form submission and create a new listing  
.post(isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);
 
//New route for creating a new listing
router.get('/new', isLoggedIn, listingController.renderNewForm);
  //isLoggedIn middleware checks if req.user exists, if not it redirects to login page. This way we can protect the route and only allow authenticated users to access it.

//Edit route to show form for editing an existing listing
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


router.route("/:id")
//Update route to handle form submission and update an existing listing
.put(isLoggedIn, 
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing))
//show route to display details of a single listing
.get(wrapAsync(listingController.showListing))

//Delete route to handle deletion of a listing
.delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)
);

export default router;