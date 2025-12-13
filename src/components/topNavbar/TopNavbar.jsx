import React, { useEffect, useState } from 'react';
import { MdMenu, MdNotifications, MdEmail } from 'react-icons/md';
import { Badge, IconButton, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styles from './TopNavbar.module.css';
import { CiDark, CiLogout, CiSun } from 'react-icons/ci';
import { logaut } from '../../pages/logaut';

function TopNavbar({ onMenuToggle, setOpenSidebar, openSidebar, handleLogout,  userType }) {
  const [darkMode, setDarkMode] = useState(true);
  const [allMessages, setAllMessages] = useState([]);
 
  const navigate = useNavigate();

  const fetchAllMessages = async () => {
    try {
      const response = await fetch(`${baseURL}/deliver/messages`, {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      logaut(response);
 
      if (response.ok) {
        const allMessagesData = await response.json();
        setAllMessages(allMessagesData);
      }
    } catch (error) {
      // Barcha xabarlarni yuklab boʻlmadi
    }
  };
  
  // Chat tarixini olish
  const getTotalUnread = () => {
    if (userType !== "deliver") return 0;
    if (!Array.isArray(allMessages)) return 0;
  
    return allMessages.filter(
      msg => msg.status === 'new' && msg.from !== userType
    ).length;
  };
  console.log(getTotalUnread());
  
  

  const handleNotificationClick = () => {
    navigate('/chat');
  };

  useEffect(() => {
  
      fetchAllMessages();
    
    
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode, userType]); // ✅ userType ni dependency ga qo'shish kerak

  return (
    <div className={styles.navbar}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>
          <img src={"/imgs/Light.png"} alt="" />
          <h2>ToychaUz</h2>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.actions}>
    {
      userType === "deliver" && (      <div className={styles.notification}>
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
      </div>)
    }

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
            className={userType==='deliver' ?  styles.menuButtonIconDeliver: styles.menuButtonIcon}
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