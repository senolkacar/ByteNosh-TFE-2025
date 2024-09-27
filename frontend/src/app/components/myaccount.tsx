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

export default function AccountMenu() {
    const router = useRouter();
    const { setActiveSection } = useActiveSection();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const pathname = usePathname();

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
        setActiveSection("Settings");
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
                        <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                        <AvatarFallback>SD</AvatarFallback>
                    </Avatar>
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
                    <Avatar className="hidden h-9 w-9 sm:flex">
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