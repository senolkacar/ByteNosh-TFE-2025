import Link from "next/link";

export default function Sidebar() {
    const navigation = [
        { name: 'Soup', href: '#', icon: '🍲' },
        { name: 'Starter', href: '#', icon: '🥗' },
        { name: 'Hot Dishes', href: '#', icon: '🔥' },
        // Add other navigation items here
    ];
    return (
        <div className="mt-8">
            <Link href="/" className="text-xl font-bold mb-4">
                My Restaurant POS
            </Link>
            <ul className="space-y-2">
                <li>
                    <Link href="/dashboard" className="hover:text-gray-300">
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link href="/orders" className="hover:text-gray-300">
                        Orders
                    </Link>
                </li>
                <li>
                    <Link href="/inventory" className="hover:text-gray-300">
                        Inventory
                    </Link>
                </li>
                <li>
                    <Link href="/customers" className="hover:text-gray-300">
                        Customers
                    </Link>
                </li>
                <li>
                    <Link href="/settings" className="hover:text-gray-300">
                        Settings
                    </Link>
                </li>
            </ul>
        </div>
);
}