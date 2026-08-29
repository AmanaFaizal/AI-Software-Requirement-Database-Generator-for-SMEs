import { createTheme } from '@mui/material/styles';

// BizGuide design tokens — a "digital ledger" feel for small-business owners:
// warm paper background, ink-navy structure, amber for action, mono numerals
// for anything financial (prices, stock counts) so figures read like a ledger.
export const tokens = {
  ink: '#1C2B39',       // primary — navy ink
  amber: '#E2A63B',     // accent / call-to-action
  parchment: '#F7F2E9', // app background — warm paper
  slate: '#55606B',     // secondary text
  forest: '#33613F',    // positive (healthy stock, profit)
  rust: '#B3492E',      // negative (low stock, alerts)
  paperWhite: '#FFFFFF',
  hairline: '#E4DCC9',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.ink, contrastText: '#FFFFFF' },
    secondary: { main: tokens.amber, contrastText: tokens.ink },
    success: { main: tokens.forest },
    error: { main: tokens.rust },
    background: { default: tokens.parchment, paper: tokens.paperWhite },
    text: { primary: tokens.ink, secondary: tokens.slate },
    divider: tokens.hairline,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h2: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h3: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h4: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h5: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h6: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, paddingLeft: 16, paddingRight: 16 },
        containedSecondary: { color: tokens.ink },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontFamily: '"Inter", sans-serif',
          fontWeight: 700,
          fontSize: '0.72rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: tokens.slate,
          borderBottom: `1px solid ${tokens.hairline}`,
        },
        body: {
          borderBottom: `1px solid ${tokens.hairline}`,
        },
      },
    },
  },
});

// Utility className-free style for ledger-style numerals (tabular figures)
export const numeralSx = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontVariantNumeric: 'tabular-nums',
};

export default theme;
