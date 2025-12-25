import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    IconButton,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Tooltip,
    useMediaQuery,
    useTheme as useMuiTheme,
    alpha,
    Badge,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Folder as FolderIcon,
    Settings as SettingsIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Brightness4 as ThemeIcon,
    AutoAwesome as LogoIcon,
    Edit as EditIcon,
    Check as CheckIcon,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 280;

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: number;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Projects', path: '/projects', icon: <FolderIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export const MainLayout: React.FC = () => {
    const muiTheme = useMuiTheme();
    const { mode, toggleTheme } = useTheme();
    const { tenantId, setTenantId, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editingTenant, setEditingTenant] = useState(false);
    const [tempTenantId, setTempTenantId] = useState(tenantId);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavClick = (path: string) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleTenantSave = () => {
        setTenantId(tempTenantId);
        setEditingTenant(false);
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 25px ${alpha(muiTheme.palette.primary.main, 0.4)}`,
                    }}
                >
                    <LogoIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        RAGaaS
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        AI-Powered Knowledge
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ mx: 2, opacity: 0.5 }} />

            {/* Navigation */}
            <List sx={{ px: 1, py: 2, flex: 1 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <ListItemButton
                            key={item.path}
                            onClick={() => handleNavClick(item.path)}
                            selected={isActive}
                            sx={{
                                mb: 0.5,
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.15)} 0%, ${alpha(muiTheme.palette.secondary.main, 0.1)} 100%)`,
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive ? muiTheme.palette.primary.main : 'inherit',
                                    minWidth: 40,
                                }}
                            >
                                {item.badge ? (
                                    <Badge badgeContent={item.badge} color="secondary">
                                        {item.icon}
                                    </Badge>
                                ) : (
                                    item.icon
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontWeight: isActive ? 600 : 400,
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Tenant ID Section */}
            <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Tenant ID
                </Typography>
                {editingTenant ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            size="small"
                            fullWidth
                            value={tempTenantId}
                            onChange={(e) => setTempTenantId(e.target.value)}
                            autoFocus
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleTenantSave}>
                                            <CheckIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            background: alpha(muiTheme.palette.primary.main, 0.1),
                        }}
                    >
                        <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace' }} noWrap>
                            {tenantId}
                        </Typography>
                        <IconButton size="small" onClick={() => setEditingTenant(true)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Divider sx={{ mx: 2, opacity: 0.5 }} />

            {/* Theme Toggle */}
            <Box sx={{ p: 2 }}>
                <ListItemButton
                    onClick={toggleTheme}
                    sx={{ borderRadius: 2 }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </ListItemIcon>
                    <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flex: 1 }} />

                    {/* Theme Toggle (Desktop) */}
                    <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                        <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
                            <ThemeIcon />
                        </IconButton>
                    </Tooltip>

                    {/* User Menu */}
                    <Tooltip title="Account">
                        <IconButton onClick={handleMenuOpen}>
                            <Avatar sx={{ width: 36, height: 36 }}>
                                {user?.name?.charAt(0) || <PersonIcon />}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: { minWidth: 200, mt: 1 },
                        }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                {user?.name || 'Demo User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.username || tenantId}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: 8,
                    minHeight: 'calc(100vh - 64px)',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};
