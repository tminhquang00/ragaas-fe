import React, { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MinimalHeader, SideNavigation, ContextMenu, Button } from '@bosch/react-frok';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_HOVER_BREAKPOINT = '(min-width: 1194px)';
const SIDEBAR_CLOSE_DELAY_MS = 180;

interface NavItemDef {
    label: string;
    path: string;
    icon: string;
    value: string;
}

/** Strips parenthetical department suffix, e.g. "Alice Smith (SX/EIT-MM)" → "Alice Smith" */
const stripDepartment = (name?: string) =>
    name ? name.replace(/\s*\(.*\)\s*$/, '').trim() : '';

export const MainLayout: React.FC = () => {
    const { mode, toggleTheme } = useTheme();
    const { tenantId, user, logout, isAdmin } = useAuth();

    const navItems: NavItemDef[] = [
        { label: 'Dashboard', path: '/', icon: 'home', value: 'dashboard' },
        { label: 'Projects', path: '/projects', icon: 'folder', value: 'projects' },
        ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: 'security-user', value: 'admin' }] : []),
        { label: 'Settings', path: '/settings', icon: 'settings', value: 'settings' },
    ];
    const location = useLocation();
    const navigate = useNavigate();

    const [sideNavOpen, setSideNavOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Auto open the sidebar on hover/focus and auto close when the pointer
    // leaves it. Only active on desktop (>=1194px); mobile/tablet keep the
    // explicit burger toggle so touch users aren't trapped.
    useEffect(() => {
        const desktopMQ = window.matchMedia(SIDEBAR_HOVER_BREAKPOINT);
        let closeTimer: number | null = null;
        let attachedSidebar: HTMLElement | null = null;

        const cancelClose = () => {
            if (closeTimer !== null) {
                window.clearTimeout(closeTimer);
                closeTimer = null;
            }
        };

        const handleEnter = () => {
            if (!desktopMQ.matches) return;
            cancelClose();
            setSideNavOpen(true);
        };

        const handleLeave = () => {
            if (!desktopMQ.matches) return;
            cancelClose();
            closeTimer = window.setTimeout(() => {
                setSideNavOpen(false);
                closeTimer = null;
            }, SIDEBAR_CLOSE_DELAY_MS);
        };

        const detach = () => {
            if (attachedSidebar) {
                attachedSidebar.removeEventListener('mouseenter', handleEnter);
                attachedSidebar.removeEventListener('mouseleave', handleLeave);
                attachedSidebar.removeEventListener('focusin', handleEnter);
                attachedSidebar.removeEventListener('focusout', handleLeave);
                attachedSidebar = null;
            }
        };

        const attach = () => {
            const sidebar = document.querySelector<HTMLElement>('.m-side-navigation');
            if (!sidebar || sidebar === attachedSidebar) return;
            detach();
            attachedSidebar = sidebar;
            sidebar.addEventListener('mouseenter', handleEnter);
            sidebar.addEventListener('mouseleave', handleLeave);
            sidebar.addEventListener('focusin', handleEnter);
            sidebar.addEventListener('focusout', handleLeave);
        };

        attach();

        // FROK may re-mount the sidebar element when toggling open state, so
        // observe the DOM and re-bind listeners whenever a new instance appears.
        const observer = new MutationObserver(() => attach());
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            cancelClose();
            detach();
        };
    }, []);

    const currentPath = location.pathname;
    const currentNavItem = navItems.find(
        (item) => currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
    );
    const selectedNav = currentNavItem?.value ?? 'dashboard';
    const currentPageLabel = currentNavItem?.label ?? 'Dashboard';

    const displayName = stripDepartment(user?.name) || tenantId;
    const avatarInitial = (user?.name?.charAt(0) ?? 'U').toUpperCase();

    const handleNavClick = useCallback((path: string) => {
        navigate(path);
    }, [navigate]);

    const NavItem = SideNavigation.Item!;

    return (
        <div className={`app-layout-wrapper ${sideNavOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
            <MinimalHeader
                logo={{ href: '/' }}
                sideNavigation={
                    <SideNavigation
                        defaultSelectedItem={selectedNav}
                        onSelectedItemChange={(_ev, data) => {
                            const item = navItems.find(i => i.value === data.value);
                            if (item) handleNavClick(item.path);
                        }}
                        header={{ label: 'Babbage' }}
                    >
                        {navItems.map((item) => (
                            <NavItem
                                key={item.value}
                                value={item.value}
                                icon={item.icon as React.ComponentProps<typeof NavItem>['icon']}
                                label={item.label}
                            />
                        ))}
                    </SideNavigation>
                }
                burger={{
                    'aria-label': 'Toggle navigation',
                    onClick: () => setSideNavOpen(prev => !prev),
                }}
                open={sideNavOpen}
                onOpenChange={setSideNavOpen}
                actions={{
                    children: (
                        <>
                            <li>
                                <Button
                                    mode="integrated"
                                    icon={mode === 'dark' ? 'sun' : 'moon'}
                                    aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
                                    onClick={toggleTheme}
                                />
                            </li>
                            <li>
                                <ContextMenu
                                    open={userMenuOpen}
                                    onOpenChange={setUserMenuOpen}
                                    trigger={
                                        <button type="button" className="header-user-trigger" aria-label="User menu">
                                            <span className="header-user-avatar">{avatarInitial}</span>
                                            <span className="header-user-name">{displayName}</span>
                                        </button>
                                    }
                                    popover={{ position: 'bottom-right' }}
                                    ariaMenuLabel="User menu"
                                >
                                    <div className="user-menu-header">
                                        <div className="user-menu-avatar">
                                            {avatarInitial}
                                        </div>
                                        <div className="user-menu-info">
                                            <div className="user-menu-name">{user?.name || 'Demo User'}</div>
                                            <div className="user-menu-email">{user?.username || tenantId}</div>
                                        </div>
                                    </div>
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
                                </ContextMenu>
                            </li>
                        </>
                    ),
                }}
            >
                <span className="header-page-title">{currentPageLabel}</span>
            </MinimalHeader>

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