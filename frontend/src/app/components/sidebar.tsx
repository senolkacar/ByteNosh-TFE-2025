'use client';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BackHandIcon from '@mui/icons-material/BackHand';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import SettingsIcon from '@mui/icons-material/Settings';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from "next/link";
import {usePathname, useSelectedLayoutSegment} from "next/navigation";

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const Sidebar = () => {
    const path = useSelectedLayoutSegment();
    const pathName = usePathname();
    let sidebarOptions = [];
    if(pathName === '/pos'){
        sidebarOptions = [
            {name: 'Orders', href: '/pos/orders', icon: BackHandIcon},
            {name: 'Menu', href: '/pos/menu', icon: FastfoodIcon},
            {name: 'Tables', href: '/pos/tables', icon: TableRestaurantIcon},
            {name: 'Reports', href: '/pos/reports', icon: EqualizerIcon},
            {name: 'Settings', href: '/pos/settings', icon: SettingsIcon},];
    }else{
        sidebarOptions = [
            {name: 'Dashboard', href: '/tablet/dashboard', icon: HomeIcon},
            {name: 'Menu', href: '/tablet/menu', icon: FastfoodIcon},];
    }


    return (
            <div className="fixed inset-y-0 flex w-72 flex-col">
                <div className="flex flex-col w-64 h-full bg-gray-800 text-white">
                    <div className="flex items-center justify-center shrink-0 h-16 bg-gray-800">
                        <Link href="/">
                            <p className="text-2xl font-bold text-fuchsia-600">ByteNosh</p>
                        </Link>
                    </div>
                    <nav className="flex flex-1 flex-col px-3">
                        {sidebarOptions.map((option, idx) => (
                            <Link href={option.href} key={idx}>
                            <span
                                className={classNames(
                                    option.href === path
                                        ? 'bg-fuchsia-700 text-white'
                                        : 'text-gray-300 hover:bg-fuchsia-700 hover:text-white hover:px-3',
                                    'group flex gap-x-3 p-2 py-6 my-1 text-sm rounded-lg leading-6 font-semibold'
                                )}
                            >
                                <option.icon className="w-6 h-6" aria-hidden="true"/>
                                <span className="ml-2">{option.name}</span>
                            </span>
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto flex items-center px-3">
                        <AccountCircleIcon className="w-8 h-8 text-gray-400" aria-hidden="true"/>
                        <span className="ml-3 text-sm font-medium text-gray-300">User Name</span>
                    </div>
                    <div className="mt-auto flex items-center p-3">
                        <LogoutIcon className="w-8 h-8 text-gray-400" aria-hidden="true"/>
                        <span className="ml-3 text-sm font-medium text-gray-300">Log out</span>
                    </div>
                </div>
            </div>
    )
}
export default Sidebar;