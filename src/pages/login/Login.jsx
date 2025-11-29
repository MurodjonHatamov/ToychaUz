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
  FaCheckCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from "./Login.module.css";

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

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

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
        ? 'http://localhost:2277/auth/market-login'
        : 'http://localhost:2277/auth/deliver-login';

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
        const authToken = getCookie('AuthToken');
        
        if (authToken) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userType', formData.loginType);
          localStorage.setItem('loginTime', new Date().toISOString());
          
          window.dispatchEvent(new Event('storage'));
          navigate('/');
        } else {
          setError('Login muvaffaqiyatli, ammo token olinmadi');
        }
      } else {
        if (response.status === 404) {
          setError('Telefon raqam yoki parol noto\'g\'ri');
        } else {
          setError(`Login xatosi: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Login xatosi:', error);
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

  return (
    <div className={styles.loginContainer}>
      {/* Left Side - Illustration */}
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
            {getLoginTypeName()} Boshqaruv Tizimi
          </h1>
          
          <p className={styles.illustrationSubtitle}>
            Zamonaviy va xavfsiz platformaga xush kelibsiz. 
            Biznesni boshqarish endi yanada oson va qulay!
          </p>
          
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaShieldAlt />
              </div>
              <div>Xavfsiz kirish tizimi</div>
            </div>
            
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaBolt />
              </div>
              <div>Tezkor ishlov berish</div>
            </div>
            
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheckCircle />
              </div>
              <div>Oson boshqaruv</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles.formSection}>
        <Card className={styles.loginCard}>
          <Box className={styles.loginHeader}>
            <div className={styles.iconContainer}>
              {getLoginTypeIcon()}
            </div>
            <Typography variant="h4" component="h1" className={styles.title}>
              {getLoginTypeName()} Tizimi
            </Typography>
            <Typography variant="subtitle1" className={styles.subtitle}>
              Hisobingizga kiring
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

            {/* Toggle Button Group */}
            <Box className={styles.toggleContainer}>
              <button
                type="button"
                className={`${styles.toggleButton} ${formData.loginType === 'market' ? styles.active : ''}`}
                onClick={() => handleLoginTypeChange('market')}
                disabled={loading}
              >
                <FaStore />
                Market
              </button>
              <button
                type="button"
                className={`${styles.toggleButton} ${formData.loginType === 'deliver' ? styles.active : ''}`}
                onClick={() => handleLoginTypeChange('deliver')}
                disabled={loading}
              >
                <FaTruck />
                Deliver
              </button>
            </Box>

            <TextField
              fullWidth
              label="Telefon Raqam"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="90 166 95 65"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaPhone style={{ color: '#B85042' }} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
              helperText="90 166 95 65 formatida kiriting"
            />

            <TextField
              fullWidth
              label="Parol"
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

          <Box className={styles.loginFooter}>
            <Typography variant="body2" align="center">
              {getLoginTypeIcon()}
              {getLoginTypeName()} tizimiga kirish
            </Typography>
          </Box>
        </Card>
      </div>
    </div>
  );
}

export default Login;