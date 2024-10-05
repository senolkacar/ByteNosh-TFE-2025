'use client';
import MenuIcon from '@mui/icons-material/Menu';
import Link from "next/link";
import { LoginButton } from "@/components/auth/login-button";
import { useSession } from "next-auth/react";
import LoginIcon from '@mui/icons-material/Login';
import AccountMenu from "@/app/components/myaccount";
import {useState} from "react";

export default function Header() {
    const { data: session, status } = useSession();
    const [state, setState] = useState(false);
    const navigation = [
        { title: "Home", path: "/" },
        { title: "Menu", path: "/menu" },
        { title: "Blog", path: "" },
        { title: "Contact Us", path: "/contactus" },
        { title: "About Us", path: "/aboutus" }];

    return (
        <div className="py-8 fixed bg-white w-full z-10 border-b">
            <header>
                <nav
                    className="items-center pt-5 px-4 mx-auto max-w-screen-xl sm:px-8 md:flex md:justify-between md:space-x-6">
                    <div className="flex justify-between w-full md:w-auto">
                        <Link href="/">
                            <p className="text-fuchsia-600 font-bold text-2xl">ByteNosh</p>
                        </Link>
                        <div className="flex items-center md:hidden">
                            <button className="text-fuchsia-600 outline-none"
                                    onClick={() => setState(!state)}>
                                <MenuIcon/>
                            </button>
                            <div className="ml-4">
                                {status !== 'loading' && session ? (
                                    <AccountMenu/>
                                ) : status !== 'loading' && !session ? (
                                    <LoginButton>
                                        <span
                                            className="py-2 px-3 rounded-md font-bold text-center text-fuchsia-700 bg-white">
                                            <LoginIcon/>
                                        </span>
                                    </LoginButton>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <ul className={`flex-1 mt-12 md:flex md:mt-0 ${state ? '' : 'hidden'}`}>
                        <div className="flex-1 justify-center items-center space-y-5 md:flex md:space-x-6 md:space-y-0">
                            {navigation.map((item, idx) => (
                                <li className="text-gray-500 hover:text-fuchsia-600" key={idx}>
                                    <Link href={item.path}>{item.title}</Link>
                                </li>
                            ))}
                        </div>
                    </ul>
                    <div className="hidden md:flex items-center">
                        {status !== 'loading' && session ? (
                            <AccountMenu/>
                        ) : status !== 'loading' && !session ? (
                            <LoginButton>
                                <span className="py-3 px-4 rounded-md font-bold text-center text-fuchsia-700 bg-white">
                                    <LoginIcon/> Sign In
                                </span>
                            </LoginButton>
                        ) : null}
                    </div>
                </nav>
            </header>
        </div>
    );
}