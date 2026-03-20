import mongoose, { set } from "mongoose";

const { Schema, model } = mongoose;
 //Instead of writing:
//const Schema = mongoose.Schema;
//const model = mongoose.model;

import passportLocalMongoose from "passport-local-mongoose";
//username, password fields will be added automatically by passport-local-mongoose plugin
//no need to write username and password fields in the schema
const plugin = passportLocalMongoose.default || passportLocalMongoose;// to handle both CommonJS and ES module imports of passport-local-mongoose

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(plugin);

export default model("User", userSchema);