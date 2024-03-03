import Sidebar from "@/app/components/sidebar";

export default function POS(){
    return (
        <div className="grid grid-cols-5">
            <Sidebar></Sidebar>
            <div className="col-span-4">
                <div className="flex justify-between items-center p-4">
                    <h1 className="text-3xl font-semibold">Point of Sale</h1>
                    <div className="flex gap-4">
                        <button className="bg-yellow-400 font-bold px-6 py-2 rounded-full">New Order</button>
                        <button className="bg-yellow-400 font-bold px-6 py-2 rounded-full">View Orders</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
