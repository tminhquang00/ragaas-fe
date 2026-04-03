import React, { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MinimalHeader, SideNavigation, Icon, ContextMenu } from '@bosch/react-frok';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavItemDef {
    label: string;
    path: string;
    icon: string;
    value: string;
}

const navItems: NavItemDef[] = [
    { label: 'Dashboard', path: '/', icon: 'home', value: 'dashboard' },
    { label: 'Projects', path: '/projects', icon: 'folder', value: 'projects' },
    { label: 'Settings', path: '/settings', icon: 'settings', value: 'settings' },
];

export const MainLayout: React.FC = () => {
    const { mode, toggleTheme } = useTheme();
    const { tenantId, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [sideNavOpen, setSideNavOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const currentPath = location.pathname;
    const selectedNav = navItems.find(
        (item) => currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
    )?.value ?? 'dashboard';

    const handleNavClick = useCallback((path: string) => {
        navigate(path);
    }, [navigate]);

    const NavBody = SideNavigation.Body;
    const NavItem = SideNavigation.Item;

    return (
        <div className={`app-layout-wrapper ${sideNavOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
            <MinimalHeader
                logo={{ href: '/' }}
                sideNavigation={
                    <SideNavigation
                        open={sideNavOpen}
                        onOpenChange={setSideNavOpen}
                        defaultSelectedItem={selectedNav}
                        onSelectedItemChange={(_ev, data) => {
                            const item = navItems.find(i => i.value === data.value);
                            if (item) handleNavClick(item.path);
                        }}
                        header={{ title: 'Ragaas' }}
                    >
                        {NavBody && NavItem && (
                            <NavBody>
                                {navItems.map((item) => (
                                    <NavItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        <Icon iconName={item.icon} />
                                        <span className="nav-item-text">{item.label}</span>
                                    </NavItem>
                                ))}
                            </NavBody>
                        )}
                    </SideNavigation>
                }
                burger={{ 'aria-label': 'Toggle navigation' }}
                open={sideNavOpen}
                onOpenChange={setSideNavOpen}
                actions={{
                    children: (
                        <div className="header-actions-list">
                            <div className="header-action-item">
                                <button
                                    type="button"
                                    className="header-theme-button"
                                    onClick={toggleTheme}
                                    aria-label="Toggle theme"
                                >
                                    <Icon iconName={mode === 'dark' ? 'sun' : 'moon'} />
                                </button>
                            </div>
                            <div className="header-action-item">
                                <ContextMenu
                                    open={userMenuOpen}
                                    onOpenChange={setUserMenuOpen}
                                    trigger={
                                        <button type="button" className="header-avatar-button" aria-label="User menu">
                                            {user?.name?.charAt(0) || 'U'}
                                        </button>
                                    }
                                    popover={{ position: 'bottom-right' }}
                                    ariaMenuLabel="User menu"
                                >
                                    <ContextMenu.Group>
                                        <div className="header-user-info">
                                            <div className="header-user-name">{user?.name || 'Demo User'}</div>
                                            <div className="header-user-email">{user?.username || tenantId}</div>
                                        </div>
                                    </ContextMenu.Group>
                                    <ContextMenu.Group>
                                        <ContextMenu.Item
                                            label="Settings"
                                            icon="settings"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate('/settings');
                                            }}
                                        />
                                        <ContextMenu.Item
                                            label="Logout"
                                            icon="logout"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                logout();
                                            }}
                                        />
                                    </ContextMenu.Group>
                                </ContextMenu>
                            </div>
                        </div>
                    ),
                }}
            >
                <div className="header-title-section">
                    <span className="header-app-name">Bosch RAGaaS</span>
                    <span className="header-app-subtitle">AI-Powered Knowledge</span>
                </div>
            </MinimalHeader>

            {/* Main Content */}
            <main className={`app-main-content ${sideNavOpen ? 'sidebar-open' : ''}`}>
                <div className="app-content-wrapper">
                    <Outlet />
                </div>

                <footer className="app-footer">
                    © 2026 Bosch Global Software Vietnam - SX Department. All rights reserved.
                </footer>
            </main>
        </div>
    );
};