import React, { useEffect, useState } from 'react';
import { MdMenu, MdNotifications, MdEmail } from 'react-icons/md';
import { Badge, IconButton, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styles from './TopNavbar.module.css';
import { CiDark, CiLogout, CiSun } from 'react-icons/ci';
import { TbTruckDelivery } from 'react-icons/tb';

function TopNavbar({ onMenuToggle, setOpenSidebar, openSidebar, handleLogout, setNotifications, notifications, userType }) {
  const [darkMode, setDarkMode] = useState(true);
  const [allMessages, setAllMessages] = useState([]);
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

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
  
  // Chat tarixini olish
  const fetchMarketMessages = async () => {
    try {
      const response = await fetch('http://localhost:2277/contact/chat', {
        method: 'GET',
        headers: { 'accept': '*/*', 'Content-Type': 'application/json' },
        credentials: 'include'
      });
  
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        console.log('Market xabarlari:', data); // ✅ Tuzatildi: console.log
      }
    } catch (error) {
      console.error('Market xabarlarini yuklab boʻlmadi:', error);
    }
  };  
  
  const getTotalUnread = () => {
    let messagesList = [];
  
    if (userType === "deliver") {
      messagesList = allMessages;
    } else if (userType === "market") {
      messagesList = messages;
    }
  
    if (!Array.isArray(messagesList)) return 0;
  
    return messagesList.filter(msg => msg.status === 'new' && msg.from !== userType).length;
  };
  
  console.log(getTotalUnread());

  const handleNotificationClick = () => {
    navigate('/chat');
  };

  useEffect(() => {
    if (userType === "deliver") {
      fetchAllMessages();
    } else if (userType === "market") {
      fetchMarketMessages();
    }
    
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