'use client';
import MenuIcon from '@mui/icons-material/Menu';
import Link from "next/link";
import { LoginButton } from "@/components/auth/login-button";
import { useSession } from "next-auth/react";
import LoginIcon from '@mui/icons-material/Login';
import AccountMenu from "@/app/components/myaccount";

export default function Header() {
    const { data: session, status } = useSession();

    return (
        <div className="py-8 fixed bg-white w-full z-10 border-b">
            <header>
                <nav className="items-center pt-5 px-4 mx-auto max-w-screen-xl sm:px-8 md:flex md:justify-between md:space-x-6">
                    <div className="flex justify-between w-full md:w-auto">
                        <Link href="/">
                            <p className="text-fuchsia-600 font-bold text-2xl">ByteNosh</p>
                        </Link>
                        <div className="flex items-center md:hidden">
                            <button className="text-fuchsia-600 outline-none">
                                <MenuIcon />
                            </button>
                            <div className="ml-4">
                                {status !== 'loading' && session ? (
                                    <AccountMenu />
                                ) : status !== 'loading' && !session ? (
                                    <LoginButton>
                                        <span className="py-2 px-3 rounded-md font-bold text-center text-fuchsia-700 bg-white">
                                            <LoginIcon />
                                        </span>
                                    </LoginButton>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    {/* Other navigation items */}
                    <div className="hidden md:flex items-center">
                        {status !== 'loading' && session ? (
                            <AccountMenu />
                        ) : status !== 'loading' && !session ? (
                            <LoginButton>
                                <span className="py-3 px-4 rounded-md font-bold text-center text-fuchsia-700 bg-white">
                                    <LoginIcon /> Sign In
                                </span>
                            </LoginButton>
                        ) : null}
                    </div>
                </nav>
            </header>
        </div>
    );
}
