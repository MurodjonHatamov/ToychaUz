import React, { useState, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import styles from './Dashboard.module.css';
import ProductCard from '../../components/productCard/ProductCard';
import Cart from '../../components/cart/Cart';
import { IoIosArrowUp } from 'react-icons/io';
import { Button } from '@mui/material';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);

  const mockProducts = [
    { "_id": "1", "name": "Coca-Cola 1,5", "unit": "piece" },
    { "_id": "2", "name": "Sariyog' 500g", "unit": "piece" },
    { "_id": "3", "name": "Olma", "unit": "kg" },
    { "_id": "4", "name": "Sut", "unit": "liter" },
    { "_id": "5", "name": "Tuxum", "unit": "piece" },
    { "_id": "6", "name": "Tvorog 300gr", "unit": "piece" },
    { "_id": "7", "name": "Tovuq go'shti", "unit": "kg" },
    { "_id": "8", "name": "Mayiz", "unit": "kg" },
    { "_id": "9", "name": "Non", "unit": "piece" },
    { "_id": "10", "name": "Choy", "unit": "piece" },
    { "_id": "11", "name": "Kartoshka", "unit": "kg" },
    { "_id": "12", "name": "Sabzi", "unit": "kg" },
    { "_id": "13", "name": "Piyoz", "unit": "kg" },
    { "_id": "14", "name": "Banan", "unit": "kg" },
    { "_id": "15", "name": "Shaftoli", "unit": "kg" },
  ];

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  // Scroll kuzatish
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) { 
        setShowButton(true);
      } else {
        setShowButton(false);
      }
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

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Savat boʻsh!');
      return;
    }

    try {
      const orderData = { products: cart };
      console.log('Buyurtma:', orderData);
      alert(`Buyurtma qabul qilindi!\n${cart.length} ta mahsulot`);
      setCart([]);
    } catch (error) {
      alert('Xato yuz berdi');
    }
  };

  const getUnitText = (unit) => {
    const units = { 'kg': 'kg', 'liter': 'litr', 'piece': 'dona' };
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

  return (
    <div className={styles.dashboard}>


     
      <Button
              variant="contained"
            
              onClick={scrollTo}
              className={styles.arrovTop}
            >
          <IoIosArrowUp />
            </Button>
  

      <div className={styles.container}>
        <div className={styles.productsSection}>
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

          {filteredProducts.length === 0 && (
            <div className={styles.noProducts}>
              <MdSearch size={32} />
              <h3>Mahsulot topilmadi</h3>
            </div>
          )}
        </div>

        <Cart 
          cart={cart}
          products={products}
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateCartQuantity={updateCartQuantity}
          onPlaceOrder={placeOrder}
          getUnitText={getUnitText}
        />
      </div>
    </div>
  );
}

export default Dashboard;