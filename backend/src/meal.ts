import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    image: String,
    vegetarian: Boolean,
    vegan: Boolean,
    category: String,
});

export default mongoose.model('Meal', mealSchema);
