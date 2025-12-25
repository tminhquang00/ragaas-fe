import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel,
    Alert,
    useTheme,
    alpha,
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    Check as CheckIcon,
    Warning as WarningIcon,
    Key as KeyIcon,
} from '@mui/icons-material';

interface ApiKeyModalProps {
    open: boolean;
    apiKey: string;
    onClose: () => void;
    projectName?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
    open,
    apiKey,
    onClose,
    projectName,
}) => {
    const theme = useTheme();
    const [copied, setCopied] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleClose = () => {
        if (confirmed) {
            setConfirmed(false);
            setCopied(false);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => { }} // Prevent closing without confirmation
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(20px)',
                },
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <KeyIcon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            Your API Key
                        </Typography>
                        {projectName && (
                            <Typography variant="body2" color="text.secondary">
                                {projectName}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Alert
                    severity="warning"
                    icon={<WarningIcon />}
                    sx={{
                        mb: 3,
                        '& .MuiAlert-message': {
                            fontWeight: 500,
                        },
                    }}
                >
                    Save this key now! It won't be shown again.
                </Alert>

                <TextField
                    fullWidth
                    value={apiKey}
                    InputProps={{
                        readOnly: true,
                        sx: {
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            background: alpha(theme.palette.background.default, 0.5),
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleCopy} edge="end">
                                    {copied ? (
                                        <CheckIcon color="success" />
                                    ) : (
                                        <CopyIcon />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {copied && (
                    <Typography
                        variant="caption"
                        color="success.main"
                        sx={{ display: 'block', mt: 1, textAlign: 'right' }}
                    >
                        Copied to clipboard!
                    </Typography>
                )}

                <Box sx={{ mt: 3 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                I have saved my API key securely
                            </Typography>
                        }
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    variant="contained"
                    onClick={handleClose}
                    disabled={!confirmed}
                    fullWidth
                    size="large"
                >
                    Continue to Project
                </Button>
            </DialogActions>
        </Dialog>
    );
};
