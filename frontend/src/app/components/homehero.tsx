import Image from 'next/image';

export default function HomeHero() {
    return (
        <div className="bg-amber-50 px-4 py-24">
        <section className="mx-auto max-w-screen-xl p-8">
            <div className="flex flex-col items-center md:grid grid-cols-2">
            <div className="py-12 col-span-1">
                <h1 className="text-center text-6xl font-semibold md:text-left">
                    Welcome to ByteNosh
                </h1>
                <p className="text-lg mt-4 text-gray-500">
                    A restaurant management system for small businesses.
                    We help you manage your restaurant, so you can focus on your food.
                </p>
                <div className="flex items-center mt-6 md:mt-4">
                    <button className="bg-yellow-400 font-bold px-6 py-4 rounded-full">Reservation</button>
                    <button className="bg-white ml-4 font-bold px-6 py-4 rounded-full border hover:text-indigo-600">Sign Up</button>
                </div>
            </div>
            <div className="col-span-1 relative">
                <Image src="/food.png" alt="food" height="450" width="450"/>
            </div>
            </div>
        </section>
        </div>
    );
}