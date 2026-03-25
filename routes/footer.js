import express from "express";
const router = express.Router();

router.get("/about", (req, res) => {
    res.render("footer/about.ejs");
});

router.get("/contact", (req, res) => {
    res.render("footer/contact.ejs");
});

router.get("/privacy", (req, res) => {
    res.render("footer/privacy.ejs");
});

export default router;