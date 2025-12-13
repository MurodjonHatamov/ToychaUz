import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import { IconButton, ListItemIcon } from "@mui/material";
import styles from './Sidebar.module.css';
import { TbTruckDelivery } from "react-icons/tb";
import { MdShoppingCart, MdListAlt, MdHelp, MdPerson, MdPayment, MdCheckCircle, MdLocalShipping, MdFileDownload, MdChat, MdStore, MdInventory, MdDeliveryDining, MdOutlineAssignment } from "react-icons/md";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { IoChatbubbleSharp, IoExitOutline } from "react-icons/io5";
import { CiDark, CiSun } from "react-icons/ci";
import { BiSolidCategory } from "react-icons/bi";

export default function Sidebar({ openSidebar,   handleLogout,userType }) {
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();

  



const getMenuItems = () => {
  if (userType === "deliver") {
    return [
      { name: "Buyurtmalar", path: "/", icon: <MdListAlt size={24} /> },
      { name: "Bozorlar", path: "/markets", icon: <MdStore size={24} /> },
      { name: "Mahsulotlar", path: "/products", icon: <MdInventory size={24} /> },
      { name: "Mahsulot chegarasi", path: "/product-limit", icon: <MdOutlineAssignment size={24} /> },
      { name: "Chat", path: "/chat", icon: <MdChat size={24} /> },
      { name: "Yetkazib beruvchilar", path: "/delivers", icon: <MdDeliveryDining size={24} /> },
      { name: "Kategoriyalar", path: "/categories", icon: <BiSolidCategory        size={24} /> },
      { name: "Profil", path: "/profile", icon: <MdPerson size={24} /> },
    ];
  } else {
    return [
      { name: "Buyurtma berish", path: "/", icon: <MdShoppingCart size={24} /> },
      { name: "Mening buyurtmalarim", path: "/myorders", icon: <MdListAlt size={24} /> },
      { name: "Profil", path: "/profile", icon: <MdPerson size={24} /> },
      { name: "Yordam", path: "/help", icon: <IoChatbubbleSharp size={24} /> },
    ];
  }
};

const menuItems=getMenuItems();


  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const getMenuItemClass = (itemPath) => {
    const baseClass = styles.menuItem;
    const selectedClass = location.pathname === itemPath ? styles.selectedMenuItem : '';
    return `${baseClass} ${selectedClass}`.trim();
  };

  const getMenuIconClass = (itemPath) => {
    const baseClass = styles.menuIcon;
    const selectedClass = location.pathname === itemPath ? styles.selectedMenuIcon : '';
    return `${baseClass} ${selectedClass}`.trim();
  };

  const getMenuTextClass = (itemPath) => {
    const baseClass = styles.menuText;
    const selectedClass = location.pathname === itemPath ? styles.selectedMenuText : '';
    return `${baseClass} ${selectedClass}`.trim();
  };

  const getSidebarClass = () => {
    return openSidebar ? styles.sidebar : styles.sidebarHidden;
  };

  return (
    <Box
      className={getSidebarClass()}
 
    >
      {/* Header */}
      <div className={styles.headerMenu}>
        <div className={styles.logo}>
          <img src="/imgs/dark.png" alt="" />
          <h2>ToychaUz</h2>
        </div>
        <div onClick={() => setDarkMode(!darkMode)} className={styles.darkMode}>
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="theme-toggle">
              {darkMode ? <CiSun /> : <CiDark />}
            </IconButton>
          </Stack>
        </div>
      </div>

      {/* Menu Items */}
      <List className={styles.menuList}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.name}
            component={Link}
            to={item.path}
            className={getMenuItemClass(item.path)}
            selected={location.pathname === item.path}
            sx={{
              margin: '4px 12px',
              borderRadius: '8px',
              '&:hover': {
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon className={getMenuIconClass(item.path)}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.name} 
              className={getMenuTextClass(item.path)}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.exit}>
          <Stack onClick={handleLogout} spacing={2} direction="row">
            <Button 
              startIcon={<IoExitOutline />} 
              variant="outlined"
              className={styles.exitButton}
            >
              Chiqish
            </Button>
          </Stack>
        </div>
      </div>
    </Box>
  );
}