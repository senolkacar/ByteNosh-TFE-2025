import mongoose from 'mongoose';
import user from '../src/user';
import meal from '../src/meal';
import table from '../src/table';
import order from '../src/order';
import category from '../src/category';
import post from '../src/post';
import siteConfig from '../src/siteconfig';
import * as bcrypt from 'bcrypt';
import * as dotenv from "dotenv";
import section from "../src/section";

dotenv.config();
const DB_URI = process.env.MONGODB_URI as string;
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
        fullName: 'Admin User',
        phone:'123456789',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'ADMIN',
    },
    {
        fullName: 'Regular User',
        phone:'123456789',
        email: 'user@test.com',
        password: 'user123',
        role: 'USER',
    },
    {
        fullName: 'Employee User',
        phone:'123456789',
        email: 'employee@test.com',
        password: 'employee123',
        role: 'EMPLOYEE'
    }
];

const SECTIONS: { _id: mongoose.Types.ObjectId, name: string, description: string, tables: mongoose.Types.ObjectId[] }[] = [
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Indoor',
        description: 'Indoor section',
        tables: [],
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Second Floor',
        description: 'Second floor section',
        tables: [],
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Balcony',
        description: 'Balcony section',
        tables: [],
    }
];

const TABLES = [
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Indoor')!._id,
        number: 1,
        name: 'Table 1',
        seats: 4,
        isAvailable: true,
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Indoor')!._id,
        number: 2,
        name: 'Table 2',
        seats: 4,
        isAvailable: true,
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Second Floor')!._id,
        number: 3,
        name: 'Table 3',
        seats: 6,
        isAvailable: true,
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Second Floor')!._id,
        number: 4,
        name: 'Table 4',
        seats: 6,
        isAvailable: true,
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Balcony')!._id,
        number: 5,
        name: 'Table 5',
        seats: 2,
        isAvailable: true,
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Balcony')!._id,
        number: 6,
        name: 'Table 6',
        seats: 2,
        isAvailable: true,
    }
];

SECTIONS.forEach(section => {
    section.tables = TABLES.filter(table => table.section.equals(section._id)).map(table => table._id);
});


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
        await post.deleteMany({});
        console.log('Deleted existing posts');
        await section.deleteMany({});
        console.log('Deleted existing sections');
        await siteConfig.deleteMany({});
        console.log('Deleted existing site config');

        const createdCategories = await category.insertMany(CATEGORIES);
        console.log('Inserted categories');

        for (let user of USERS) {
            user.password = await hashPassword(user.password);
        }

        const POSTS = [
            {
                title: 'First Post',
                body: 'This is the first post',
                author: 'John Doe',
            },
            {
                title: 'Second Post',
                body: 'This is the second post',
                author: 'John Doe',
            },
            {
                title: 'Third Post',
                body: 'This is the third post',
                author: 'John Doe',
            }
        ]

        const SITE_CONFIG = {
            name: 'ByteNosh',
            slogan: 'A restaurant management system for small businesses.\n' +
                '                    We help you manage your restaurant, so you can focus on your food.',
            about: 'Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or\n' +
                '                        a typeface without relying on meaningful content.',
            social: {
                facebook: 'https://www.facebook.com/epfcofficiel/',
                twitter: 'https://x.com/',
                instagram: 'https://www.instagram.com/epfc.eu/',
            },
            popularDishes: {
                title: 'Popular Dishes',
                description: 'Discover our popular dishes',
            },
            mobile: {
                title: 'Download the ByteNosh app',
                description: 'Get the ByteNosh app on your phone and manage your restaurant on the go.',
                googlePlay: 'https://play.google.com/store/apps?hl=fr&pli=1',
                appStore: 'https://www.apple.com/befr/app-store/',
            },
            contact:{
                title:'Contact your favorite restaurant',
                description: 'Consectetur adipisicing elit. Cupiditate nesciunt amet facilis numquam, nam adipisci qui voluptate voluptas enim obcaecati veritatis animi nulla, mollitia commodi quaerat ex, autem ea laborum.',
                latitude: '50.851561',
                longitude: '4.369546',
                address: 'Avenue de l\'Astronomie 19\n' +
                    '                        1210 Saint-Josse-ten-Noode',
                telephone: '02 777 10 10',
                email: 'admin@test.com'
            },
            aboutUs:{
                title1: 'We do not cook, we create your emotions!',
                description1: 'Faudantium magnam error temporibus ipsam aliquid neque quibusdam dolorum, quia ea numquam assumenda mollitia dolorem impedit. Voluptate at quis exercitationem officia temporibus adipisci quae totam enim dolorum, assumenda. Sapiente soluta nostrum reprehenderit a velit obcaecati facilis vitae magnam tenetur neque vel itaque inventore eaque explicabo commodi maxime! Aliquam quasi, voluptates odio.\n' +
                    '\n' +
                    '                        Consectetur adipisicing elit. Cupiditate nesciunt amet facilis numquam, nam adipisci qui voluptate voluptas enim obcaecati veritatis animi nulla, mollitia commodi quaerat ex, autem ea laborum.',
                title2: 'Restaurant is like a theater.\n Our task is to amaze you!',
                description2: 'Consectetur adipisicing elit. Cupiditate nesciunt amet facilis\n' +
                    '                        numquam, nam adipisci qui\n' +
                    '                        voluptate voluptas enim obcaecati veritatis animi nulla, mollitia commodi quaerat ex, autem ea\n' +
                    '                        laborum.',
                video: 'https://www.youtube.com/embed/F3zw1Gvn4Mk',
            }

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
        const posts = await post.insertMany(POSTS);
        console.log('Inserted posts');
        const siteConfigs = await siteConfig.insertMany(SITE_CONFIG);
        console.log('Inserted site config');
        const tables = await table.insertMany(TABLES);
        console.log('Inserted tables');
        const sections = await section.insertMany(SECTIONS);
        console.log('Inserted sections');

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
