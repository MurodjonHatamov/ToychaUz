import React, { useState } from 'react';
import { 
  TextField, Button, Card, Typography, Box, Alert,
  CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { 
  FaStore, FaTruck, FaPhone, FaLock, FaEye, FaEyeSlash,
  FaSignInAlt, FaExclamationTriangle, FaShieldAlt, FaBolt,
  FaCheckCircle, FaShoppingBag, FaTruckLoading
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from "./Login.module.css";
import { baseURL } from '../config';

function Login() {
  const navigate = useNavigate();
  
  // State'lar
  const [formData, setFormData] = useState({
    loginType: 'market',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ma'lumotlarni yangilash
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Telefon raqamini formatlash (90 123 45 67)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) value = value.slice(0, 9);
    
    let formatted = value;
    if (value.length > 2) formatted = `${value.slice(0, 2)} ${value.slice(2)}`;
    if (value.length > 5) formatted = `${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5)}`;
    if (value.length > 7) formatted = `${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 7)} ${value.slice(7)}`;
    
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (error) setError('');
  };

  // Tizim turini o'zgartirish
  const handleLoginTypeChange = (type) => {
    setFormData(prev => ({ ...prev, loginType: type, phone: '' }));
    if (error) setError('');
  };

  // Kirish funksiyasi
  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    if (!cleanPhone || !formData.password) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    if (cleanPhone.length !== 9) {
      setError("Iltimos, 9 xonali telefon raqamini kiriting (masalan: 90 166 95 65)");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = formData.loginType === 'market' ? 'market-login' : 'deliver-login';
      const response = await fetch(`${baseURL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        credentials: 'include',
        body: JSON.stringify({
          phone: cleanPhone,
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
        setError("Telefon raqam yoki parol noto'g'ri");
      } else if (response.status === 401) {
        setError("Kirish rad etildi. Parolni tekshiring");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Login xatosi: ${response.status}`);
      }
    } catch (err) {
      setError("Serverga ulanishda xatolik. Internet aloqasini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  // UI uchun dinamik ma'lumotlar
  const isMarket = formData.loginType === 'market';
  
  const features = isMarket ? [
    { icon: <FaShoppingBag />, title: "Mahsulotlar boshqaruvi", desc: "Oson va tezkor mahsulot qo'shish va tahrirlash" },
    { icon: <FaLock />, title: "Xavfsiz buyurtmalar", desc: "Shifrlangan va himoyalangan buyurtma jarayoni" },
    { icon: <FaCheckCircle />, title: "Real vaqt monitoringi", desc: "Buyurtmalarni onlayn kuzatish va boshqarish" }
  ] : [
    { icon: <FaTruckLoading />, title: "Yetkazib berish boshqaruvi", desc: "Buyurtmalarni samarali taqsimlash va yetkazish" },
    { icon: <FaBolt />, title: "Tezkor xabar almashish", desc: "Marketlar bilan tezkor aloqa va muloqot" },
    { icon: <FaShieldAlt />, title: "Yo'l xavfsizligi", desc: "Yetkazib berish jarayonida xavfsizlik kafolati" }
  ];

  return (
    <div className={styles.loginContainer}>
      
      {/* Chap tomon - Tasvir qismi */}
      <div className={styles.illustrationSection}>
        <div className={styles.geometricShapes}>
          <div className={`${styles.shape} ${styles.shape1}`} />
          <div className={`${styles.shape} ${styles.shape2}`} />
          <div className={`${styles.shape} ${styles.shape3}`} />
        </div>
        
        <div className={styles.illustrationContent}>
          <div className={styles.illustrationIcon}>
            {isMarket ? <FaStore /> : <FaTruck />}
          </div>
          
          <h1 className={styles.illustrationTitle}>
            {isMarket ? 'Market' : 'Deliver'} Tizimiga Xush Kelibsiz
          </h1>
          
          <p className={styles.illustrationSubtitle}>
            {isMarket 
              ? "Mahsulotlarni boshqarish va buyurtmalarni qabul qilish tizimi" 
              : "Yetkazib berish va buyurtmalarni yetkazish tizimi"}
          </p>
          
          <div className={styles.featureList}>
            {features.map((feature, idx) => (
              <div key={idx} className={styles.featureItem}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.desc}</p>
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
              ToychaUz {isMarket ? 'Market' : 'Deliver'} Tizimi
            </Typography>
            <Typography variant="subtitle1" className={styles.subtitle}>
              Hisobingizga xavfsiz kirish
            </Typography>
          </Box>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            {error && (
              <Alert severity="error" className={styles.alert} icon={<FaExclamationTriangle />}>
                {error}
              </Alert>
            )}

            {/* Tizim turini tanlash */}
            <Box className={styles.toggleContainer}>
              <button
                type="button"
                className={`${styles.toggleButton} ${isMarket ? styles.active : ''}`}
                onClick={() => handleLoginTypeChange('market')}
                disabled={loading}
              >
                <div className={styles.toggleIcon}><FaStore /></div>
                <div className={styles.toggleText}>
                  <span className={styles.toggleMainText}>Buyurtmachi</span>
                  <span className={styles.toggleSubText}>Sotuv do'koni</span>
                </div>
              </button>
              
              <button
                type="button"
                className={`${styles.toggleButton} ${!isMarket ? styles.active : ''}`}
                onClick={() => handleLoginTypeChange('deliver')}
                disabled={loading}
              >
                <div className={styles.toggleIcon}><FaTruck /></div>
                <div className={styles.toggleText}>
                  <span className={styles.toggleMainText}>Deliver</span>
                  <span className={styles.toggleSubText}>Yetkazib beruvchi</span>
                </div>
              </button>
            </Box>

            {/* Telefon raqami */}
            <TextField
              fullWidth
              label="Telefon Raqam: 90 123 45 67"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="90 123 45 67"
              required
              disabled={loading}
              inputProps={{ inputMode: 'numeric', maxLength: 12 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaPhone style={{ color: '#B85042' }} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            />

            {/* Parol */}
            <TextField
              fullWidth
              label="Parol: admin"
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
                      onClick={() => setShowPassword(!showPassword)}
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
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaSignInAlt />}
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