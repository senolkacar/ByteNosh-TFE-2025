import Image from 'next/image';

export default function Hero() {
    return (
        <section className="bg-amber-50 grid grid-cols-2 p-8">
            <div className="py-12">
                <h1 className="text-6xl font-semibold">
                    Welcome to ByteNosh
                </h1>
                <p className="text-lg mt-4 text-gray-500">
                    A restaurant management system for small businesses.
                    We help you manage your restaurant, so you can focus on your food.
                </p>
                <div className="mt-4">
                    <button className="bg-yellow-400 font-bold px-6 py-4 rounded-full">Reservation</button>
                    <button className="mt-2 md:bg-white ml-4 font-bold px-6 py-4 rounded-full border hover:text-indigo-600">Sign Up</button>
                </div>
            </div>
            <div className="relative">
                <Image src={'/food.png'} alt={'food'} layout={'fill'} objectFit={'contain'}/>
            </div>
        </section>
    );
}