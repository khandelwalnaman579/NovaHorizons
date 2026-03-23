import "./config/env.js";
await import("./cloudConfig.js");
import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import ejsMate from 'ejs-mate';
import methodOverride from 'method-override';
import ExpressError from './utils/ExpressError.js';
import listingRouter from './routes/listing.js';
import reviewRouter from './routes/review.js';
import userRouter from './routes/user.js';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from './models/user.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
let port = 3000;
let MONGO_URI = process.env.MONGO_URI;
let SECRET_KEY = process.env.SECRET_KEY;

// needed because __dirname doesn't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Connect to MongoDB
main().then(() => { 
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB:', err);
});

async function main() {
   await mongoose.connect(MONGO_URI);
}

app.set('views', path.join(__dirname, 'views'));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
const sessionOptions = {
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,// to safe from cross-site scripting attacks
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week(in milliseconds)
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
};

app.get('/', (req, res) => {
    res.send('Welcome to Nova Horizons!');
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');  
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user; // or req.session.user
    next();
});

// app.use("/demoUser", async (req, res) => {
//     let demoUser = new User({ username: "demoUser", email: "demouser@example.com" });
//     let registeredUser = await User.register(demoUser, "password123");
//     res.send(registeredUser);
// });
app.use('/', userRouter);
app.use('/listings', listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
// app.use((req, res, next) => {
//     if (req.method === "POST" || req.method === "PUT") {
//         if (!req.body || Object.keys(req.body).length === 0) {
//             return next(new ExpressError(400, "Request body cannot be empty"));
//         }
//     }
//     next();
// });

app.use((req, res, next) =>{
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next)=>{
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});