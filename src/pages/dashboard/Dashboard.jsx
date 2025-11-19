import React, { useState, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import styles from './Dashboard.module.css';
import ProductCard from '../../components/productCard/ProductCard';
import Cart from '../../components/cart/Cart';
import { IoIosArrowUp } from 'react-icons/io';
import { Button } from '@mui/material';

function Dashboard() {
  // 🎯 STATE LAR - Komponentning holatlari
  
  // products: Backenddan kelgan mahsulotlar ro'yxati
  const [products, setProducts] = useState([]);
  
  // cart: Foydalanuvchi savatiga qo'shilgan mahsulotlar
  const [cart, setCart] = useState([]);
  
  // searchTerm: Qidiruv inputida yozilgan matn
  const [searchTerm, setSearchTerm] = useState('');
  
  // loading: Ma'lumotlar yuklanayotganligini ko'rsatadi
  const [loading, setLoading] = useState(true);
  
  // showButton: "Yuqoriga" tugmasini ko'rsatish yoki yashirish
  const [showButton, setShowButton] = useState(false);
  
  // error: Xatolik xabari, agar backend ulanishda muammo bo'lsa
  const [error, setError] = useState(null);

  // 🎯 ORDER YUBORISH HOLATI
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);


  // 🎯 BACKEND DAN MAHSULOTLARNI OLISH FUNKSIYASI
  const getData = () => {
    // Backend API ga so'rov yuborish
    fetch("http://localhost:2277/orders/products", {
      method: "GET", // GET so'rovi - ma'lumot olish uchun
      credentials: "include" // Cookie bilan authentication
    })
    .then(res => {
      // Server javobini tekshirish
      if (!res.ok) {
        throw new Error('Serverda xatolik');
      }
      return res.json(); // JSON formatida ma'lumot olish
    })
    .then(products => {
      // Ma'lumotlar muvaffaqiyatli olganda
      setProducts(products); // Mahsulotlarni state ga saqlash
      setLoading(false); // Yuklanish tugadi
      console.log('Mahsulotlar yuklandi:', products); // Debug uchun
    })
    .catch(err => {
      // Xatolik yuz berganda
      console.error('Xato:', err);
      setError('Serverga ulanishda xatolik. Iltimos, keyinroq urinib ko\'ring.');
      setLoading(false); // Yuklanish tugadi (xato bilan)
    });
  };


  // 🎯 USE EFFECT - KOMPONENT YUKLANGANDA ISHGA TUSHADI
  useEffect(() => {
    getData(); // Komponent yuklanganida mahsulotlarni yuklash
  }, []); // Bo'sh dependency array - faqat bir marta ishlaydi

  // 🎯 SCROLL KUZATISH - FOYDALANUVCHI SCROLL QILGANDA
  useEffect(() => {
    const handleScroll = () => {
      // Agar foydalanuvchi 200px dan ko'p scroll qilsa
      if (window.scrollY > 200) { 
        setShowButton(true); // "Yuqoriga" tugmasini ko'rsat
      } else {
        setShowButton(false); // Tugmani yashir
      }
    };

    // Scroll hodisasini kuzatish
    window.addEventListener("scroll", handleScroll);
    
    // Tozalash funksiyasi - komponent olib tashlanganda event listener ni olib tashlash
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Faqat bir marta ishlaydi

  // 🎯 YUQORIGA SCROLL QILISH
  const scrollTo = () => {
    window.scrollTo({
      top: 0, // Sahifa boshiga
      behavior: "smooth", // Smoot scroll animatsiyasi
    });
  };

  // 🎯 SAVATGA MAHSULOT QO'SHISH
  const addToCart = (productId, quantity) => {
    if (quantity <= 0) return; // Miqdor 0 yoki undan kichik bo'lsa, hech narsa qilma
    
    setCart(prev => {
      // Savatda shu mahsulot bormi?
      const existingItem = prev.find(item => item.productId === productId);
      
      if (existingItem) {
        // Agar bor bo'lsa, miqdorini yangila
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      // Agar yangi mahsulot bo'lsa, savatga qo'sh
      return [...prev, { productId, quantity }];
    });
  };

  // 🎯 SAVATDAN MAHSULOTNI O'CHIRISH
  const handleRemoveFromCart = (productId) => {
    setCart((prev) => [...prev.filter((i) => i.productId !== productId)]);
    // Filter orqali faqat o'chirilayotgan mahsulotdan boshqalarini qoldir
  };

  // 🎯 SAVATDA MIQDORNI YANGILASH
  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      // Agar miqdor 1 dan kichik bo'lsa, mahsulotni o'chir
      handleRemoveFromCart(productId);
      return;
    }
    
    // Mahsulot miqdorini yangila
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // 🎯 BUYURTMA YUBORISH FUNKSIYASI
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Savat boʻsh! Iltimos, avval mahsulot qoʻshing.');
      return;
    }

    try {
      setOrderLoading(true); // Yuklanish holatini yoqish
      setError(null); // Avvalgi xatoliklarni tozalash

      // 🎯 Backendga yuboriladigan buyurtma formati
      const orderData = {
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      console.log('Yuborilayotgan buyurtma:', orderData);

      // 🎯 Backend API ga POST so'rovi
      const response = await fetch("http://localhost:2277/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Cookie bilan authentication
        body: JSON.stringify(orderData)
      });

      // 🎯 Server javobini tekshirish
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Buyurtma yuborishda xatolik: ${response.status} - ${errorText}`);
      }

      // 🎯 Muvaffaqiyatli javob
      const result = await response.json();
      console.log('Buyurtma muvaffaqiyatli yuborildi:', result);

      // 🎯 Foydalanuvchiga muvaffaqiyat xabari
      setOrderSuccess(true);
      
      // 🎯 Savatni tozalash
      setCart([]);
      
      // 🎯 3 soniyadan so'ng muvaffaqiyat xabarini yashirish
      setTimeout(() => {
        setOrderSuccess(false);
      }, 3000);

    } catch (error) {
      // 🎯 Xatolik yuz berganda
      console.error('Buyurtma yuborishda xatolik:', error);
      setError(`Buyurtma yuborishda xatolik: ${error.message}`);
    } finally {
      // 🎯 Yuklanish holatini o'chirish
      setOrderLoading(false);
    }
  };

  // 🎯 BIRLIK MATNLARINI O'ZBEK TILIGA O'GIRISH
  const getUnitText = (unit) => {
    const units = { 
      'kg': 'kg', 
      'liter': 'litr', 
      'piece': 'dona' 
    };
    return units[unit] || unit; // Agar birlik ro'yxatda bo'lmasa, asl holida qaytar
  };

  // 🎯 QIDIRUV BO'YICHA MAHSULOTLARNI FILTRLASH
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
    // Mahsulot nomi qidiruv matnini o'z ichiga oladigan mahsulotlarni qaytar
  );

  // 🎯 YUKLANAYOTGAN HOLAT - SPINNER KO'RSATISH
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

  // 🎯 XATOLIK HOLATI - BACKEND ULANMAGANDA
  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>
          <h3>Xatolik yuz berdi</h3>
          <p>{error}</p>
          <Button 
            variant="contained" 
            onClick={getData} // Qayta urinish tugmasi
            className={styles.retryButton}
          >
            Qayta Urinish
          </Button>
        </div>
      </div>
    );
  }

  // 🎯 ASOSIY RENDER - NORMAL HOLATDA KO'RSATILADIGAN CONTENT
  return (
    <div className={styles.dashboard}>
      
      {/* ✅ BUYURTMA MUVAFFAQIYATLI YUBORILGANDA KO'RSATILADIGAN XABAR */}
      {orderSuccess && (
        <div className={styles.successMessage}>
          <div className={styles.successContent}>
            <span className={styles.successIcon}>✅</span>
            <div>
              <h4>Buyurtma muvaffaqiyatli qabul qilindi!</h4>
              <p>Sizning buyurtmangiz qabul qilindi va tez orada qayta ishlanadi.</p>
            </div>
          </div>
        </div>
      )}

      {/* 📱 YUQORIGA CHIQISH TUGMASI - FAQAT SCROLL QILINGANDA KO'RINADI */}
      {showButton && (
        <Button
          variant="contained"
          onClick={scrollTo}
          className={styles.arrovTop}
        >
          <IoIosArrowUp />
        </Button>
      )}

      {/* 🎴 ASOSIY KONTEYNER - MAHSULOTLAR VA SAVAT */}
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
              onChange={(e) => setSearchTerm(e.target.value)} // Input o'zgarganda state ni yangila
              className={styles.searchInput}
            />
          </div>

          {/* 🎴 MAHSULOTLAR GRIDI */}
          <div className={styles.productsGrid}>
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id} // Har bir mahsulot uchun unique key
                product={product} // Mahsulot ma'lumotlari
                onAddToCart={addToCart} // Savatga qo'shish funksiyasi
                getUnitText={getUnitText} // Birlik matnini o'girish funksiyasi
              />
            ))}
          </div>

          {/* 🔍 MAHSULOT TOPILMAGAN HOLAT */}
          {filteredProducts.length === 0 && products.length > 0 && (
            <div className={styles.noProducts}>
              <MdSearch size={32} />
              <h3>Mahsulot topilmadi</h3>
              {/* Qidiruv natijasi bo'sh, lekin aslida mahsulotlar mavjud */}
            </div>
          )}
        </div>

        {/* 🛒 SAVAT KOMPONENTI */}
        <Cart 
          cart={cart} // Savatdagi mahsulotlar
          products={products} // Barcha mahsulotlar (nomlarni ko'rsatish uchun)
          onRemoveFromCart={handleRemoveFromCart} // O'chirish funksiyasi
          onUpdateCartQuantity={updateCartQuantity} // Miqdorni yangilash funksiyasi
          onPlaceOrder={placeOrder} // 🆕 Buyurtma yuborish funksiyasi
          getUnitText={getUnitText} // Birlik matnini o'girish funksiyasi
          orderLoading={orderLoading} // 🆕 Buyurtma yuborilayotganligi
        />
      </div>
    </div>
  );
}

export default Dashboard;