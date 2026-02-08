import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Card, 
  Typography, 
  Box, 
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  FaStore, 
  FaTruck, 
  FaPhone, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaSignInAlt,
  FaExclamationTriangle,
  FaShieldAlt,
  FaBolt,
  FaCheckCircle,
  FaShoppingBag,
  FaTruckLoading,
  FaLock as FaLockIcon
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from "./Login.module.css";
import { baseURL } from '../config';

function Login() {
  const [formData, setFormData] = useState({
    loginType: 'market',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 9) value = value.slice(0, 9);
    
    if (value.length > 0) {
      let formattedValue = value;
      if (value.length > 2) {
        formattedValue = value.substring(0, 2) + ' ' + value.substring(2);
      }
      if (value.length > 5) {
        formattedValue = value.substring(0, 2) + ' ' + value.substring(2, 5) + ' ' + value.substring(5);
      }
      if (value.length > 7) {
        formattedValue = value.substring(0, 2) + ' ' + value.substring(2, 5) + ' ' + value.substring(5, 7) + ' ' + value.substring(7);
      }
      value = formattedValue;
    }
    
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
    
    if (error) setError('');
  };

  const handleLoginTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      loginType: type,
      phone: ''
    }));
    if (error) setError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    if (!cleanPhone || !formData.password) {
      setError('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    const phoneRegex = /^\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Iltimos, 9 xonali telefon raqamini kiriting (90 166 95 65)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = formData.loginType === 'market' 
        ? `${baseURL}/auth/market-login`
        : `${baseURL}/auth/deliver-login`;
  
      const phoneForApi = cleanPhone;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        credentials: 'include',
        body: JSON.stringify({
          phone: phoneForApi,
          password: formData.password
        })
      });

      if (response.status === 201) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', formData.loginType);
        localStorage.setItem('loginTime', new Date().toISOString());
        
        window.dispatchEvent(new Event('storage'));
        navigate('/');
      } else if (response.status === 404) {
        setError('Telefon raqam yoki parol noto\'g\'ri');
      } else if (response.status === 401) {
        setError('Kirish rad etildi. Parolni tekshiring');
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || `Login xatosi: ${response.status}`);
        } catch {
          setError(`Server xatosi: ${response.status}`);
     
          
        }
      }
    } catch (error) {

      setError('Serverga ulanishda xatolik. Internet aloqasini tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  const getLoginTypeName = () => {
    return formData.loginType === 'market' ? 'Market' : 'Deliver';
  };

  const getLoginTypeIcon = () => {
    return formData.loginType === 'market' ? <FaStore /> : <FaTruck />;
  };

  const getLoginTypeDescription = () => {
    return formData.loginType === 'market' 
      ? 'Mahsulotlarni boshqarish va buyurtmalarni qabul qilish tizimi' 
      : 'Yetkazib berish va buyurtmalarni yetkazish tizimi';
  };

  const getFeatures = () => {
    if (formData.loginType === 'market') {
      return [
        {
          icon: <FaShoppingBag />,
          title: 'Mahsulotlar boshqaruvi',
          description: 'Oson va tezkor mahsulot qo\'shish va tahrirlash'
        },
        {
          icon: <FaLockIcon />,
          title: 'Xavfsiz buyurtmalar',
          description: 'Shifrlangan va himoyalangan buyurtma jarayoni'
        },
        {
          icon: <FaCheckCircle />,
          title: 'Real vaqt monitoringi',
          description: 'Buyurtmalarni onlayn kuzatish va boshqarish'
        }
      ];
    } else {
      return [
        {
          icon: <FaTruckLoading />,
          title: 'Yetkazib berish boshqaruvi',
          description: 'Buyurtmalarni samarali taqsimlash va yetkazish'
        },
        {
          icon: <FaBolt />,
          title: 'Tezkor xabar almashish',
          description: 'Marketlar bilan tezkor aloqa va muloqot'
        },
        {
          icon: <FaShieldAlt />,
          title: 'Yo\'l xavfsizligi',
          description: 'Yetkazib berish jarayonida xavfsizlik kafolati'
        }
      ];
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Chap tomon - Tasvir qismi */}
      <div className={styles.illustrationSection}>
        <div className={styles.geometricShapes}>
          <div className={`${styles.shape} ${styles.shape1}`}></div>
          <div className={`${styles.shape} ${styles.shape2}`}></div>
          <div className={`${styles.shape} ${styles.shape3}`}></div>
        </div>
        
        <div className={styles.illustrationContent}>
          <div className={styles.illustrationIcon}>
            {getLoginTypeIcon()}
          </div>
          
          <h1 className={styles.illustrationTitle}>
            {getLoginTypeName()} Tizimiga Xush Kelibsiz
          </h1>
          
          <p className={styles.illustrationSubtitle}>
            {getLoginTypeDescription()}
          </p>
          
          <div className={styles.featureList}>
            {getFeatures().map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.securityNote}>
            <FaShieldAlt className={styles.securityIcon} />
            <span>Barcha maʼlumotlar xavfsiz shifrlangan va himoyalangan</span>
          </div>
        </div>
      </div>

      {/* O'ng tomon - Kirish formasi */}
      <div className={styles.formSection}>
        <Card className={styles.loginCard}>
          <Box className={styles.loginHeader}>
            <div className={styles.iconContainer}>
              <img src="/imgs/Light.png" alt="ToychaUz Logotipi" className={styles.logoImage} />
            </div>
            <Typography variant="h4" component="h1" className={styles.title}>
              ToychaUz {getLoginTypeName()} Tizimi
            </Typography>
            <Typography variant="subtitle1" className={styles.subtitle}>
              Hisobingizga xavfsiz kirish
            </Typography>
          </Box>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            {error && (
              <Alert 
                severity="error" 
                className={styles.alert}
                icon={<FaExclamationTriangle />}
              >
                {error}
              </Alert>
            )}

            {/* Tizim turini tanlash */}
            <Box className={styles.toggleContainer}>
              <button
                type="button"
                className={`${styles.toggleButton} ${formData.loginType === 'market' ? styles.active : ''}`}
                onClick={() => handleLoginTypeChange('market')}
                disabled={loading}
              >
                <div className={styles.toggleIcon}>
                  <FaStore />
                </div>
                <div className={styles.toggleText}>
                  <span className={styles.toggleMainText}>Buyurtmachi</span>
                  <span className={styles.toggleSubText}>Sotuv do'koni</span>
                </div>
              </button>
              <button
                type="button"
                className={`${styles.toggleButton} ${formData.loginType === 'deliver' ? styles.active : ''}`}
                onClick={() => handleLoginTypeChange('deliver')}
                disabled={loading}
              >
                <div className={styles.toggleIcon}>
                  <FaTruck />
                </div>
                <div className={styles.toggleText}>
                  <span className={styles.toggleMainText}>Deliver</span>
                  <span className={styles.toggleSubText}>Yetkazib beruvchi</span>
                </div>
              </button>
            </Box>

            {/* Telefon raqami kiritish */}
            <TextField
  fullWidth
  label="Telefon Raqam:000000000"
  name="phone"
  value={formData.phone}
  onChange={(e) => {
    // Faqat raqamlarni qabul qilish
    const numericValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, phone: numericValue });
  }}
  placeholder="901234567"
  required
  disabled={loading}
  inputProps={{
    inputMode: 'numeric',  // mobil qurilmalarda raqamli klaviatura
    pattern: '[0-9]*',
    maxLength: 9,          // xohlaysizmi 9 raqam
  }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <FaPhone style={{ color: '#B85042' }} />
      </InputAdornment>
    ),
  }}
  className={styles.textField}
/>


            {/* Parol kiritish */}
            <TextField
              fullWidth
              label="Parol:admin"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaLock style={{ color: '#B85042' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                      size="small"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            
            />

            {/* Kirish tugmasi */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              className={styles.loginButton}
              startIcon={
                loading ? (
                  <div className={styles.loadingSpinner}>
                    <CircularProgress size={20} color="inherit" />
                  </div>
                ) : (
                  <FaSignInAlt />
                )
              }
            >
              {loading ? 'Kirilmoqda...' : 'Hisobga kirish'}
            </Button>
          </form>

          {/* Pastki qism */}
          <Box className={styles.loginFooter}>
      
            
            <Typography variant="caption" align="center" className={styles.helpText}>
              Kirishda muammo bo'lsa, qo'llab-quvvatlash: +998 93 945 34 05
            </Typography>
          </Box>
        </Card>
      </div>
    </div>
  );
}

export default Login;