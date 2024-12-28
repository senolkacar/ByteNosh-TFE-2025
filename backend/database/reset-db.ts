import mongoose from 'mongoose';
import user from '../src/models/user';
import meal from '../src/models/meal';
import table from '../src/models/table';
import order from '../src/models//order';
import category from '../src/models/category';
import post from '../src/models/post';
import siteConfig from '../src/models/siteconfig';
import * as bcrypt from 'bcryptjs';
import * as dotenv from "dotenv";
import section from "../src/models/section";
import timeslot from "../src/models/timeslot";
import closure from "../src/models/closure";
import reservation from "../src/models/reservation";

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
        avatar: 'avatar.jpg',
        email: 'kacar.senol@gmail.com',
        password: 'admin123',
        role: 'ADMIN',
    },
    {
        fullName: 'François RegularUser',
        phone:'123456789',
        avatar: 'avatar.jpg',
        email: 'user@test.com',
        password: 'user123',
        role: 'USER',
    },
    {
        fullName: 'Patrick Employe',
        phone:'123456789',
        avatar: 'avatar.jpg',
        email: 'employee@test.com',
        password: 'employee123',
        role: 'EMPLOYEE'
    }
];

const SECTIONS: { _id: mongoose.Types.ObjectId, name: string, description: string, isIndoor: boolean, tables: mongoose.Types.ObjectId[] }[] = [
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'First Floor',
        description: 'First floor section',
        isIndoor: true,
        tables: [],
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Second Floor',
        description: 'Second floor section',
        isIndoor: true,
        tables: [],
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Balcony',
        description: 'Balcony section',
        isIndoor: false,
        tables: [],
    }
];

const TABLES = [
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'First Floor')!._id,
        number: 1,
        name: 'Table 1',
        seats: 4,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'First Floor')!._id,
        number: 2,
        name: 'Table 2',
        seats: 4,
        isAvailable: true,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'First Floor')!._id,
        number: 3,
        name: 'Table 3',
        seats: 2,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'First Floor')!._id,
        number: 4,
        name: 'Table 4',
        seats: 2,
        isAvailable: true,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'First Floor')!._id,
        number: 5,
        name: 'Table 5',
        seats: 4,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'First Floor')!._id,
        number: 6,
        name: 'Table 6',
        seats: 6,
        isAvailable: true,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Second Floor')!._id,
        number: 7,
        name: 'Table 7',
        seats: 6,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Second Floor')!._id,
        number: 8,
        name: 'Table 8',
        seats: 4,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Second Floor')!._id,
        number: 9,
        name: 'Table 9',
        seats: 4,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Second Floor')!._id,
        number: 10,
        name: 'Table 10',
        seats: 2,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Second Floor')!._id,
        number: 11,
        name: 'Table 11',
        seats: 2,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Balcony')!._id,
        number: 12,
        name: 'Table 12',
        seats: 2,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Balcony')!._id,
        number: 13,
        name: 'Table 13',
        seats: 2,
        status: 'AVAILABLE',

    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Balcony')!._id,
        number: 14,
        name: 'Table 14',
        seats: 4,
        status: 'AVAILABLE',
    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Balcony')!._id,
        number: 15,
        name: 'Table 15',
        seats: 4,
        status: 'AVAILABLE',

    },
    {
        _id: new mongoose.Types.ObjectId(),
        section: SECTIONS.find(s => s.name === 'Balcony')!._id,
        number: 16,
        name: 'Table 16',
        seats: 6,
        status: 'AVAILABLE',

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
        await timeslot.deleteMany({});
        console.log('Deleted existing opening hours');
        await closure.deleteMany({});
        console.log('Deleted existing closures');
        await reservation.deleteMany({});
        console.log('Deleted existing reservations');

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
                address: 'Avenue de l\'Astronomie 19 1210 Saint-Josse-ten-Noode',
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
                image: 'pasta-carbonara.jpg',
                vegetarian: false,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Main Dishes')?._id
            },
            {
                name: 'Margherita Pizza',
                description: 'Pizza with tomato, mozzarella, and basil',
                price: 9.99,
                image: 'margherita-pizza.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Main Dishes')?._id
            },
            {
                name: 'Manti',
                description: 'Turkish dumplings',
                price: 11.99,
                image: 'manti.jpg',
                vegetarian: false,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Main Dishes')?._id
            },
            {
                name: 'Caesar Salad',
                description: 'Romaine lettuce, croutons, parmesan cheese, and Caesar dressing',
                price: 8.99,
                image: 'caesar-salad.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Starters')?._id
            },
            {
                name: 'Bruschetta',
                description: 'Toasted bread with tomatoes, garlic, and basil',
                price: 7.99,
                image: 'bruschetta.jpg',
                vegetarian: true,
                vegan: true,
                category: createdCategories.find(c => c.name === 'Starters')?._id
            },
            {
                name: 'Tiramisu',
                description: 'Coffee-flavoured Italian dessert',
                price: 6.99,
                image: 'tiramisu.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Desserts')?._id
            },
            {
                name: 'Pastéis de Nata',
                description: 'Portuguese egg tart pastry',
                price: 5.99,
                image: 'pasteis-de-nata.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Desserts')?._id
            },
            {
                name: 'Baklava',
                description: 'Turkish sweet pastry made of layers of filo filled with chopped nuts or pistachio and sweetened and held together with syrup or honey',
                price: 4.99,
                image: 'baklava.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Desserts')?._id
            },
            {
                name: 'Coca-Cola',
                description: 'Coca-Cola',
                price: 2.99,
                image: 'coca-cola.jpg',
                vegetarian: true,
                vegan: true,
                category: createdCategories.find(c => c.name === 'Drinks')?._id
            },
            {
                name: 'Orange Juice',
                description: 'Orange Juice',
                price: 3.99,
                image: 'orange-juice.jpg',
                vegetarian: true,
                vegan: true,
                category: createdCategories.find(c => c.name === 'Drinks')?._id
            },
            {
                name: 'Water',
                description: 'Water',
                price: 1.99,
                image: 'water.jpg',
                vegetarian: true,
                vegan: true,
                category: createdCategories.find(c => c.name === 'Drinks')?._id
            },
            {
                name: 'Beer',
                description: 'Beer',
                price: 4.99,
                image: 'beer.jpg',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Drinks')?._id
            },
            {
                name: 'Raki',
                description: 'Traditional Turkish alcoholic beverage',
                price: 5.99,
                image: 'raki.png',
                vegetarian: true,
                vegan: false,
                category: createdCategories.find(c => c.name === 'Drinks')?._id
            }
        ];

        const OPENING_HOURS = [
            {
                day: 'Monday',
                openHour: '09:00',
                closeHour: '17:00',
                isOpen: true,
            },
            {
                day: 'Tuesday',
                openHour: '09:00',
                closeHour: '17:00',
                isOpen: true,
            },
            {
                day: 'Wednesday',
                openHour: '09:00',
                closeHour: '23:00',
                isOpen: true,
            },
            {
                day: 'Thursday',
                openHour: '09:00',
                closeHour: '17:00',
                isOpen: true,
            },
            {
                day: 'Friday',
                openHour: '09:00',
                closeHour: '17:00',
                isOpen: true,
            },
            {
                day: 'Saturday',
                openHour: '09:00',
                closeHour: '17:00',
                isOpen: true,
            },
            {
                day: 'Sunday',
                openHour: '09:00',
                closeHour: '17:00',
                isOpen: false,
            }
        ];


        const CLOSURES = [
            {
                date: new Date('2024-12-31'),
                reason: 'Holiday'
            },
            {
                date: new Date('2024-09-14'),
                reason: 'Maintenance'
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
        const openingHours = await timeslot.insertMany(OPENING_HOURS);
        console.log('Inserted opening hours');
        const closures = await closure.insertMany(CLOSURES);
        console.log('Inserted closures');

        const reservationsData = [
            {
                user: users.find(u => u.email === 'user@test.com')!._id,
                table: tables.find(t => t.name === 'Table 3')!._id,
                reservationTime: new Date('2024-11-21T23:00:00.000+00:00'),
                status: 'CONFIRMED',
                section: sections.find(s => s.name === 'First Floor')!._id,
                guests: 2,
                timeSlot: '09:00 - 10:00',
                orders: [],
                notified: false,
                createdAt: new Date('2024-11-21T23:00:00.000+00:00'),
                updatedAt: new Date('2024-11-21T23:00:00.000+00:00'),
                qrCodeUrl: 'data:image/png;base64,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'

            },
            {
                user: users.find(u => u.email === 'user@test.com')!._id,
                table: tables.find(t => t.name === 'Table 4')!._id,
                reservationTime: new Date('2024-11-19T23:00:00.000+00:00'),
                status: 'CONFIRMED',
                section: sections.find(s => s.name === 'First Floor')!._id,
                guests: 2,
                timeSlot: '10:00 - 11:00',
                orders: [],
                notified: false,
                createdAt: new Date('2024-11-20T22:55:02.600+00:00'),
                updatedAt: new Date('2024-11-20T22:55:02.600+00:00'),
                qrCodeUrl: 'data:image/png;base64,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'
            }
        ];
        const reservations = await reservation.insertMany(reservationsData);
        console.log('Inserted reservations');

        const ordersData = [
            // Orders linked to reservation
            {
                table: tables.find(t => t.name === 'Table 3')!._id,
                meals: meals.filter(m => ['Spaghetti Carbonara', 'Margherita Pizza'].includes(m.name)).map(m => ({
                                meal: m._id,
                                quantity: 1
                                })),
                date: new Date(),
                status: 'IN_PROGRESS',
                reservation: reservations[0]._id,
                user: users.find(u => u.email === 'user@test.com')!._id,
            },
            {
                table: tables.find(t => t.name === 'Table 4')!._id,
                meals: meals.filter(m => ['Caesar Salad', 'Bruschetta'].includes(m.name)).map(m => ({
                                meal: m._id,
                                quantity: 2
                                })),
                date: new Date(),
                status: 'SERVED',
                reservation: reservations[1]._id,
                user: users.find(u => u.email === 'user@test.com')!._id,
            },
            // Walk-in order (no reservation)
            {
                table: tables.find(t => t.name === 'Table 4')!._id,
                 meals: meals.filter(m => ['Tiramisu', 'Pastéis de Nata'].includes(m.name)).map(m => ({
                                                meal: m._id,
                                                quantity: 2
                                                })),
                date: new Date(),
                status: 'PENDING'
                // No reservation field for walk-in
            }
        ];
        const orders = await order.insertMany(ordersData);
        console.log('Inserted orders');

        // Update reservations to link to their respective orders
        await reservation.updateOne(
            { _id: reservations[0]._id },
            { $push: { orders: orders[0]._id } }
        );
        await reservation.updateOne(
            { _id: reservations[1]._id },
            { $push: { orders: orders[1]._id } }
        );

        console.log('Database reset successfully');
    } catch (error) {
        console.error('Error resetting the database:', error);
    } finally {
        mongoose.connection.close();
        console.log('Connection to MongoDB closed');
    }
}

main().catch(console.error);
