import React, { useEffect, useState } from 'react';
import { MdMenu, MdNotifications, MdEmail } from 'react-icons/md';
import { Badge, IconButton, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Yangi import
import styles from './TopNavbar.module.css';
import { CiDark, CiLogout, CiSun } from 'react-icons/ci';
import { TbTruckDelivery } from 'react-icons/tb';

function TopNavbar({ onMenuToggle, setOpenSidebar, openSidebar, handleLogout, setNotifications, notifications }) {
  const [darkMode, setDarkMode] = useState(true);
  const [allMessages, setAllMessages] = useState([]);
  const navigate = useNavigate(); // useNavigate hook'ini ishlatish

  const fetchAllMessages = async () => {
    try {
      const response = await fetch('http://localhost:2277/deliver/messages', {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const allMessagesData = await response.json();
        setAllMessages(allMessagesData);
      }
    } catch (error) {
      console.error('Barcha xabarlarni yuklab boʻlmadi:', error);
    }
  };

  const getTotalUnread = () => {
    return allMessages.filter(msg =>
      msg.status === 'new' &&
      msg.from !== 'deliver' // market tomonidan yuborilgan xabarlar
    ).length;
  };

  // Notification tugmasi bosilganda chat sahifasiga o'tish
  const handleNotificationClick = () => {
    navigate('/chat');
  };

  console.log(getTotalUnread());

  useEffect(() => {
    fetchAllMessages();
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <div className={styles.navbar}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>
          <TbTruckDelivery />
          <h2>ToychaUz</h2>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.actions}>
          {/* Notification tugmasi */}
          <div className={styles.notification}>
            <Stack direction="row" spacing={1}>
              <IconButton 
                aria-label="notifications" 
                className={styles.iconButton}
                onClick={handleNotificationClick}
              >
                <Badge 
                  badgeContent={getTotalUnread()} 
                  color="error"
                  max={99}
                >
                  <MdNotifications />
                </Badge>
              </IconButton>
            </Stack>
          </div>

          <div onClick={() => setDarkMode(!darkMode)} className={styles.darkMode}>
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="theme-toggle" className={styles.iconButton}>
                {darkMode ? <CiSun /> : <CiDark />}
              </IconButton>
            </Stack>
          </div>
      
          <div className={styles.logaut}>
            <Stack 
              onClick={handleLogout}
              sx={{
                backgroundColor:'var(--background) ',
                borderRadius:'50%'
              }} 
              direction="row" 
              spacing={1}
            >
              <IconButton aria-label="logout" color='error' className={styles.iconButton}>
                <CiLogout />
              </IconButton>
            </Stack>
          </div>
          
          <IconButton  
            className={styles.menuButtonIcon}
            onClick={() => {
              setOpenSidebar(!openSidebar)
            }}
          >
            <MdMenu />  
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default TopNavbar;