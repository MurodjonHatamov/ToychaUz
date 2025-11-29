import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BottomNavigation, 
  BottomNavigationAction,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  MdShoppingCart,
  MdListAlt,
  MdPerson,
  MdHelp
} from 'react-icons/md';

const menuItems = [
  { name: "Mahsulotlar", path: "/", icon: <MdShoppingCart size={22} /> },
  { name: "Buyurtmalarim", path: "/myorders", icon: <MdListAlt size={22} /> },
  { name: "Profil", path: "/profile", icon: <MdPerson size={22} /> },
  { name: "Yordam", path: "/help", icon: <MdHelp size={22} /> },
];

const MobileBottomNav = ({userType}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = useState(location.pathname);
console.log(userType);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    navigate(newValue);
  };

  if (!isMobile) {
    return null;
  }
const display=userType==="market" ? 'block' : 'none';


  return (
    <Box

      sx={{
        display:display,
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 400,
        zIndex: 1000,
        borderRadius: '20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        '& .MuiBottomNavigation-root': {
          background: 'transparent',
          height: 70,
          minHeight: 70,
        },
        '& .MuiBottomNavigationAction-root': {
          minWidth: 60,
          padding: '8px 4px',
          color: 'var(--text-light)',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: 'var(--primary)',
          },
        },
        '& .MuiBottomNavigationAction-label': {
          fontSize: '0.7rem',
          fontWeight: 500,
          transition: 'font-size 0.2s ease',
          '&.Mui-selected': {
            fontSize: '0.72rem',
            fontWeight: 600,
          },
        },
      }}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
      >
        {menuItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            value={item.path}
            icon={item.icon}
            label={item.name}
            sx={{
              '& .MuiSvgIcon-root': {
                transition: 'all 0.2s ease',
              },
              '&.Mui-selected .MuiSvgIcon-root': {
                transform: 'scale(1.1)',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default MobileBottomNav;