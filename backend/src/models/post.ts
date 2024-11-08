import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    id: String,
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: String },
    date: { type: Date, default: Date.now },
});

export default mongoose.model('Post', postSchema);