import mongoose from 'mongoose';

const DB_URI = 'mongodb://localhost:27017/bytenosh';

interface DummyUser{
    username: string;
    password: string;
}

const DUMMY_USERS: DummyUser[] = [
    {username: 'user1',password: 'password1'},
    {username: 'user2',password: 'password2'}
];

interface Meals{
    name: string;
    description: string;
    price: number;
    image: string;
    vegetarian: boolean;
    vegan: boolean;
    category: string;
}

const MEALS: Meals[] = [
{
        name: 'Spaghetti Carbonara',
        description: 'Spaghetti with bacon, eggs, and parmesan cheese',
        price: 12.99,
        image: '/images/pasta-carbonara.jpg',
        vegetarian: false,
        vegan: false,
        category: 'Main Dishes'
    },
    {
        name: 'Margherita Pizza',
        description: 'Pizza with tomato, mozzarella, and basil',
        price: 9.99,
        image: '/images/margherita-pizza.jpg',
        vegetarian: true,
        vegan: false,
        category: 'Main Dishes'
    },
    {
        name:'Manti',
        description: 'Turkish dumplings',
        price: 11.99,
        image: '/images/manti.jpg',
        vegetarian: false,
        vegan: false,
        category: 'Main Dishes'
    },
    {
        name: 'Caesar Salad',
        description: 'Romaine lettuce, croutons, parmesan cheese, and Caesar dressing',
        price: 8.99,
        image: '/images/caesar-salad.jpg',
        vegetarian: true,
        vegan: false,
        category: 'Starters'
    },
    {
        name: 'Bruschetta',
        description: 'Toasted bread with tomatoes, garlic, and basil',
        price: 7.99,
        image: '/images/bruschetta.jpg',
        vegetarian: true,
        vegan: true,
        category: 'Starters'
    },
    {
        name: 'Tiramisu',
        description: 'Coffee-flavoured Italian dessert',
        price: 6.99,
        image: '/images/tiramisu.jpg',
        vegetarian: true,
        vegan: false,
        category: 'Desserts'
    },
    {
        name:'Pastéis de Nata',
        description: 'Portuguese egg tart pastry',
        price: 5.99,
        image: '/images/pasteis-de-nata.jpg',
        vegetarian: true,
        vegan: false,
        category: 'Desserts'
    },
    {
        name: 'Baklava',
        description: 'Turkish sweet pastry made of layers of filo filled with chopped nuts or pistachio and sweetened and held together with syrup or honey',
        price: 4.99,
        image: '/images/baklava.jpg',
        vegetarian: true,
        vegan: false,
        category: 'Desserts'
    },
    {
        name: 'Coca-Cola',
        description: 'Coca-Cola',
        price: 2.99,
        image: '/images/coca-cola.jpg',
        vegetarian: true,
        vegan: true,
        category: 'Drinks'
    },
    {
        name: 'Orange Juice',
        description: 'Orange Juice',
        price: 3.99,
        image: '/images/orange-juice.jpg',
        vegetarian: true,
        vegan: true,
        category: 'Drinks'
    },
    {
        name: 'Water',
        description: 'Water',
        price: 1.99,
        image: '/images/water.jpg',
        vegetarian: true,
        vegan: true,
        category: 'Drinks'

    },
    {
        name: 'Beer',
        description: 'Beer',
        price: 4.99,
        image: '/images/beer.jpg',
        vegetarian: true,
        vegan: false,
        category: 'Drinks'
    },
    {
        name: 'Raki',
        description: 'Traditional Turkish alcoholic beverage',
        price: 5.99,
        image: '/images/raki.png',
        vegetarian: true,
        vegan: false,
        category: 'Drinks'
    }


]

async function main(): Promise<void> {
    try {
        // Connect to MongoDB
        await mongoose.connect(DB_URI);

        // Define User model with type safety
        const User = mongoose.model<DummyUser>(
            'User',
            new mongoose.Schema({
                username: String,
                password: String,
            }),
        );

        // Define Meal model with type safety
        const Meal = mongoose.model<Meals>(
            'Meal',
            new mongoose.Schema({
                name: String,
                description: String,
                price: Number,
                image: String,
                vegetarian: Boolean,
                vegan: Boolean,
                category: String
            }),
        );

         await Meal.deleteMany({});
         await User.deleteMany({});
         await Meal.insertMany(MEALS);
         await User.insertMany(DUMMY_USERS);

        console.log('Dummy user data and meals inserted successfully!');
    } catch (error) {
        console.error('Error inserting dummy user data:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

// Execute the script automatically during project build
main().then(() => process.exit(0)).catch((error) => {
    console.error('Error executing script:', error);
    process.exit(1);
});