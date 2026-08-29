import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';

// Signature mark: a small compass-notch (a guide's pointer) beside the wordmark.
// Kept to one accent color, used sparingly — the restraint is deliberate.
export default function BizGuideMark({ size = 'md' }) {
  const dims = { sm: 22, md: 28, lg: 36 }[size];
  const fontSize = { sm: '1.1rem', md: '1.4rem', lg: '1.8rem' }[size];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
      <Box
        component="svg"
        width={dims}
        height={dims}
        viewBox="0 0 32 32"
        sx={{ flexShrink: 0 }}
      >
        <circle cx="16" cy="16" r="14.5" fill="none" stroke={tokens.ink} strokeWidth="1.5" />
        <path d="M16 6 L20 16 L16 26 L12 16 Z" fill={tokens.amber} />
        <circle cx="16" cy="16" r="1.6" fill={tokens.ink} />
      </Box>
      <Typography
        sx={{
          fontFamily: '"Fraunces", serif',
          fontWeight: 600,
          fontSize,
          color: tokens.ink,
          letterSpacing: '-0.01em',
        }}
      >
        BizGuide
      </Typography>
    </Box>
  );
}
