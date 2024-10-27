import category from './category';

export default interface Meal{
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    vegetarian: boolean;
    vegan: boolean;
    category: category;
}