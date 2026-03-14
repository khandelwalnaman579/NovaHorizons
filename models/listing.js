import mongoose, { set } from "mongoose";

const { Schema, model } = mongoose;
 //Instead of writing:
//const Schema = mongoose.Schema;
//const model = mongoose.model;

import Review from "./review.js";

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      enum: ["Moon", "Mars", "Space Station", "Orbital Hotel", "Deep Space"],
    },

    type: {
      type: String,
      required: true,
      enum: ["Hotel", "Station", "Expedition", "Cruise"],
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    durationInDays: {
      type: Number,
      required: true,
      min: 1,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    amenities: [
      {
        type: String,
      },
    ],

    imageUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1654280983312-110b5b422397?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      set: (value) => {
        if (value && value.trim() !== "") {
          return value;
        }else {
          return "https://images.unsplash.com/photo-1654280983312-110b5b422397?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      }
    },
  },
  reviews:[
       {
        type: Schema.Types.ObjectId,
        ref: "Review",
       }
  ],
  availableFrom: Date,
  availableTo: Date,

},
{
  timestamps: true,
}
);
//delete middleware to remove associated reviews when a listing is deleted
listingSchema.post('findOneAndDelete', async (listing)=>{
     if(listing){
        await Review.deleteMany({
            _id: {
                $in: listing.reviews,
            },
        });
     }
});

export default model("Listing", listingSchema);