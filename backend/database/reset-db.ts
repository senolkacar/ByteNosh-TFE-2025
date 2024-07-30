import mongoose from 'mongoose';
import user from '../src/user';
import meal from '../src/meal';
import table from '../src/table';
import order from '../src/order';
import category from '../src/category';
import * as bcrypt from 'bcrypt';

const DB_URI = 'mongodb://localhost:27017/bytenosh';
const saltRounds = 10;

const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, saltRounds);
};


const CATEGORIES = [
    {
        name: 'Main Dishes',
        description: 'Main dishes',
        image: '/images/main-dishes.jpg',
    },
    {
        name: 'Starters',
        description: 'Starters',
        image: '/images/starters.jpg',
    },
    {
        name: 'Desserts',
        description: 'Desserts',
        image: '/images/desserts.jpg',
    },
    {
        name: 'Drinks',
        description: 'Drinks',
        image: '/images/drinks.jpg',
    }
];

const USERS = [
    {
        email: 'admin@test.com',
        password: 'admin123',
        role: 'ADMIN',
    },
    {
        email: 'user@test.com',
        password: 'user123',
        role: 'USER',
    },
    {
        email: 'employee@test.com',
        password: 'employee123',
        role: 'EMPLOYEE'
    }
];

const TABLES = [
    {
        number: 1,
        name: 'Table 1',
        seats: 4,
        available: true,
    },
    {
        number: 2,
        name: 'Table 2',
        seats: 4,
        available: true,
    },
    {
        number: 3,
        name: 'Table 3',
        seats: 6,
        available: true,
    },
    {
        number: 4,
        name: 'Table 4',
        seats: 6,
        available: true,
    }
];

async function main(): Promise<void> {
    try {
        // Connect to MongoDB
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB');

        await meal.deleteMany({});
        console.log('Deleted existing meals');
        await user.deleteMany({});
        console.log('Deleted existing users');
        await table.deleteMany({});
        console.log('Deleted existing tables');
        await order.deleteMany({});
        console.log('Deleted existing orders');
        await category.deleteMany({});
        console.log('Deleted existing categories');

        const createdCategories = await category.insertMany(CATEGORIES);
        console.log('Inserted categories');

        for (let user of USERS) {
            user.password = await hashPassword(user.password);
        }

        const MEALS = [
            {
                name: 'Spaghetti Carbonara',
                description: 'Spaghetti with bacon, eggs, and parmesan cheese',
                price: 12.99,
                image: '/images/pasta-carbonara.jpg',
                vegetarian: false,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Main Dishes')?._id,
                categoryName: 'Main Dishes'
            },
            {
                name: 'Margherita Pizza',
                description: 'Pizza with tomato, mozzarella, and basil',
                price: 9.99,
                image: '/images/margherita-pizza.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Main Dishes')?._id,
                categoryName: 'Main Dishes'
            },
            {
                name: 'Manti',
                description: 'Turkish dumplings',
                price: 11.99,
                image: '/images/manti.jpg',
                vegetarian: false,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Main Dishes')?._id,
                categoryName: 'Main Dishes'
            },
            {
                name: 'Caesar Salad',
                description: 'Romaine lettuce, croutons, parmesan cheese, and Caesar dressing',
                price: 8.99,
                image: '/images/caesar-salad.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Starters')?._id,
                categoryName: 'Starters'
            },
            {
                name: 'Bruschetta',
                description: 'Toasted bread with tomatoes, garlic, and basil',
                price: 7.99,
                image: '/images/bruschetta.jpg',
                vegetarian: true,
                vegan: true,
                category: createdCategories.find(c => c.name === 'Starters')?._id,
                categoryName: 'Starters'
            },
            {
                name: 'Tiramisu',
                description: 'Coffee-flavoured Italian dessert',
                price: 6.99,
                image: '/images/tiramisu.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Desserts')?._id,
                categoryName: 'Desserts'
            },
            {
                name: 'Pastéis de Nata',
                description: 'Portuguese egg tart pastry',
                price: 5.99,
                image: '/images/pasteis-de-nata.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Desserts')?._id,
                categoryName: 'Desserts'
            },
            {
                name: 'Baklava',
                description: 'Turkish sweet pastry made of layers of filo filled with chopped nuts or pistachio and sweetened and held together with syrup or honey',
                price: 4.99,
                image: '/images/baklava.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Desserts')?._id,
                categoryName: 'Desserts'
            },
            {
                name: 'Coca-Cola',
                description: 'Coca-Cola',
                price: 2.99,
                image: '/images/coca-cola.jpg',
                vegetarian: true,
                vegan: true,
                category: createdCategories.find(c => c.name === 'Drinks')?._id,
                categoryName: 'Drinks'
            },
            {
                name: 'Orange Juice',
                description: 'Orange Juice',
                price: 3.99,
                image: '/images/orange-juice.jpg',
                vegetarian: true,
                vegan: true,
                category: createdCategories.find(c => c.name === 'Drinks')?._id,
                categoryName: 'Drinks'
            },
            {
                name: 'Water',
                description: 'Water',
                price: 1.99,
                image: '/images/water.jpg',
                vegetarian: true,
                vegan: true,
                category: createdCategories.find(c => c.name === 'Drinks')?._id,
                categoryName: 'Drinks'
            },
            {
                name: 'Beer',
                description: 'Beer',
                price: 4.99,
                image: '/images/beer.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Drinks')?._id,
                categoryName: 'Drinks'
            },
            {
                name: 'Raki',
                description: 'Traditional Turkish alcoholic beverage',
                price: 5.99,
                image: '/images/raki.png',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Drinks')?._id,
                categoryName: 'Drinks'
            }
        ];




        const meals = await meal.insertMany(MEALS);
        console.log('Inserted meals');
        const users = await user.insertMany(USERS);
        console.log('Inserted users');
        const tables = await table.insertMany(TABLES);
        console.log('Inserted tables');
        const ORDERS = [
            {
                table: tables.find(t => t.name === 'Table 1')!._id,
                meals: meals.filter(m => m.name && ['Spaghetti Carbonara', 'Margherita Pizza'].includes(m.name)).map(m => m._id),
                date: new Date(),
                status: 'pending'
            },
            {
                table: tables.find(t => t.name === 'Table 2')!._id,
                meals: meals.filter(m => m.name && ['Caesar Salad', 'Bruschetta'].includes(m.name)).map(m => m._id),
                date: new Date(),
                status: 'completed'
            },
            {
                table: tables.find(t => t.name === 'Table 3')!._id,
                meals: meals.filter(m => m.name && ['Tiramisu', 'Pastéis de Nata', 'Baklava'].includes(m.name)).map(m => m._id),
                date: new Date(),
                status: 'pending'
            }
        ];
        const orders = await order.insertMany(ORDERS);
        console.log('Inserted orders');

        console.log('Database reset successfully');
    } catch (error) {
        console.error('Error resetting the database:', error);
    } finally {
        mongoose.connection.close();
        console.log('Connection to MongoDB closed');
    }
}

main().catch(console.error);
