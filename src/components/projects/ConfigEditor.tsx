import React, { useState, useEffect } from 'react';
import {
    TextField,
    TextArea,
    Toggle,
    Accordion,
    Button,
    Tile,
    TabNavigation,
    Tab,
} from '@bosch/react-frok';

interface ConfigEditorProps {
    config: Record<string, any>;
    onSave: (newConfig: Record<string, any>) => Promise<void>;
}

// Helper to determine value type
const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
};

// Recursive Field Renderer
const ConfigField: React.FC<{
    path: string[];
    value: any;
    label: string;
    onChange: (path: string[], newValue: any) => void;
    onDelete?: (path: string[]) => void;
    depth?: number;
}> = ({ path, value, label, onChange, onDelete, depth = 0 }) => {
    const type = getValueType(value);
    const isRoot = depth === 0;

    // String / Number
    if (type === 'string' || type === 'number' || type === 'null') {
        return (
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TextField
                    id={`config-field-${path.join('-')}`}
                    label={label}
                    value={value ?? ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(path, type === 'number' ? Number(val) : val);
                    }}
                />
                {onDelete && (
                    <Button
                        mode="integrated"
                        icon="delete"
                        aria-label="Delete"
                        onClick={() => onDelete(path)}
                    />
                )}
            </div>
        );
    }

    // Boolean
    if (type === 'boolean') {
        return (
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Toggle
                    id={`toggle-${path.join('-')}`}
                    leftLabel={label}
                    checked={value}
                    onChange={(e) => onChange(path, (e.target as HTMLInputElement).checked)}
                />
                {onDelete && (
                    <Button
                        mode="integrated"
                        icon="delete"
                        aria-label="Delete"
                        onClick={() => onDelete(path)}
                    />
                )}
            </div>
        );
    }

    // Object
    if (type === 'object') {
        const content = (
            <div style={{ width: '100%' }}>
                {Object.entries(value).map(([key, val]) => (
                    <ConfigField
                        key={key}
                        path={[...path, key]}
                        value={val}
                        label={key}
                        onChange={onChange}
                        depth={depth + 1}
                    />
                ))}
            </div>
        );

        if (isRoot) return content;

        return (
            <Accordion headline={label} defaultOpen style={{ marginBottom: 16 }}>
                {content}
            </Accordion>
        );
    }

    // Array
    if (type === 'array') {
        return (
            <Accordion headline={`${label} [${value.length}]`} defaultOpen style={{ marginBottom: 16 }}>
                {value.map((item: any, index: number) => (
                    <div key={index} style={{ paddingLeft: 16, borderLeft: '1px solid var(--major__enabled__default__line, #ccc)', marginBottom: 8 }}>
                        <ConfigField
                            path={[...path, index.toString()]}
                            value={item}
                            label={`${label}[${index}]`}
                            onChange={onChange}
                            onDelete={() => {
                                const newArray = [...value];
                                newArray.splice(index, 1);
                                onChange(path, newArray);
                            }}
                            depth={depth + 1}
                        />
                    </div>
                ))}
                <Button
                    mode="tertiary"
                    icon="add"
                    label="Add Item"
                    onClick={() => {
                        const newArray = [...value, ""];
                        onChange(path, newArray);
                    }}
                />
            </Accordion>
        );
    }

    return null;
};

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onSave }) => {
    const [localConfig, setLocalConfig] = useState<Record<string, any>>(config);
    const [mode, setMode] = useState<'visual' | 'json'>('visual');
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    // Reset local state when config prop changes (and not dirty?)
    // Actually, usually we want to respect the prop updates unless user is editing.
    // For simplicity, we initialize once or when config deeply changes.
    useEffect(() => {
        if (!dirty) {
            setLocalConfig(config);
        }
    }, [config, dirty]);

    const handleFieldChange = (path: string[], newValue: any) => {
        setDirty(true);
        setLocalConfig((prev) => {
            const next = JSON.parse(JSON.stringify(prev)); // Deep clone
            let current = next;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = newValue;
            return next;
        });
    };

    const handleJsonChange = (newJson: string) => {
        setDirty(true);
        try {
            const parsed = JSON.parse(newJson);
            setLocalConfig(parsed);
            setJsonError(null);
        } catch (e) {
            setJsonError((e as Error).message);
        }
    };

    const handleSave = async () => {
        if (jsonError) return;
        setSaving(true);
        try {
            await onSave(localConfig);
            setDirty(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Tile style={{ padding: 0, overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{
                padding: 16,
                borderBottom: '1px solid var(--major__enabled__default__line, #ccc)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h6 style={{ margin: 0 }}>Project Configuration</h6>
                    <TabNavigation
                        selectedValue={mode}
                        onTabSelect={(_ev, data) => setMode(data.value as 'visual' | 'json')}
                    >
                        <Tab value="visual" icon={{ iconName: 'list' }}>Visual</Tab>
                        <Tab value="json" icon={{ iconName: 'code' }}>JSON</Tab>
                    </TabNavigation>
                </div>
                <Button
                    mode="primary"
                    icon="save"
                    label={saving ? 'Saving...' : 'Save Changes'}
                    onClick={handleSave}
                    disabled={saving || (mode === 'json' && !!jsonError)}
                />
            </div>

            {/* Content */}
            <div style={{ padding: 24 }}>
                {mode === 'visual' ? (
                    <ConfigField
                        path={[]}
                        value={localConfig}
                        label="Root"
                        onChange={handleFieldChange}
                    />
                ) : (
                    <div>
                        <TextArea
                            id="config-json-editor"
                            label="JSON Configuration"
                            rows={20}
                            value={JSON.stringify(localConfig, null, 2)}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                        {jsonError && (
                            <p style={{ color: 'var(--app-error, #e00)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{jsonError}</p>
                        )}
                    </div>
                )}
            </div>
        </Tile>
    );
};
