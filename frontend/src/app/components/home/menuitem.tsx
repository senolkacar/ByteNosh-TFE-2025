'use client';
import Image from 'next/image';
export default function MenuItem() {
    return (
        <div className="bg-gray-50 m-4 p-3 rounded-lg text-center shadow-md hover:bg-white hover:shadow-md hover:shadow-gray-400 ">
            <div className="flex justify-center">
            <Image className="w-1/2" fill={true} src="http://localhost:5000/images/food.png" alt="food"/>
            </div>
            <h4 className="text-xl font-semibold my-3">Food Name</h4>
            <p className="text-gray-500">Description of the food</p>

            <div className="flex justify-center items-center gap-12 mt-4">
                <p className="font-semibold text-2xl">10.99€</p>
                <button className="bg-yellow-400 font-bold px-6 py-2 rounded-full">Add to cart</button>
            </div>

        </div>
    );
}