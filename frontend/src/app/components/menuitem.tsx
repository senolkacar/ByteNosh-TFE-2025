export default function MenuItem() {
    return (
        <div className="bg-gray-200 p-3 rounded-lg text-center hover:bg-white hover:shadow-md hover:shadow-fuchsia-200">
            <div className="flex justify-center">
            <img className="w-1/2" src="/food.png" alt="food"/>
            </div>
            <h4 className="text-xl font-semibold my-3">Food Name</h4>
            <p className="text-gray-500">Description of the food</p>
            <p className="text-fuchsia-600 font-semibold mt-2">10.99€</p>
            <button className="bg-fuchsia-600 text-white px-6 py-2 rounded-full mt-4">Add to cart</button>
        </div>
    );
}