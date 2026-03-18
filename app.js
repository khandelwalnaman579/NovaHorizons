import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import ejsMate from 'ejs-mate';
import methodOverride from 'method-override';
import ExpressError from './utils/ExpressError.js';
import listings from './routes/listing.js';
import reviews from './routes/review.js';
import session from 'express-session';
import flash from 'connect-flash';
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
let port = 3000;
let MONGO_URI = 'mongodb://localhost:27017/nova_horizons';

// Connect to MongoDB
main().then(() => { 
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB:', err);
});

async function main() {
   await mongoose.connect(MONGO_URI);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
const sessionOptions = {
    secret: 'your-secret-key',
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
app.use((req, res, next) => {
    res.locals.success = req.flash('success');  
    res.locals.error = req.flash('error');
    next();
});

app.use('/listings', listings);
app.use("/listings/:id/reviews", reviews);
app.use((req, res, next) => {
    if (req.method === "POST" || req.method === "PUT") {
        if (!req.body || Object.keys(req.body).length === 0) {
            return next(new ExpressError(400, "Request body cannot be empty"));
        }
    }
    next();
});

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