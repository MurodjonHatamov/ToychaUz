// MyOrders.js
import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import {
  MdShoppingCart,
  MdCheckCircle,
  MdAccessTime,
  MdCancel
} from 'react-icons/md';
import styles from './MyOrders.module.css';
import OrderCard from '../../components/orderCard/OrderCard';

// Mock ma'lumotlar
const mockProducts = [
  { "_id": "1", "name": "Coca-Cola 1,5", "unit": "dona" },
  { "_id": "2", "name": "Sariyog' 500g", "unit": "dona" },
  { "_id": "3", "name": "Olma", "unit": "kg" },
  { "_id": "4", "name": "Sut", "unit": "litr" },
  { "_id": "5", "name": "Tuxum", "unit": "dona" },
  { "_id": "6", "name": "Tvorog 300gr", "unit": "dona" },
  { "_id": "7", "name": "Tovuq go'shti", "unit": "kg" },
  { "_id": "8", "name": "Mayiz", "unit": "kg" },
  { "_id": "9", "name": "Non", "unit": "dona" },
  { "_id": "10", "name": "Choy", "unit": "dona" },
];

const mockOrders = [
  {
    "_id": "69064ad11d2854575b18ffdf",
    "products": [
      { "productId": "1", "quantity": 20, "_id": "69064ad11d2854575b18ffe0" },
      { "productId": "2", "quantity": 25, "_id": "69064ad11d2854575b18ffe1" },
      { "productId": "3", "quantity": 2, "_id": "69064ad11d2854575b18ffe2" }
    ],
    "status": "new",
    "createdAt": "2025-11-01T18:00:49.577Z",
  },
  {
    "_id": "69078be8156fae69f2254ff3",
    "products": [
      { "productId": "4", "quantity": 12, "_id": "69078be8156fae69f2254ff4" },
      { "productId": "5", "quantity": 30, "_id": "69078be8156fae69f2254ff5" }
    ],
    "status": "delivered",
    "createdAt": "2025-11-02T16:50:48.178Z",
  },
  {
    "_id": "691493cf8a17859b85e95f5f",
    "products": [
      { "productId": "6", "quantity": 5, "_id": "691493cf8a17859b85e95f60" },
      { "productId": "7", "quantity": 3, "_id": "691493cf8a17859b85e95f61" }
    ],
    "status": "cancelled",
    "createdAt": "2025-11-12T14:03:59.805Z",
  }
];

// OrderStats komponenti - Buyurtma statistikasini ko'rsatadi
// OrderStats komponenti - Yangi mobile optimallashtirilgan versiya
const OrderStats = ({ orders }) => {
  const stats = {
    total: orders.length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    new: orders.filter(order => order.status === 'new').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length
  };

  return (
    <div className={styles.statsCard}>
      <div className={styles.statsContent}>
        <h2 className={styles.statsTitle}>Buyurtma Statistikasi</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            {/* Desktop uchun icon, mobile da CSS orqali yashiriladi */}
            <MdShoppingCart className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberPrimary}`}>
              {stats.total}
            </div>
            <div className={styles.statLabel}>Jami Buyurtma</div>
          </div>
          <div className={styles.statItem}>
            <MdCheckCircle className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberSuccess}`}>
              {stats.delivered}
            </div>
            <div className={styles.statLabel}>Yetkazilgan</div>
          </div>
          <div className={styles.statItem}>
            <MdAccessTime className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberWarning}`}>
              {stats.new}
            </div>
            <div className={styles.statLabel}>Yangi</div>
          </div>
          <div className={styles.statItem}>
            <MdCancel className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberCancelled}`}>
              {stats.cancelled}
            </div>
            <div className={styles.statLabel}>Ko'rib chiqilgan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Asosiy MyOrders komponenti (SAHIFA)
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Buyurtmalarni yuklash (useEffect)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setTimeout(() => {
          const ordersWithProducts = mockOrders.map(order => ({
            ...order,
            products: order.products.map(product => {
              const productInfo = mockProducts.find(p => p._id === product.productId);
              return {
                ...product,
                productName: productInfo?.name || "Noma'lum mahsulot",
                unit: productInfo?.unit || "dona"
              };
            })
          }));
          setOrders(ordersWithProducts);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Buyurtmalarni yuklab olishda xatolik');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Mahsulotni yangilash funksiyasi
  const handleUpdateProduct = (orderId, updatedProduct) => {
    const updatedOrders = orders.map(order => {
      if (order._id === orderId) {
        const updatedProducts = order.products.map(product =>
          product._id === updatedProduct._id ? updatedProduct : product
        );
        return { ...order, products: updatedProducts };
      }
      return order;
    });
    setOrders(updatedOrders);
  };

  // ✅ Mahsulotni o'chirish funksiyasi
  const handleDeleteProduct = (orderId, productId) => {
    const updatedOrders = orders.map(order => {
      if (order._id === orderId) {
        const updatedProducts = order.products.filter(product => product._id !== productId);
        return { ...order, products: updatedProducts };
      }
      return order;
    });
    setOrders(updatedOrders);
  };

  // ✅ Yangi mahsulot qo'shish funksiyasi
  const handleAddProduct = (orderId, newProduct) => {
    const updatedOrders = orders.map(order => {
      if (order._id === orderId) {
        return { 
          ...order, 
          products: [...order.products, newProduct] 
        };
      }
      return order;
    });
    setOrders(updatedOrders);
  };

  // ✅ Buyurtmani bekor qilish funksiyasi
  const handleCancelOrder = (orderId) => {
    const updatedOrders = orders.map(order => 
      order._id === orderId 
        ? { ...order, status: 'cancelled' }
        : order
    );
    setOrders(updatedOrders);
  };

  // ✅ Yuklanayotgan holat
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress className={styles.spinner} />
        <div className={styles.loadingText}>
          Buyurtmalar yuklanmoqda...
        </div>
      </div>
    );
  }

  // ✅ Xatolik holati
  if (error) {
    return (
      <div className={styles.errorAlert}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.container}>
    

      {/* 📊 Statistika - Eng tepada */}
      <OrderStats orders={orders} />

      {/* 📦 Asosiy kontent */}
      <div className={styles.content}>
        {orders.length === 0 ? (
          // 🎯 Bo'sh holat
          <div className={styles.emptyCard}>
            <div className={styles.emptyContent}>
              <MdShoppingCart className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>
                Hali buyurtma yo'q
              </h3>
              <p className={styles.emptyDescription}>
                Birinchi buyurtma qilish uchun "Buyurtma Berish" bo'limiga o'ting
              </p>
            </div>
          </div>
        ) : (
          // 📋 Buyurtmalar ro'yxati
          <div className={styles.ordersGrid}>
            {orders.map((order) => (
              <OrderCard 
                key={order._id}
                order={order} 
                mockProducts={mockProducts}
                // 🔧 Funksiyalar OrderCard ga yuboriladi
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddProduct={handleAddProduct}
                onCancelOrder={handleCancelOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;