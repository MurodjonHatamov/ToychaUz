import React, { useState, useEffect } from 'react';
import { 
  FaStore, 
  FaPhone, 
  FaUser, 
  FaCalendar,
  FaIdCard,
  FaCheckCircle,
  FaTruck
} from 'react-icons/fa';
import styles from './User.module.css';
import { useNavigate } from 'react-router-dom';
import { logaut } from '../logaut';
import { baseURL } from '../config';



function User({ userType }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


const url = userType === 'deliver' 
  ? `${baseURL}/deliver/own-profile`
  : `${baseURL}/orders/profile` ;
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': '*/*'
        },
        credentials: 'include'
      });

      logaut(response);

      
      if (!response.ok) {
        throw new Error(`Ma'lumotlarni olishda xatolik: ${response.status}`);
      }
 
      
      const data = await response.json();
      setUserData(data);

      
      
    } catch (error) {

      setError('Ma\'lumotlarni yuklab olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Sana formatlash (31.10.2025 formatida)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <div className={styles.loadingText}>Ma'lumotlar yuklanmoqda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.alert}>
          <div className={styles.alertText}>{error}</div>
        </div>
        <button 
          onClick={fetchUserProfile}
          className={styles.retryButton}
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className={styles.userContainer}>
      <div className={styles.passportCard}>
        {/* Passport Header */}
        <div className={styles.passportHeader}>

          <div className={styles.passportLogo}>
            <FaIdCard className={styles.logoIcon} />
            <span>{userType==='deliver' ? "DELIVER PROFILI" :"MARKET PROFILI" }</span>
          </div>
          
          <div className={styles.passportStatus}>
            <FaCheckCircle className={styles.statusIcon} />
            <span>FAOL</span>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.passportContent}>
          {/* Left Side - Avatar and Basic Info */}
          <div className={styles.leftSection}>
{
  userType ==='deliver' ?  <div className={styles.avatarSection}>
  <div className={styles.avatar}>
    <FaTruck />
  </div>
  <div className={styles.avatarLabel}>Deliver</div>
</div> :  <div className={styles.avatarSection}>
  <div className={styles.avatar}>
    <FaStore />
  </div>
  <div className={styles.avatarLabel}>Market</div>
</div>
}

          
            
            <div className={styles.basicInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Hisob Turi:</span>
                <span className={styles.infoValue}>{userType==='deliver' ?'Deliver' : 'Market'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Platforma:</span>
                <span className={styles.infoValue}>ToychaUz</span>
              </div>
            </div>
          </div>

          {/* Right Side - Detailed Info */}
          <div className={styles.rightSection}>
            {/* Market Name - Large and prominent */}
            <div className={styles.nameSection}>
              <div className={styles.nameLabel}>MARKET NOMI</div>
              <div className={styles.nameValue}>{userData?.name}</div>
            </div>

            {/* Details Grid */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>
                  <FaPhone className={styles.detailIcon} />
                  Telefon Raqam
                </div>
                <div className={styles.detailValue}>{userData?.phone}</div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>
                  <FaUser className={styles.detailIcon} />
                  Hisob ID
                </div>
                <div className={styles.detailValue}>
                  {userData?._id?.substring(0, 8).toUpperCase()}...
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>
                  <FaCalendar className={styles.detailIcon} />
                  Ro'yxatdan O'tgan
                </div>
                <div className={styles.detailValue}>
                  {userData?.createdAt ? formatDate(userData.createdAt) : ''}
                </div>
              </div>

       
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.passportFooter}>
          <div className={styles.footerText}>
            Ushbu ma'lumotlar ToychaUz tizimi tomonidan qayd etilgan
          </div>
          <div className={styles.footerStamp}>
            <div className={styles.stamp}>TASDIQLANGAN</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;