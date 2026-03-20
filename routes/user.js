import express from 'express';
const router = express.Router();

import User from '../models/user.js'; 
import passport from 'passport';
import ExpressError from '../utils/ExpressError.js';

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body.user;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Registration successful!');
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                req.flash('error', 'Login after registration failed. Please try logging in manually.');
                return res.redirect("/login");
            }
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash('error', err.message);
        res.status(400).render("users/signup.ejs", { error: err.message });
    }
});

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
}), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect("/listings");
});

router.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {  
            return next(err);
        }
        req.flash('success', 'You have been logged out!');
        res.redirect("/listings");
    });
});


export default router;
