import mongoose, { set } from "mongoose";

const { Schema, model } = mongoose;
 //Instead of writing:
//const Schema = mongoose.Schema;
//const model = mongoose.model;

const reviewSchema = new Schema({
    comment: String,
    rating:{
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

export default model("Review", reviewSchema);