import React from 'react';
import { Tile, Layout } from '@bosch/react-frok';
import { useNavigate } from 'react-router-dom';
import { FrokIcon } from '../utils/iconAdapter';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    iconColor: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconColor, onClick }) => {
    return (
        <Tile
            onClick={onClick}
            style={{
                padding: '1.5rem',
                position: 'relative',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'border-color 0.2s ease',
                border: '1px solid var(--app-border)',
            }}
            onMouseEnter={(e) => {
                if (onClick) e.currentTarget.style.borderColor = 'var(--app-primary)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--app-border)';
            }}
        >
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <div
                    style={{
                        width: 56,
                        height: 56,
                        background: iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                >
                    <FrokIcon name={icon} style={{ fontSize: '1.5rem', color: 'white' }} />
                </div>
            </div>
            <div>
                <p style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--app-text-secondary)' }}>
                    {title}
                </p>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                    {value}
                </p>
            </div>
        </Tile>
    );
};

interface ActionCardProps {
    title: string;
    description: string;
    onClick?: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, onClick }) => {
    return (
        <Tile
            onClick={onClick}
            style={{
                padding: '1.75rem',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'border-color 0.2s ease',
                border: '1px solid var(--app-border)',
            }}
            onMouseEnter={(e) => {
                if (onClick) e.currentTarget.style.borderColor = 'var(--app-primary)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--app-border)';
            }}
        >
            <h3 style={{ margin: 0, marginBottom: '0.75rem', fontWeight: 600, fontSize: '1.125rem' }}>
                {title}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--app-text-secondary)', lineHeight: 1.6 }}>
                {description}
            </p>
        </Tile>
    );
};

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ margin: 0, marginBottom: '1rem', fontSize: '2.5rem', fontWeight: 700 }}>
                    Dashboard
                </h1>
                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--app-text-secondary)' }}>
                    Welcome to Babbage - Enterprise Agent Foundry. Design, deploy, and monitor AI agents that automate your enterprise workflows.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                gap: '1.25rem',
                marginBottom: '2.5rem' 
            }}>
                <StatCard
                    title="Total Projects"
                    value={0}
                    icon="Folder"
                    iconColor="var(--g-blue-50)"
                    onClick={() => navigate('/projects')}
                />
                <StatCard
                    title="Documents"
                    value={0}
                    icon="Description"
                    iconColor="#9b51e0"
                />
                <StatCard
                    title="Chat Sessions"
                    value={0}
                    icon="Chat"
                    iconColor="var(--g-green-50)"
                />
                <StatCard
                    title="Active Projects"
                    value={0}
                    icon="CheckCircle"
                    iconColor="#f2994a"
                />
            </div>

            {/* Quick Start */}
            <div>
                <h2 style={{ margin: 0, marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: 600 }}>
                    Quick Start
                </h2>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                    gap: '1.25rem' 
                }}>
                    <ActionCard
                        title="Create Your First Project"
                        description="Create a new agent project to start automating workflows. Define your pipeline, configure your AI agents, and deploy in minutes."
                        onClick={() => navigate('/projects')}
                    />
                    <ActionCard
                        title="Configure Settings"
                        description="Customize your tenant settings, manage API keys, and configure default options for new projects."
                        onClick={() => navigate('/settings')}
                    />
                </div>
            </div>
        </Layout>
    );
};
