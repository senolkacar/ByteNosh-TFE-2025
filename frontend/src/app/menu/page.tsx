// Menu Page
import MainTitle from "@/app/components/maintitle";

export default function Menu(){
    return(
        <>
            <MainTitle title={"Menu"} description={"Discover our delicious dishes and drinks"} linkText={"Home"} linkUrl={"/"}/>
            <div className="mx-auto max-w-screen-xl p-8">
                <div className="flex flex-col lg:grid grid-cols-1 lg:grid-cols-4 gap-8 text-center">
                    <div className="inline-block lg:flex col-span-3 gap-3 mt-12 mb-12">
                        <p className="active:bg-yellow-400 active:opacity-100 font-bold bg-gray-200 opacity-30 px-12 py-3 md:px-6 md:py-3">All dishes</p>
                        <p className="active:bg-yellow-400 active:opacity-100 bg-gray-200 font-bold opacity-30 px-12 py-3 md:px-6 md:py-3">Starters</p>
                        <p className="active:bg-yellow-400 active:opacity-100 bg-gray-200 font-bold opacity-30 px-12 py-3 md:px-6 md:py-3">Main Dishes</p>
                        <p className="active:bg-yellow-400 active:opacity-100 bg-gray-200 font-bold opacity-30 px-12 py-3 md:px-6 md:py-3">Desserts</p>
                        <p className="active:bg-yellow-400 active:opacity-100 bg-gray-200 font-bold opacity-30 px-12 py-3 md:px-6 md:py-3">Drinks</p>
                    </div>
                <div className="flex col-span-1 justify-center lg:justify-end items-center">
                    <input type="search" placeholder="Search for a dish" className="border-2 border-gray-200 p-3 rounded-lg"/>
                </div>
                </div>
            </div>
        </>
    )
}