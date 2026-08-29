import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';

// Signature mark: a small compass-notch (a guide's pointer) beside the wordmark.
// Kept to one accent color, used sparingly — the restraint is deliberate.
export default function BizGuideMark({ size = 'md' }) {
  const scale = { sm: 1.5, md: 1.8, lg: 2.2 }[size];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      <img
        src="/bizguide-logo.png"
        alt="BizGuide Logo"
        style={{
          height: 60,
          width: 'auto',
          transform: `scale(${scale})`,
          transformOrigin: 'left center'
        }}
      />
    </Box>
  );
}
