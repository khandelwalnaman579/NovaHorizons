import express from 'express';
const router = express.Router();
import * as userController from '../controllers/users.js';
import passport from 'passport';
import wrapAsync from '../utils/wrapAsync.js';
//==========USER ROUTES==============
router.route("/signup")
//Render the signup form
 .get(userController.renderSignupForm )

//signup route
.post(wrapAsync(userController.signup) );

router.route("/login")
  //render login page
 .get(userController.renderLoginForm )

 //login route
.post(passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
 }),userController.login );

//logout route
router.get("/logout", userController.logout );


export default router;
