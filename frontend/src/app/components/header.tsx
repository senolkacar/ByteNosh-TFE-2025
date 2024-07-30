
'use client';
import {useState} from "react";
import MenuIcon from '@mui/icons-material/Menu';
import Link from "next/link";
import {LoginButton} from "@/components/auth/login-button";
import {auth} from "@/auth";

export default function Header() {
    const [state, setState] = useState(false)
    const navigation = [
        { title: "Home", path: "/" },
        { title: "Menu", path: "/menu" },
        { title: "Blog", path: "" },
        { title: "Contact", path: "" },
        { title: "About", path: "" }
    ]
    return (
        <>
            <div className="py-8 fixed bg-white w-full z-10 border-b">
                <header>
                    <nav className="items-center pt-5 px-4 mx-auto max-w-screen-xl sm:px-8 md:flex md:space-x-6">
                        <div className="flex justify-between">
                            <Link href="/">
                                <p className="text-fuchsia-600 font-bold text-2xl">ByteNosh</p>
                            </Link>
                            <button className="text-fuchsia-600 outline-none md:hidden"
                                    onClick={() => setState(!state)}
                            >
                                <MenuIcon/>
                            </button>
                        </div>
                        <ul className={`flex-1 justify-between mt-12 md:flex md:mt-0 ${state ? '' : 'hidden'}`}>
                            <li className="order-2 pb-5 md:pb-0">
                                <LoginButton>
                                <span
                                   className="py-3 px-6 rounded-md shadow-md font-bold text-center bg-yellow-400 focus:shadow-none block md:inline">
                                    Sign In
                                </span>
                                </LoginButton>
                            </li>
                            <div
                                className="order-1 flex-1 justify-center items-center space-y-5 md:flex md:space-x-6 md:space-y-0">
                                {
                                    navigation.map((item, idx) => (
                                        <li className="text-gray-500 hover:text-fuchsia-600" key={idx}>
                                            <Link href={item.path}>{item.title}</Link>
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