import React, { useState } from 'react';
import { MdMenu, MdNotifications, MdEmail } from 'react-icons/md';
import { Badge, IconButton } from '@mui/material';
import styles from './TopNavbar.module.css';

function TopNavbar({ onMenuToggle ,setOpenSidebar,openSidebar}) {
  const [notificationCount, setNotificationCount] = useState(3);
  const [messageCount, setMessageCount] = useState(5);

  const getNotificationText = (count) => {
    if (count === 0) {
      return 'no notifications';
    }
    if (count > 99) {
      return '99+ notifications';
    }
    return `${count} notifications`;
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.leftSection}>

        
        <h1 className={styles.title}>Dashboard</h1>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.actions}>
          <IconButton 
            aria-label={getNotificationText(notificationCount)}
            className={styles.iconButton}
          >
            <Badge badgeContent={notificationCount} color="error">
              <MdNotifications />
            </Badge>
          </IconButton>
          
      
          
          <IconButton  
            className={styles.menuButtonIcon}
            onClick={()=>{
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