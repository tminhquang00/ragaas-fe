import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SideNavigation, Divider, Icon, Button, Popover } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';
import { alpha } from '../../utils/frokTheme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// SideNavigation.Item may be typed as potentially undefined in FROK + React 19
const SideNavItem = SideNavigation.Item!;

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED_WIDTH = 72;

interface NavItemDef {
    label: string;
    path: string;
    icon: string;
    badge?: number;
}

const navItems: NavItemDef[] = [
    { label: 'Dashboard', path: '/', icon: 'home' },
    { label: 'Projects', path: '/projects', icon: 'folder' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
];

function useMediaQueryCustom(query: string): boolean {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [query]);
    return matches;
}

export const MainLayout: React.FC = () => {
    const { mode, toggleTheme } = useTheme();
    const { tenantId, setTenantId, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMediaQueryCustom('(max-width: 899.95px)');

    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState(false);
    const [tempTenantId, setTempTenantId] = useState(tenantId);

    const backdropRef = useRef<HTMLDivElement>(null);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleNavClick = (path: string) => {
        navigate(path);
        if (isMobile) setMobileOpen(false);
    };

    const handleTenantSave = () => {
        setTenantId(tempTenantId);
        setEditingTenant(false);
    };

    const handleTenantKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTenantSave();
    }, [tempTenantId]); // eslint-disable-line react-hooks/exhaustive-deps

    const currentPath = location.pathname;
    const selectedNav = navItems.find(
        (item) => currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
    )?.path ?? '/';

    const sidebarWidth = sidebarCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

    // ── Sidebar content ──
    const sidebarContent = (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--app-sidebar-bg)' }}>
            {/* Logo */}
            <div
                style={{
                    padding: sidebarCollapsed ? '12px' : '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
            >
                <img
                    src={sidebarCollapsed ? '/bosch-icon.png' : '/bosch-logo.png'}
                    alt="Bosch"
                    style={{
                        height: 48,
                        width: sidebarCollapsed ? 48 : 'auto',
                        maxWidth: sidebarCollapsed ? 48 : 180,
                        objectFit: 'contain',
                        flexShrink: 0,
                        transition: 'all 0.2s ease-in-out',
                    }}
                />
                {!sidebarCollapsed && (
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.2 }}>
                            Bosch RAGaaS
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                            AI-Powered Knowledge
                        </div>
                    </div>
                )}
            </div>

            <Divider />

            {/* Navigation */}
            <div style={{ padding: '8px 4px', flex: 1 }}>
                <SideNavigation
                    contrast
                    defaultOpen
                    selectedItem={selectedNav}
                    onSelectedItemChange={(_ev, data) => handleNavClick(data.value as string)}
                >
                    {navItems.map((item) => (
                        <SideNavItem key={item.path} value={item.path}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icon iconName={item.icon} />
                                {!sidebarCollapsed && item.label}
                            </span>
                        </SideNavItem>
                    ))}
                </SideNavigation>
            </div>

            {/* Tenant ID Section */}
            {!sidebarCollapsed && (
                <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)', marginBottom: '8px' }}>
                        Tenant ID
                    </div>
                    {editingTenant ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                                type="text"
                                value={tempTenantId}
                                onChange={(e) => setTempTenantId(e.target.value)}
                                onKeyDown={handleTenantKeyDown}
                                autoFocus
                                style={{
                                    flex: 1,
                                    padding: '6px 8px',
                                    border: '1px solid var(--app-border)',
                                    background: 'var(--app-bg)',
                                    color: 'var(--app-text)',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                }}
                            />
                            <button
                                onClick={handleTenantSave}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--app-text)',
                                    padding: '4px',
                                }}
                                aria-label="Save tenant ID"
                            >
                                <FrokIcon name="Check" />
                            </button>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px',
                                background: alpha('var(--app-primary)', 0.1),
                            }}
                        >
                            <span style={{
                                flex: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {tenantId}
                            </span>
                            <button
                                onClick={() => setEditingTenant(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--app-text)',
                                    padding: '4px',
                                }}
                                aria-label="Edit tenant ID"
                            >
                                <FrokIcon name="Edit" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <Divider />

            {/* Theme Toggle */}
            <div style={{ padding: sidebarCollapsed ? '8px' : '16px' }}>
                <button
                    onClick={toggleTheme}
                    title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: sidebarCollapsed ? '8px' : '8px 16px',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--app-text)',
                        fontSize: '0.875rem',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = alpha('var(--app-primary)', 0.1); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                    <FrokIcon name={mode === 'dark' ? 'LightMode' : 'DarkMode'} />
                    {!sidebarCollapsed && (mode === 'dark' ? 'Light Mode' : 'Dark Mode')}
                </button>
            </div>

            {/* Collapse Toggle — Desktop only */}
            {!isMobile && (
                <>
                    <Divider />
                    <div style={{ padding: sidebarCollapsed ? '8px' : '16px' }}>
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: sidebarCollapsed ? '8px' : '8px 16px',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--app-text)',
                                fontSize: '0.875rem',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = alpha('var(--app-primary)', 0.1); }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                        >
                            <FrokIcon name={sidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} />
                            {!sidebarCollapsed && 'Collapse'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Bosch Supergraphic — signature multi-color brand bar */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    zIndex: 1300,
                    background:
                        'linear-gradient(to right, #E20015 0%, #E20015 12.5%, #B20058 12.5%, #B20058 25%, #005691 25%, #005691 37.5%, #008ECF 37.5%, #008ECF 50%, #00A8B0 50%, #00A8B0 62.5%, #78BE20 62.5%, #78BE20 75%, #B2D235 75%, #B2D235 87.5%, #FFC000 87.5%, #FFC000 100%)',
                }}
            />

            {/* App Bar */}
            <header
                style={{
                    position: 'fixed',
                    top: '4px',
                    right: 0,
                    left: isMobile ? 0 : sidebarWidth,
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    background: 'var(--app-bg)',
                    borderBottom: '1px solid var(--app-border)',
                    zIndex: 1200,
                    transition: 'left 0.2s ease-in-out',
                }}
            >
                {/* Mobile hamburger */}
                {isMobile && (
                    <button
                        onClick={handleDrawerToggle}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            marginRight: '16px',
                            color: 'var(--app-text)',
                            padding: '8px',
                        }}
                        aria-label="Open navigation"
                    >
                        <FrokIcon name="Menu" />
                    </button>
                )}

                <div style={{ flex: 1 }} />

                {/* Theme Toggle (header) */}
                <Button
                    mode="integrated"
                    icon={mode === 'dark' ? 'sun' : 'moon'}
                    onClick={toggleTheme}
                    aria-label={mode === 'dark' ? 'Light mode' : 'Dark mode'}
                    style={{ marginRight: '8px' }}
                />

                {/* User Menu */}
                <Popover
                    open={userMenuOpen}
                    trigger={
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            style={{
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--app-primary)',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                            }}
                            aria-label="Account"
                        >
                            {user?.name?.charAt(0) || <FrokIcon name="Person" />}
                        </button>
                    }
                    position="bottom-right"
                    isPopoverArrowMissing
                    onOutsideClick={() => setUserMenuOpen(false)}
                    onCloseKeyPressed={() => setUserMenuOpen(false)}
                >
                    <div style={{ minWidth: 200, padding: '8px 0' }}>
                        <div style={{ padding: '8px 16px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                {user?.name || 'Demo User'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--app-text-secondary)' }}>
                                {user?.username || tenantId}
                            </div>
                        </div>
                        <Divider />
                        <button
                            onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '8px 16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--app-text)',
                                fontSize: '0.875rem',
                            }}
                        >
                            <Icon iconName="settings" />
                            Settings
                        </button>
                        <button
                            onClick={() => { setUserMenuOpen(false); logout(); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '8px 16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--app-text)',
                                fontSize: '0.875rem',
                            }}
                        >
                            <Icon iconName="log-out" />
                            Logout
                        </button>
                    </div>
                </Popover>
            </header>

            {/* Sidebar */}
            <nav
                style={{
                    width: isMobile ? 0 : sidebarWidth,
                    flexShrink: 0,
                    transition: 'width 0.2s ease-in-out',
                }}
            >
                {/* Mobile overlay */}
                {isMobile && mobileOpen && (
                    <div
                        ref={backdropRef}
                        onClick={handleDrawerToggle}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 1250,
                        }}
                    />
                )}

                {/* Mobile drawer */}
                {isMobile && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: mobileOpen ? 0 : -DRAWER_WIDTH,
                            width: DRAWER_WIDTH,
                            height: '100%',
                            zIndex: 1260,
                            transition: 'left 0.3s ease-in-out',
                            overflow: 'hidden',
                        }}
                    >
                        {sidebarContent}
                    </div>
                )}

                {/* Desktop sidebar */}
                {!isMobile && (
                    <div
                        style={{
                            position: 'fixed',
                            top: '4px',
                            left: 0,
                            width: sidebarWidth,
                            height: 'calc(100% - 4px)',
                            overflowX: 'hidden',
                            overflowY: 'auto',
                            borderRight: '1px solid var(--app-border)',
                            transition: 'width 0.2s ease-in-out',
                        }}
                    >
                        {sidebarContent}
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main
                style={{
                    flexGrow: 1,
                    padding: '24px',
                    width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
                    marginTop: '68px',
                    minHeight: 'calc(100vh - 68px)',
                    transition: 'width 0.2s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ flex: 1 }}>
                    <Outlet />
                </div>

                {/* Footer */}
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
