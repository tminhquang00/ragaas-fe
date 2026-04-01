import React from 'react';
import { Tile } from '@bosch/react-frok';
import { useNavigate } from 'react-router-dom';
import { FrokIcon } from '../utils/iconAdapter';
import { alpha } from '../utils/frokTheme';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {

    return (
        <Tile
            style={{
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
            }}
            onClick={onClick}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ color: 'var(--app-text-secondary)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                        {title}
                    </p>
                    <h4 style={{ fontWeight: 700, margin: 0 }}>
                        {value}
                    </h4>
                </div>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        background: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 20px ${alpha(color, 0.3)}`,
                    }}
                >
                    {icon}
                </div>
            </div>
        </Tile>
    );
};

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                    Dashboard
                </h4>
                <p style={{ color: 'var(--app-text-secondary)' }}>
                    Welcome to RAG-as-a-Service. Manage your AI-powered knowledge bases.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Total Projects"
                    value="--"
                    icon={<FrokIcon name="Folder" style={{ color: 'white' }} />}
                    color="var(--app-primary)"
                    onClick={() => navigate('/projects')}
                />
                <StatCard
                    title="Documents"
                    value="--"
                    icon={<FrokIcon name="Description" style={{ color: 'white' }} />}
                    color="var(--g-violet-60, #6d37c7)"
                />
                <StatCard
                    title="Chat Sessions"
                    value="--"
                    icon={<FrokIcon name="Chat" style={{ color: 'white' }} />}
                    color="var(--app-success)"
                />
                <StatCard
                    title="Active Projects"
                    value="--"
                    icon={<FrokIcon name="TrendingUp" style={{ color: 'white' }} />}
                    color="var(--app-warning)"
                />
            </div>

            {/* Quick Actions */}
            <h6 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                Quick Start
            </h6>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <Tile
                    style={{
                        cursor: 'pointer',
                        background: alpha('var(--app-primary)', 0.08),
                        border: `1px solid ${alpha('var(--app-primary)', 0.2)}`,
                    }}
                    onClick={() => navigate('/projects')}
                >
                    <h6 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        Create Your First Project
                    </h6>
                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                        Set up a new RAG project to start building your AI-powered knowledge base.
                        Upload documents, configure your LLM, and start chatting.
                    </p>
                </Tile>
                <Tile
                    style={{
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/settings')}
                >
                    <h6 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        Configure Settings
                    </h6>
                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem' }}>
                        Customize your tenant settings, manage API keys, and configure
                        default options for new projects.
                    </p>
                </Tile>
            </div>
        </div>
    );
};
