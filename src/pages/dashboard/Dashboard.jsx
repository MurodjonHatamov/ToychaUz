import React, { useState, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import styles from './Dashboard.module.css';
import ProductCard from '../../components/productCard/ProductCard';
import Cart from '../../components/cart/Cart';
import { IoIosArrowUp } from 'react-icons/io';
import { Button, Snackbar, Alert } from '@mui/material';
import { logaut } from '../logaut';
import { baseURL } from '../config';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [error, setError] = useState(null);

  // 🎯 ORDER YUBORISH HOLATI - YANGILANDI
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });

  // 🎯 Toast notification ni yopish
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 🎯 BACKEND DAN MAHSULOTLARNI OLISH FUNKSIYASI
  const getData = () => {
    fetch(`${baseURL}/orders/products`, {
      method: "GET",
      credentials: "include"
    })
      .then(res => {
  
        // 👉 401 | 402 bo‘lsa to‘g‘ri logout qilish
        logaut(res);
  
        if (!res.ok) {
          throw res; // 👈 res ni throw qilamiz
        }
  
        return res.json();
      })
      .then(products => {
        setProducts(products);
        setLoading(false);
      })
      .catch(err => {
       
  
        // bu yerda faqat umumiy xatolar
        setError('Serverga ulanishda xatolik.');
        setLoading(false);
      });
  };
  

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const addToCart = (productId, quantity) => {
    if (quantity <= 0) return;
    
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { productId, quantity }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => [...prev.filter((i) => i.productId !== productId)]);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // 🎯 BUYURTMA YUBORISH FUNKSIYASI - YANGILANDI
  const placeOrder = async () => {
    if (cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'Savat boʻsh! Iltimos, avval mahsulot qoʻshing.',
        severity: 'warning'
      });
      return;
    }

    try {
      setOrderLoading(true);
      setError(null);

      const orderData = {
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

     

      const response = await fetch(`${baseURL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(orderData)
      });
const getData = () => {
  fetch(`${baseURL}/orders/products`, {
    method: "GET",
    credentials: "include"
  })
    .then(res => {

      // 👉 401 | 402 bo‘lsa to‘g‘ri logout qilish
      logaut(res);

      if (!res.ok) {
        throw res; // 👈 res ni throw qilamiz
      }

      return res.json();
    })
    .then(products => {
      setProducts(products);
      setLoading(false);
    })
    .catch(err => {
 

      // bu yerda faqat umumiy xatolar
      setError('Serverga ulanishda xatolik.');
      setLoading(false);
    });
};
logaut(response);
      if (!response.ok) {
        const errorData = await response.json();
        
        // 🎯 MAXSUL XATOLIKLARNI TEKSHIRISH
        if (response.status === 400 && errorData.message === "daily order creating limit reached") {
          throw new Error('Kunlik buyurtma limitiga yetgansiz. Ertaga qayta urinib koʻring.');
        } else if (response.status === 400) {
          throw new Error(`Noto'g'ri so'rov: ${errorData.message}`);
        } else if (response.status === 401) {
          throw new Error('Avtorizatsiya xatosi. Iltimos, tizimga qayta kiring.');
        } else if (response.status === 500) {
          throw new Error('Server xatosi. Iltimos, keyinroq urinib koʻring.');
        } else {
          throw new Error(`Buyurtma yuborishda xatolik: ${response.status}`);
        }
      }

      const result = await response.json();
  

      // 🎯 MUVAFFAQIYATLI TOAST
      setSnackbar({
        open: true,
        message: 'Buyurtma muvaffaqiyatli yuborildi!',
        severity: 'success'
      });
      
      // 🎯 SAVATNI TOZALASH
      setCart([]);

    } catch (error) {
      
      
      // 🎯 XATOLIK TOAST
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setOrderLoading(false);
    }
  };

  const getUnitText = (unit) => {
    const units = { 
      'kg': 'kg', 
      'liter': 'litr', 
      'piece': 'dona' 
    };
    return units[unit] || unit;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>
          <h3>Xatolik yuz berdi</h3>
          <p>{error}</p>
          <Button 
            variant="contained" 
            onClick={getData}
            className={styles.retryButton}
          >
            Qayta Urinish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      
      {/* 📱 YUQORIGA CHIQISH TUGMASI */}
      {showButton && (
        <Button
          variant="contained"
          onClick={scrollTo}
          className={styles.arrovTop}
        >
          <IoIosArrowUp />
        </Button>
      )}

      {/* 🎴 ASOSIY KONTEYNER */}
      <div className={styles.container}>
        
        {/* 📦 MAHSULOTLAR BO'LIMI */}
        <div className={styles.productsSection}>
          
          {/* 🔍 QIDIRUV QUTISI */}
          <div className={styles.searchBox}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* 🎴 MAHSULOTLAR GRIDI */}
          <div className={styles.productsGrid}>
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
                getUnitText={getUnitText}
              />
            ))}
          </div>

          {/* 🔍 MAHSULOT TOPILMAGAN HOLAT */}
          {filteredProducts.length === 0 && products.length > 0 && (
            <div className={styles.noProducts}>
              <MdSearch size={32} />
              <h3>Mahsulot topilmadi</h3>
            </div>
          )}
        </div>

        {/* 🛒 SAVAT KOMPONENTI */}
        <Cart 
          cart={cart}
          products={products}
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateCartQuantity={updateCartQuantity}
          onPlaceOrder={placeOrder}
          getUnitText={getUnitText}
          orderLoading={orderLoading}
        />
      </div>

      {/* 🎯 TOAST NOTIFICATION */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Dashboard;