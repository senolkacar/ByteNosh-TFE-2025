import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import KeyIcon from '@mui/icons-material/Key';
import { LogOutButton } from "@/components/auth/logout-button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import { useActiveSection } from "@/app/context/activesectioncontext";
import { usePathname } from 'next/navigation';
import DisplayUsername from "@/app/components/home/display-username";
import { useEffect, useState } from "react";
import User from "@/app/models/user";
import { useSession } from "next-auth/react";
import Badge from '@mui/material/Badge';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import db from "@/lib/firebase";

export default function AccountMenu() {
    const router = useRouter();
    const { setActiveSection } = useActiveSection();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const pathname = usePathname();
    const [user, setUser] = useState<User>();
    const email = useSession().data?.user?.email;
    const [unreadReservations, setUnreadReservations] = useState(0);
    const [permissionGranted, setPermissionGranted] = useState(localStorage.getItem("permissionGranted") === "true");
    const notificationSound = React.useMemo(() => new Audio('http://localhost:5000/sounds/notification.mp3'), []);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch(`/api/users/${email}`);
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        }
        fetchUser();
    }, [email]);

    useEffect(() => {
        if (permissionGranted) {
            const q = query(collection(db, "reservations"), where("isRead", "==", false));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newUnreadCount = snapshot.size;

                // Play sound only if there are new unread reservations
                if (newUnreadCount > unreadReservations) {
                    notificationSound.play().catch((error) => {
                        console.error('Audio playback failed:', error);
                    });
                }

                setUnreadReservations(newUnreadCount);
            });

            return () => unsubscribe();
        }
    }, [permissionGranted, unreadReservations, notificationSound]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMyAccountClick = () => {
        router.push('/dashboard');
        setActiveSection("Dashboard");
        handleClose();
    };

    const handleSettingsClick = () => {
        if (pathname !== '/dashboard') {
            router.push('/dashboard');
        }
        setActiveSection("Profile");
        handleClose();
    };

    const handleAdminPanelClick = () => {
        router.push('/panel');
        setActiveSection("Admin Panel");
        handleClose();
    };

    const handlePermission = () => {
        notificationSound.play().then(() => {
            setPermissionGranted(true);
            localStorage.setItem("permissionGranted", "true");
        }).catch((error) => {
            console.error('Audio playback failed:', error);
        });
    };

    return (
        <React.Fragment>
            {user?.role === 'ADMIN' && (
                <>
                    {!permissionGranted && (
                        <button onClick={handlePermission} className="text-sm mb-2 text-blue-500 underline">
                            Enable Notifications
                        </button>
                    )}
                    <Tooltip title="Notifications">
                        <IconButton onClick={() => router.push('/panel')} size="small">
                            <Badge badgeContent={unreadReservations} color="error" overlap="circular">
                                <NotificationsActiveIcon className="hover:cursor-pointer scale-150 hover:bg-gray-200 rounded-full" />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </>
            )}
            <Tooltip title="Account settings">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`http://localhost:5000/images/${user?.avatar}`} alt="Avatar" />
                        <AvatarFallback>{user ? `${user.fullName.split(' ').pop()?.charAt(0)}${user.fullName.split(' ')[0].charAt(0)}` : ''}</AvatarFallback>
                    </Avatar>
                    <DisplayUsername/>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
            >
                <MenuItem onClick={handleMyAccountClick}>
                    <Avatar className="hidden h-9 w-9 mr-2 sm:flex">
                        <AvatarImage src={`http://localhost:5000/images/${user?.avatar}`} alt="Avatar" />
                        <AvatarFallback>{user ? `${user.fullName.split(' ').pop()?.charAt(0)}${user.fullName.split(' ')[0].charAt(0)}` : ''}</AvatarFallback>
                    </Avatar> My account
                </MenuItem>
                <Divider />
                {user?.role === 'ADMIN' && (
                    <MenuItem onClick={handleAdminPanelClick}>
                        <ListItemIcon>
                            <KeyIcon/>
                        </ListItemIcon>
                        Admin Panel
                    </MenuItem>
                )}
                <MenuItem onClick={handleSettingsClick}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <LogOutButton>
                    <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </LogOutButton>
            </Menu>
        </React.Fragment>
    );
}
