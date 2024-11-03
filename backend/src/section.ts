import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    tables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Table' }],
});

export default mongoose.model('Section', sectionSchema);