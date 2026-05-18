import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@bosch/react-frok';
import { ThemeProvider } from '../context';
import { useTheme } from '../context/ThemeContext';
import { WidgetAuthProvider } from './WidgetAuthProvider';
import { WidgetChatContainer } from './WidgetChatContainer';
import './widget.css';

interface WidgetAppProps {
  /** Overrides the `projectId` URL query param (used by the in-app preview route). */
  projectId?: string;
  /** Overrides the `tenant` URL query param (used by the in-app preview route). */
  tenantId?: string;
  /** Overrides the `title` URL query param. */
  title?: string;
  /** Overrides the `primaryColor` URL query param. */
  primaryColor?: string;
  /** Overrides the `theme` URL query param (`dark` | `light`). */
  theme?: 'dark' | 'light';
  /** Shows the Bosch team attribution tag below the chat. */
  showTeamTag?: boolean;
}

interface WidgetParams {
  projectId: string | null;
  tenantId: string | null;
  title: string | null;
  primaryColor: string | null;
  theme: 'dark' | 'light' | null;
  welcomeMessage: string | null;
  showTeamTag: boolean | null;
}

const parseUrlParams = (): WidgetParams => {
  if (typeof window === 'undefined') {
    return {
      projectId: null,
      tenantId: null,
      title: null,
      primaryColor: null,
      theme: null,
      welcomeMessage: null,
      showTeamTag: null,
    };
  }
  const sp = new URLSearchParams(window.location.search);
  const rawTheme = sp.get('theme');
  const rawShowTeamTag = sp.get('showTeamTag') || sp.get('show_team_tag');
  return {
    projectId: sp.get('projectId') || sp.get('project_id'),
    tenantId: sp.get('tenant') || sp.get('tenantId') || sp.get('tenant_id'),
    title: sp.get('title'),
    primaryColor: sp.get('primaryColor') || sp.get('primary_color'),
    theme: rawTheme === 'dark' || rawTheme === 'light' ? rawTheme : null,
    welcomeMessage: sp.get('welcomeMessage') || sp.get('welcome_message'),
    showTeamTag:
      rawShowTeamTag === null
        ? null
        : !['false', '0', 'off', 'no'].includes(rawShowTeamTag.toLowerCase()),
  };
};

/** Applies the chosen theme mode to the underlying `useFrokTheme` hook. */
const ThemeSync: React.FC<{ mode: 'dark' | 'light' | null }> = ({ mode }) => {
  const { setMode } = useTheme();
  useEffect(() => {
    if (mode) setMode(mode);
  }, [mode, setMode]);
  return null;
};

/**
 * Entry-level widget shell. Works in two contexts:
 *  1. Stand-alone static bundle (`widget.html`) — reads everything from the URL.
 *  2. In-app preview route (`/widget/:projectId`) — receives overrides via props.
 */
export const WidgetApp: React.FC<WidgetAppProps> = (props) => {
  const urlParams = useMemo(() => parseUrlParams(), []);
  const [isExpanded, setIsExpanded] = useState(false);

  const projectId = props.projectId ?? urlParams.projectId ?? '';
  const tenantId =
    props.tenantId ?? urlParams.tenantId ?? import.meta.env.VITE_DEFAULT_TENANT_ID ?? 'demo-tenant';
  const title = props.title ?? urlParams.title ?? 'AI Assistant';
  const primaryColor = props.primaryColor ?? urlParams.primaryColor ?? '';
  const theme = props.theme ?? urlParams.theme ?? null;
  const showTeamTag = props.showTeamTag ?? urlParams.showTeamTag ?? true;

  const handleCloseWidget = () => {
    if (typeof window === 'undefined') return;
    window.parent?.postMessage({ type: 'ragaas-widget:close' }, '*');
  };

  const handleResizeWidget = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    if (typeof window === 'undefined') return;
    window.parent?.postMessage({ type: 'ragaas-widget:resize', expanded: nextExpanded }, '*');
  };

  // Derived inline style overrides for host-customised primary color.
  const colorStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!primaryColor) return undefined;
    return {
      // Custom widget variable used by widget.css
      ['--widget-primary-color' as any]: primaryColor,
      // Override Bosch supergraphic token so FROK components pick up the brand color
      ['--supergraphic-primary' as any]: primaryColor,
    };
  }, [primaryColor]);

  if (!projectId) {
    return (
      <div className="widget-root-shell">
        <div className="widget-state-center">
          <p className="widget-state-title">Missing project ID</p>
          <p className="widget-state-subtitle">
            Add <code>?projectId=&lt;id&gt;</code> to the widget URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ThemeSync mode={theme} />
      <WidgetAuthProvider tenantId={tenantId}>
        <div className="widget-root-shell" style={colorStyle}>
          <div className="widget-header">
            <div className="widget-header-mark" aria-hidden="true">
              <span className="widget-header-logo" />
            </div>
            <div className="widget-header-copy">
              <p className="widget-header-title">{title}</p>
            </div>
            <span className="widget-header-status">
              <span className="widget-header-status-dot" aria-hidden="true" />
              Online
            </span>
            <Button
              mode="integrated"
              icon={isExpanded ? 'fullscreen-exit' : 'fullscreen'}
              onClick={handleResizeWidget}
              aria-label={isExpanded ? 'Shrink chat widget' : 'Expand chat widget'}
              className="widget-header-action"
            />
            <Button
              mode="integrated"
              icon="close"
              onClick={handleCloseWidget}
              aria-label="Hide chat widget"
              className="widget-header-action"
            />
          </div>
          <WidgetChatContainer projectId={projectId} />
          {showTeamTag && (
            <div className="widget-team-tag" aria-label="Developed by BSGV/SX-EIT-MM team">
              <span className="widget-team-tag-kicker">Developed by</span>
              <span className="widget-team-tag-team">BSGV/SX-EIT-MM team</span>
            </div>
          )}
        </div>
      </WidgetAuthProvider>
    </ThemeProvider>
  );
};
