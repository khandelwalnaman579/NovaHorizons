import mongoose from "mongoose";
import Listing from "../models/listing.js";
import sampleListings from "./data.js";

const MONGO_URI = "mongodb://localhost:27017/nova_horizons";

main().then(async () => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.log("Error connecting to MongoDB:", err);
});
async function main() {
    await mongoose.connect(MONGO_URI);
} 
const initDB = async () => {
        await Listing.deleteMany({});
        console.log("Existing listings cleared.");
        await Listing.insertMany(sampleListings);
        console.log("Sample listings inserted successfully!");
        mongoose.connection.close();
        console.log("Database connection closed.");
    }
initDB(); 
