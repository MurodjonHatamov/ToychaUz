import React, { useEffect, useState } from 'react';
import { MdMenu, MdNotifications, MdEmail } from 'react-icons/md';
import { Badge, IconButton, Stack } from '@mui/material';
import styles from './TopNavbar.module.css';
import { CiDark, CiSun } from 'react-icons/ci';
import { TbTruckDelivery } from 'react-icons/tb';

function TopNavbar({ onMenuToggle ,setOpenSidebar,openSidebar}) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
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
        <div onClick={() => setDarkMode(!darkMode)} className={styles.darkMode}>
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="theme-toggle">
              {darkMode ? <CiSun /> : <CiDark />}
            </IconButton>
          </Stack>
        </div>
      
          
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