import React, { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MinimalHeader, SideNavigation, Icon } from '@bosch/react-frok';
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

    // Close user menu when clicking outside
    const handleUserClick = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    const handleMenuAction = (action: () => void) => {
        setUserMenuOpen(false);
        action();
    };

    return (
        <div className={`app-layout-wrapper ${sideNavOpen ? 'sidebar-open' : 'sidebar-collapsed'}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <style>{`
                @media (min-width: 1024px) {
                    .app-layout-wrapper.sidebar-collapsed .m-minimal-header__main,
                    .app-layout-wrapper.sidebar-collapsed header > div:first-child {
                        margin-left: 3rem !important;
                        width: calc(100% - 3rem) !important;
                    }
                    .app-layout-wrapper.sidebar-open .m-minimal-header__main,
                    .app-layout-wrapper.sidebar-open header > div:first-child {
                        margin-left: 16rem !important;
                        width: calc(100% - 16rem) !important;
                    }
                }
            `}</style>
            <MinimalHeader
                logo={{ href: '/', alt: 'Bosch Logo', variant: 'small' }}
                sideNavigation={
                    <SideNavigation
                        open={sideNavOpen}
                        onOpenChange={setSideNavOpen}
                        defaultSelectedItem={selectedNav}
                        onSelectedItemChange={(ev, data) => {
                            const item = navItems.find(i => i.value === data.value);
                            if (item) handleNavClick(item.path);
                        }}
                        header={{ title: 'Ragaas' }}
                    >
                        <SideNavigation.Body>
                            {navItems.map((item) => (
                                <SideNavigation.Item 
                                    key={item.value} 
                                    value={item.value}
                                >
                                    <Icon iconName={item.icon} />
                                    <span className="nav-item-text">{item.label}</span>
                                </SideNavigation.Item>
                            ))}
                        </SideNavigation.Body>
                    </SideNavigation>
                }
                burger={{ 'aria-label': 'Toggle navigation' }}
                open={sideNavOpen}
                onOpenChange={setSideNavOpen}
                actions={[
                    {
                        label: 'Theme',
                        icon: mode === 'dark' ? 'sun' : 'moon',
                        onClick: toggleTheme,
                        showLabel: false,
                    },
                    {
                        label: 'User',
                        showLabel: false,
                        children: (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={handleUserClick}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '32px',
                                        height: '32px',
                                        background: '#005691',
                                        border: 'none',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    {user?.name?.charAt(0) || 'U'}
                                </button>

                                {userMenuOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '8px',
                                        background: 'var(--app-bg)',
                                        border: '1px solid var(--app-border)',
                                        borderRadius: '4px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        minWidth: '160px',
                                        zIndex: 1000,
                                    }}>
                                        <div style={{
                                            padding: '12px',
                                            borderBottom: '1px solid var(--app-border)',
                                        }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--app-text)' }}>
                                                {user?.name || 'Demo User'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                                                {user?.username || tenantId}
                                            </div>
                                        </div>
                                        <div style={{ padding: '4px' }}>
                                            <button
                                                className="app-user-menu-item"
                                                onClick={() => handleMenuAction(() => navigate('/settings'))}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: 'none',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem',
                                                    color: 'var(--app-text)',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <Icon iconName="settings" />
                                                Settings
                                            </button>
                                            <button
                                                className="app-user-menu-item"
                                                onClick={() => handleMenuAction(logout)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: 'none',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem',
                                                    color: 'var(--app-text)',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <Icon iconName="log-out" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ),
                        onClick: () => {},
                    },
                ]}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700 }}>Ragaas</span>
                    <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '4px',
                        fontFamily: 'monospace'
                    }}>
                        {tenantId}
                    </span>
                </div>
            </MinimalHeader>

            {/* Main Content */}
            <main
                className={`app-main-content ${sideNavOpen ? 'sidebar-open' : ''}`}
            >
                <div style={{ flex: 1 }}>
                    <Outlet />
                </div>

                <footer
                    style={{
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        marginTop: '32px',
                        borderTop: '1px solid var(--app-border)',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: 'var(--app-text-secondary)',
                    }}
                >
                    © 2026 Bosch Global Software Vietnam - SX Department. All rights reserved.
                </footer>
            </main>
        </div>
    );
};