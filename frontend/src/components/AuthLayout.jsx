import { Box, Paper } from '@mui/material';
import { tokens } from '../theme';
import BizGuideMark from './BizGuideMark';

export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: tokens.parchment,
        backgroundImage: `radial-gradient(${tokens.hairline} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <BizGuideMark size="lg" />
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            border: `1px solid ${tokens.hairline}`,
            borderRadius: 2,
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  );
}
