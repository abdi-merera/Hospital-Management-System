import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import ReceiptIcon from '@mui/icons-material/Receipt';
import GroupIcon from '@mui/icons-material/Group';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { NavLink, useLocation } from 'react-router-dom';
import React, { useContext } from 'react';
import { UserContext } from '../../../Context/UserContext';

const drawerWidth = 240;
const activeGreen = '#1b4f32';

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('xs')]: {
        width: 0,
    },
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const navigationItems = [
    { label: 'Dashboard', to: '/', match: '', icon: DashboardOutlinedIcon },
    { label: 'Appointments', to: '/appointments', match: 'appointments', icon: CalendarTodayOutlinedIcon },
    { label: 'Encounters', to: '/encounters', match: 'encounters', icon: AssignmentIcon, permissions: ['view_encounter'], userTypes: ['Admin', 'Staff'] },
    { label: 'Prescriptions', to: '/prescriptions', match: 'prescriptions', icon: ReceiptIcon, userTypes: ['Admin', 'Staff', 'Patient'], roles: ['Doctor', 'Patient'] },
    { label: 'Medical History', to: '/medical-history', match: 'medical-history', icon: AccessibleForwardIcon, userTypes: ['Patient'] },
    { label: 'Medicines', to: '/medicines', match: 'medicines', icon: VaccinesIcon, userTypes: ['Admin', 'Staff'], roles: ['Doctor', 'Pharmacist'] },
];

const adminItems = [
    { label: 'Users', to: '/users', match: 'users', icon: GroupIcon, permissions: ['manage_users'] },
    { label: 'Patients', to: '/patients', match: 'patients', icon: AccessibleForwardIcon, permissions: ['view_patient'], userTypes: ['Admin', 'Staff'] },
    { label: 'Doctors', to: '/doctors', match: 'doctors', icon: LocalHospitalIcon, permissions: ['manage_users'] },
    { label: 'Wards', to: '/wards', match: 'wards', icon: LocalHospitalIcon, permissions: ['manage_wards', 'manage_beds'] },
    { label: 'Billing', to: '/billing', match: 'billing', icon: ReceiptIcon, permissions: ['view_invoice'] },
    { label: 'Audit Logs', to: '/audit-logs', match: 'audit-logs', icon: HistoryIcon, permissions: ['view_audit_logs'] },
    { label: 'Roles', to: '/roles-permissions', match: 'roles-permissions', icon: AdminPanelSettingsIcon, permissions: ['manage_roles'] },
    { label: 'Reports', to: '/reports', match: 'reports', icon: AssessmentIcon, permissions: ['view_reports'] },
];

function hasAccess(item, currentUser) {
    const userType = currentUser?.userType;
    const permissions = currentUser?.permissions || [];
    const roles = (currentUser?.roles || []).map((role) => (typeof role === 'string' ? role : role.name));

    if (userType === 'Admin') return true;
    if (item.userTypes && !item.userTypes.includes(userType)) return false;
    if (item.roles && !item.roles.some((role) => roles.includes(role))) return false;
    if (item.permissions) return item.permissions.some((permission) => permissions.includes(permission));

    return true;
}

function SidebarItem({ item, open, selectedItem }) {
    const Icon = item.icon;
    const selected = item.match ? selectedItem === item.match : !selectedItem;

    return (
        <ListItem key={item.label} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
                component={NavLink}
                to={item.to}
                style={{ textDecoration: 'none', color: 'white' }}
                selected={selected}
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    '&.Mui-selected': {
                        backgroundColor: activeGreen,
                    },
                    '&.Mui-selected:hover': {
                        backgroundColor: activeGreen,
                    },
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: '#fff',
                    }}
                >
                    <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
        </ListItem>
    );
}

export default function Sidebar({ open, handleDrawerClose, handleDrawerOpen }) {
    const selectedItem = useLocation().pathname.split('/')[1];
    const { currentUser, signOutUser } = useContext(UserContext);
    const visibleNavigationItems = navigationItems.filter((item) => hasAccess(item, currentUser));
    const visibleAdminItems = adminItems.filter((item) => hasAccess(item, currentUser));

    function handleMouseLeavesDrawer() {
        handleDrawerClose();
    }

    return (
        <Drawer
            className="!text-[1.3em]"
            variant="permanent"
            open={open}
            onMouseEnter={handleDrawerOpen}
            onMouseLeave={handleMouseLeavesDrawer}
            PaperProps={{ sx: { backgroundColor: '#31b372', color: 'white' } }}
        >
            <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                    <MenuIcon style={{ color: '#fff' }} />
                </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
                {visibleNavigationItems.map((item) => (
                    <SidebarItem key={item.label} item={item} open={open} selectedItem={selectedItem} />
                ))}
                {visibleAdminItems.length > 0 && <Divider />}
                {visibleAdminItems.map((item) => (
                    <SidebarItem key={item.label} item={item} open={open} selectedItem={selectedItem} />
                ))}
            </List>
            <Divider />
            <List>
                <SidebarItem item={{ label: 'Profile', to: '/profile', match: 'profile', icon: AccountBoxIcon }} open={open} selectedItem={selectedItem} />
            </List>
            <Divider />
            <List>
                <ListItem key="Logout" disablePadding sx={{ display: 'block' }} onClick={signOutUser}>
                    <ListItemButton
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 3 : 'auto',
                                justifyContent: 'center',
                            }}
                        >
                            <LogoutOutlinedIcon style={{ color: '#fff' }} />
                        </ListItemIcon>
                        <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
}
