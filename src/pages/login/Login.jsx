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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  FaStore, 
  FaTruck, 
  FaPhone, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaSignInAlt,
  FaExclamationTriangle
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

  // Yangilangan telefon raqam formati (90 166 95 65 - ikkala tur uchun ham)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Faqat raqamlarni qoldirish
    
    // Ikkala tur uchun ham 90 166 95 65 formatida
    if (value.length > 9) value = value.slice(0, 9);
    
    // Formatlash: 90 166 95 65
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

  const handleLoginTypeChange = (e) => {
    const loginType = e.target.value;
    setFormData(prev => ({
      ...prev,
      loginType: loginType,
      phone: ''
    }));
    if (error) setError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Telefon raqamni tozalash (faqat raqamlarni qoldirish)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    if (!cleanPhone || !formData.password) {
      setError('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    // Ikkala tur uchun ham 9 xonali raqam tekshiruvi
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

      // Deliver uchun +998 qo'shish, Market uchun oddiy
      const phoneForApi = formData.loginType === 'market' 
        ? cleanPhone 
        : cleanPhone;

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

          <FormControl fullWidth className={styles.selectField}>
            <InputLabel>Login Turi</InputLabel>
            <Select
              name="loginType"
              value={formData.loginType}
              label="Login Turi"
              onChange={handleLoginTypeChange}
              disabled={loading}
            >
              <MenuItem value="market">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaStore />
                  Market
                </Box>
              </MenuItem>
              <MenuItem value="deliver">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaTruck />
                  Deliver
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

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
                  <FaPhone />
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
                  <FaLock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    disabled={loading}
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
            startIcon={loading ? <CircularProgress size={20} /> : <FaSignInAlt />}
          >
            {loading ? 'Kirilmoqda...' : 'Hisobga kirish'}
          </Button>
        </form>

        <Box className={styles.loginFooter}>
          <Typography variant="body2" color="textSecondary" align="center">
            {getLoginTypeIcon()}
            {getLoginTypeName()} tizimiga kirish
          </Typography>
        </Box>
      </Card>
    </div>
  );
}

export default Login;