
'use client';
import Hero from "@/app/components/hero";
import {useState} from "react";
import MenuIcon from '@mui/icons-material/Menu';

export default function Header() {
    const [state, setState] = useState(false)
    const navigation = [
        { title: "Meals", path: "" },
        { title: "Blog", path: "" },
        { title: "Contact", path: "" },
        { title: "About", path: "" }
    ]
    return (
        <>
            <div className="bg-amber-50">
                <header>
                    <nav className="items-center pt-5 px-4 mx-auto max-w-screen-xl sm:px-8 md:flex md:space-x-6">
                        <div className="flex justify-between">
                            <a href="">
                                <p className="text-fuchsia-600 font-bold text-2xl">ByteNosh</p>
                            </a>
                            <button className="text-fuchsia-600 outline-none md:hidden"
                                    onClick={() => setState(!state)}
                            >
                                <MenuIcon/>
                            </button>
                        </div>
                        <ul className={`flex-1 justify-between mt-12 md:flex md:mt-0 ${state ? '' : 'hidden'}`}>
                            <li className="order-2 pb-5 md:pb-0">
                                <a href=""
                                   className="py-3 px-6 rounded-md shadow-md font-bold text-center bg-yellow-400 focus:shadow-none block md:inline">
                                    Sign In
                                </a>
                            </li>
                            <div
                                className="order-1 flex-1 justify-center items-center space-y-5 md:flex md:space-x-6 md:space-y-0">
                                {
                                    navigation.map((item, idx) => (
                                        <li className="text-gray-500 hover:text-indigo-600" key={idx}>
                                            <a href={item.path}>{item.title}</a>
                                        </li>
                                    ))
                                }
                            </div>
                        </ul>
                    </nav>
                </header>
            </div>
        </>
    )
}