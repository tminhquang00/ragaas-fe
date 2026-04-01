import React from 'react';
import { Icon } from '@bosch/react-frok';

const iconMapping: Record<string, string> = {
    // Navigation & Actions
    Send: 'forward-right',
    Delete: 'delete',
    Settings: 'settings',
    Search: 'search',
    Add: 'add',
    Close: 'close',
    Edit: 'edit',
    Save: 'save',
    Refresh: 'refresh',
    ExpandMore: 'down',
    ChevronRight: 'right',
    ChevronLeft: 'left',
    NavigateBefore: 'left',
    NavigateNext: 'right',
    Menu: 'menu',

    // Users
    Person: 'user',
    PersonAdd: 'user-add',
    PersonRemove: 'user-remove',
    Logout: 'log-out',
    Login: 'log-in',

    // Files & Documents
    Folder: 'folder',
    Description: 'document',
    InsertDriveFile: 'document',
    PictureAsPdf: 'document-pdf',
    Article: 'document-text',
    AttachFile: 'attachment',
    FileUpload: 'upload',
    CloudUpload: 'upload',

    // Communication
    Chat: 'chat',
    Link: 'link',

    // Theme & Display
    LightMode: 'sun',
    DarkMode: 'moon',
    Brightness4: 'contrast',
    Visibility: 'view',
    VisibilityOff: 'view-off',
    Preview: 'view',
    Image: 'image',
    ZoomIn: 'zoom-in',
    ZoomOut: 'zoom-out',

    // Status & Feedback
    Check: 'checkmark',
    CheckCircle: 'checkmark',
    Error: 'alert-error',
    Warning: 'alert-warning',
    Info: 'alert-info',
    Pending: 'time',

    // Layout & UI
    Dashboard: 'home',
    ContentCopy: 'copy',
    MoreVert: 'option-vertical',
    DragIndicator: 'drag',
    FilterList: 'filter',
    Label: 'label',
    OpenInNew: 'open-in-new',
    RestartAlt: 'reset',

    // Data & Technical
    TableChart: 'table',
    Storage: 'database',
    Key: 'key',
    History: 'history',
    Lock: 'lock',
    Code: 'code',
    Public: 'globe',
    Cloud: 'cloud',
    CloudSync: 'cloud',

    // Misc
    Build: 'wrench',
    AutoAwesome: 'flash',
    Bolt: 'flash',
    SmartToy: 'robot',
    Star: 'star',
    Circle: 'circle',
    TrendingUp: 'arrow-up-right',
    Archive: 'archive',
    PlayArrow: 'play',
    AutoGraph: 'chart-line',
    CallSplit: 'connection',
    Transform: 'refresh',
    Merge: 'connection',
    Share: 'share',
};

interface FrokIconProps {
    name: string;
    isUiIcon?: boolean;
    className?: string;
    style?: React.CSSProperties;
    'aria-label'?: string;
}

export const FrokIcon: React.FC<FrokIconProps> = ({
    name,
    isUiIcon,
    className,
    style,
    'aria-label': ariaLabel,
}) => {
    const mappedName = iconMapping[name] ?? name;
    return (
        <Icon
            iconName={mappedName}
            isUiIcon={isUiIcon}
            className={className}
            style={style}
            aria-label={ariaLabel}
        />
    );
};
