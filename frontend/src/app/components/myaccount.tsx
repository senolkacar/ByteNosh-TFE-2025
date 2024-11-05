import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { LogOutButton } from "@/components/auth/logout-button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { useRouter } from 'next/navigation';
import { useActiveSection } from "@/app/context/activesectioncontext";
import { usePathname } from 'next/navigation';
import DisplayUsername from "@/app/components/display-username";
import {useEffect, useState} from "react";
import User from "@/app/models/user";
import {useSession} from "next-auth/react";

export default function AccountMenu() {
    const router = useRouter();
    const { setActiveSection } = useActiveSection();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const pathname = usePathname();
    const [user, setUser] = useState<User>()
    const email = useSession().data?.user?.email;

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch(`/api/user/${email}`);
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        }
        fetchUser();
    }, []);

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

        if(pathname !== '/dashboard') {
            router.push('/dashboard');
        }
        setActiveSection("Profile");
        handleClose();
    };

    return (
        <React.Fragment>
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
                        <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                        <AvatarFallback>SD</AvatarFallback>
                    </Avatar> My account
                </MenuItem>
                <Divider />
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