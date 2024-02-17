import Link from "next/link";
import {Avatar} from "@mui/material";

export default function Header() {
    return (
        <>
        <header className="flex items-center m-4 justify-between">
            <Link className="text-fuchsia-600 font-semibold text-2xl" href="">
                ByteNosh
            </Link>
            <nav className="flex items-center gap-4 text-gray-500 font-semibold">
                <Link href="/menu">Menu</Link>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                <Link href={"/login"} className="bg-fuchsia-600 text-white px-6 py-2 rounded-full">Login</Link>
                {/*visible only when logged in:
                TODO: implement dropdown menu for user settings,profile and logout
                maybe add a notification icon next to it ?*/}
                <Avatar></Avatar>
            </nav>
        </header>
        </>
    )
}