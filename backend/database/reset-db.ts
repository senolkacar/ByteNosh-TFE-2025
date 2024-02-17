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

        await User.deleteMany({});

        // Insert dummy users with type checking
        await User.insertMany(DUMMY_USERS);

        console.log('Dummy user data inserted successfully!');
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