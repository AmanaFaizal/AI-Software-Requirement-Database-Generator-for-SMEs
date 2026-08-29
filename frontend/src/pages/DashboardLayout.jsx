import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import BizGuideMark from '../components/BizGuideMark';
import { tokens } from '../theme';

import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

// Signature nav treatment: each section gets a small colored "ledger tab"
// on its left edge, echoing physical ledger-book dividers.
const NAV_ITEMS = [
  { to: '/inventory', label: 'Inventory', icon: Inventory2Icon, tab: tokens.amber },
  { to: '/categories', label: 'Categories', icon: CategoryIcon, tab: tokens.sapphire },
  { to: '/dealers', label: 'Dealers', icon: LocalShippingIcon, tab: tokens.emerald },
  { to: '/purchases', label: 'Purchase Orders', icon: ShoppingCartIcon, tab: tokens.rust },
  { to: '/sales', label: 'Sales', icon: PointOfSaleIcon, tab: tokens.emerald },
  { to: '/expenses', label: 'Expenses', icon: RequestQuoteIcon, tab: tokens.rust },
  { to: '/invoices', label: 'Invoices', icon: ReceiptIcon, tab: tokens.violet },
  { to: '/reports', label: 'Reports', icon: BarChartIcon, tab: tokens.charcoal },
  { to: '/reminders', label: 'Reminders', icon: NotificationsIcon, tab: tokens.ink },
];

export default function DashboardLayout() {
  const { logout } = useAuth();
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: tokens.parchment }}>
      <Box
        component="nav"
        sx={{
          width: 232,
          flexShrink: 0,
          borderRight: `1px solid ${tokens.hairline}`,
          display: 'flex',
          flexDirection: 'column',
          py: 3,
        }}
      >
        <Box sx={{ px: 2.5, mb: 3 }}>
          <BizGuideMark size="sm" />
        </Box>

        <Box sx={{ px: 2.5, mb: 3 }}>
          <Chip
            icon={<SwapHorizIcon fontSize="small" />}
            label={activeBusiness?.business_name || 'No business selected'}
            onClick={() => navigate('/businesses')}
            variant="outlined"
            size="small"
            sx={{ maxWidth: '100%', borderColor: tokens.hairline, justifyContent: 'flex-start' }}
          />
        </Box>

        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, flex: 1 }}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, tab }) => (
            <Box component="li" key={to}>
              <Box
                component={NavLink}
                to={to}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  textDecoration: 'none',
                  color: tokens.ink,
                  py: 1.1,
                  pl: 2,
                  pr: 2.5,
                  position: 'relative',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 6,
                    bottom: 6,
                    width: 3,
                    borderRadius: 2,
                    backgroundColor: 'transparent',
                  },
                  '&.active::before': { backgroundColor: tab },
                  '&.active': { backgroundColor: 'rgba(28,43,57,0.05)' },
                  '&:hover': { backgroundColor: 'rgba(28,43,57,0.04)' },
                }}
              >
                <Icon fontSize="small" sx={{ color: tokens.slate }} />
                {label}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ px: 2.5, pt: 2, borderTop: `1px solid ${tokens.hairline}` }}>
          <Box
            onClick={logout}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
              color: tokens.slate, fontSize: '0.85rem', '&:hover': { color: tokens.ink },
            }}
          >
            <LogoutIcon fontSize="small" />
            Log out
          </Box>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, p: { xs: 2.5, sm: 4 }, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
