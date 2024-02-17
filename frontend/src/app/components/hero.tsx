import Image from 'next/image';

export default function Hero() {
    return (
        <section className="grid grid-cols-2 m-4">
            <div className="py-12">
                <h1 className="text-4xl font-semibold">
                    Welcome to ByteNosh
                </h1>
                <p className="text-lg mt-4 text-gray-500">
                    A restaurant management system for small businesses.
                    We help you manage your restaurant, so you can focus on your food.
                </p>
                <div className="mt-4">
                    <button className="bg-fuchsia-600 text-white px-6 py-2 rounded-full">Reservation</button>
                </div>
            </div>
            <div className="relative">
                <Image src={'/food.png'} alt={'food'} layout={'fill'} objectFit={'contain'} />
            </div>
        </section>
    );
}