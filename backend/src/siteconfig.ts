import mongoose from "mongoose";

const siteSchema  = new mongoose.Schema({
    name: String,
    slogan: String,
    about: String,
    popularDishes:{
        title: String,
        description: String
    },
    mobile:{
        title: String,
        description: String,
        googlePlay: String,
        appStore: String,
    },
    social: {
        facebook: String,
        twitter: String,
        instagram: String,
    },
    contact:{
        title: String,
        description: String,
        latitude: Number,
        longitude: Number,
        address: String,
        telephone: String,
        email: String,
    },
    aboutUs:{
        title1: String,
        description1: String,
        title2: String,
        description2: String,
        video: String,
    }
});

export default mongoose.model('SiteConfig', siteSchema);