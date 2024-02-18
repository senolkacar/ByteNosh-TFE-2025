import MenuItem from "@/app/components/menuitem";

export default function HomeMenu() {
    return (
        <section className="m-4 w-full">
            <div className="text-center">
                <h2 className="text-4xl font-semibold text-fuchsia-600">Menu</h2>
                <p className="text-lg mt-4 text-gray-500">Découvrez nos plats</p>
            </div>
            <div className="flex justify-center items-center gap-2 mt-2 md:gap-6">
                <p className="bg-fuchsia-600 text-white px-6 py-2 rounded-md">All</p>
                <p className="text-gray-500">Starters</p>
                <p className="text-gray-500">Main Course</p>
                <p className="text-gray-500">Desserts</p>
                <p className="text-gray-500">Drinks</p>
            </div>
            <div className="grid grid-cols-2 mt-4 mr-5 gap-3 md:grid-cols-3">
            <MenuItem/>
            <MenuItem/>
                <MenuItem/>
                <MenuItem/>
                <MenuItem/>
                <MenuItem/>
            </div>
        </section>
    );
}