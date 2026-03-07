'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import TopBar from '@/components/layout/TopBar';
import { getGoogleStatus, getGoogleAuthUrl, disconnectGoogle } from '@/lib/api/google';
import { HardDrive, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SettingsPage() {
  const { data: connected, isLoading, mutate, error } = useSWR(
    'google-status',
    getGoogleStatus,
    { revalidateOnFocus: true }
  );
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleConnect = () => {
    window.location.href = getGoogleAuthUrl();
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setActionError('');
    try {
      await disconnectGoogle();
      await mutate();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to disconnect');
    } finally {
      setDisconnecting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Settings" />

      <div className="flex-1 p-6">
        <div className="max-w-xl">
          <Stack spacing={3}>
            {actionError && <Alert severity="error">{actionError}</Alert>}

            {/* Google Drive Card */}
            <Card
              elevation={0}
              sx={{ border: '1px solid var(--color-border)', borderRadius: '12px' }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="flex-start" spacing={3}>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#EFF6FF' }}
                  >
                    <HardDrive size={22} color="#1E40AF" />
                  </div>
                  <div className="flex-1">
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                      <Typography variant="h5" fontWeight={700}>
                        Google Drive Backup
                      </Typography>
                      {!isLoading && connected !== undefined && (
                        <Chip
                          icon={connected
                            ? <CheckCircle size={12} />
                            : <AlertTriangle size={12} />
                          }
                          label={connected ? 'Connected' : 'Not Connected'}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: connected ? '#DCFCE7' : '#FEF3C7',
                            color: connected ? '#166534' : '#92400E',
                          }}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      Connect your Google account to enable automatic backup of your rental data to Google Drive. This is a one-time setup.
                    </Typography>

                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : error ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Could not fetch Google status. Make sure the server is running.
                      </Alert>
                    ) : connected ? (
                      <Stack direction="row" spacing={2}>
                        <Alert severity="success" icon={<CheckCircle size={16} />} sx={{ flex: 1, py: 0.5 }}>
                          Google Drive is connected and ready for backups.
                        </Alert>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setConfirmOpen(true)}
                          sx={{ flexShrink: 0 }}
                        >
                          Disconnect
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ExternalLink size={15} />}
                        onClick={handleConnect}
                      >
                        Connect Google Drive
                      </Button>
                    )}
                  </div>
                </Stack>
              </CardContent>
            </Card>

            {/* App Info */}
            <Divider />
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                About
              </Typography>
              <Typography variant="body2" color="text.secondary">
                RentLedger — Shop Rental Management System
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Version 1.0.0
              </Typography>
            </Stack>
          </Stack>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Disconnect Google Drive"
        message="Are you sure you want to disconnect Google Drive? Backups will stop working until you reconnect."
        confirmLabel="Disconnect"
        confirmColor="error"
        loading={disconnecting}
        onConfirm={handleDisconnect}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
