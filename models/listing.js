import mongoose, { set } from "mongoose";

const { Schema, model } = mongoose;
 //Instead of writing:
//const Schema = mongoose.Schema;
//const model = mongoose.model;

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
      default: "https://unsplash.com/photos/an-artists-rendering-of-a-space-station-in-orbit-8yhswHHePZQ",
      set: (value) => {
        if (value && value.trim() !== "") {
          return value;
        }else {
          return "https://unsplash.com/photos/an-artists-rendering-of-a-space-station-in-orbit-8yhswHHePZQ";
      }
    },

    availableFrom: Date,
    availableTo: Date,
  },

},
{
  timestamps: true,
}
);

export default model("Listing", listingSchema);