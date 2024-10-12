import mongoose from "mongoose";

const siteSchema  = new mongoose.Schema({
    name: String,
    slogan: String,
    about: String,
    address: String,
    telephone: String,
    email: String,
    social: {
        facebook: String,
        twitter: String,
        instagram: String,
    },
    googlePlay: String,
    appStore: String,
    latitude: Number,
    longitude: Number,
});

export default mongoose.model('SiteConfig', siteSchema);