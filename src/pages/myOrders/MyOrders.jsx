import React, { useState, useEffect } from 'react';
import { CircularProgress, Button, Snackbar, Alert } from '@mui/material';
import {
  MdShoppingCart,
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdRefresh
} from 'react-icons/md';
import styles from './MyOrders.module.css';
import OrderCard from '../../components/orderCard/OrderCard';

// OrderStats komponenti - Buyurtma statistikasini ko'rsatadi
const OrderStats = ({ orders }) => {
  const stats = {
    total: orders.length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    new: orders.filter(order => order.status === 'new').length,
    accepted: orders.filter(order => order.status === 'accepted').length
  };

  return (
    <div className={styles.statsCard}>
      <div className={styles.statsContent}>
        <h2 className={styles.statsTitle}>Buyurtma Statistikasi</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
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
              {stats.accepted}
            </div>
            <div className={styles.statLabel}>Qabul qilingan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Asosiy MyOrders komponenti
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // 🎯 Yangi: Yangilanish jarayonidagi buyurtma ID si
  const [snackbar, setSnackbar] = useState({ // 🎯 Yangi: Toast notification state
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });

  // 🎯 Toast notification ni yopish
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 🎯 Mahsulot ma'lumotlarini ID bo'yicha olish
  const fetchProductDetails = async (productId) => {
    try {
      const response = await fetch(`http://localhost:2277/orders/products/${productId}`, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Mahsulot ma'lumotlarini olishda xatolik: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Mahsulot ${productId} uchun xato:`, error);
      return {
        _id: productId,
        name: "Noma'lum mahsulot",
        unit: "dona"
      };
    }
  };

  // 🎯 Buyurtmalarni backenddan yuklash
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersResponse = await fetch("http://localhost:2277/orders", {
        method: "GET",
        credentials: "include"
      });

      if (!ordersResponse.ok) {
        throw new Error(`Buyurtmalarni yuklab olishda xatolik: ${ordersResponse.status}`);
      }

      const ordersData = await ordersResponse.json();

      // Mahsulot ma'lumotlarini to'ldirish
      const ordersWithProductDetails = await Promise.all(
        ordersData.map(async (order) => {
          const productsWithDetails = await Promise.all(
            order.products.map(async (product) => {
              try {
                const productDetails = await fetchProductDetails(product.productId);
                return {
                  ...product,
                  productName: productDetails.name,
                  unit: productDetails.unit
                };
              } catch (error) {
                console.error(`Mahsulot ${product.productId} uchun xato:`, error);
                return {
                  ...product,
                  productName: "Noma'lum mahsulot",
                  unit: "dona"
                };
              }
            })
          );

          return {
            ...order,
            products: productsWithDetails
          };
        })
      );

      setOrders(ordersWithProductDetails);
      setLoading(false);

    } catch (err) {
      console.error('Buyurtmalarni yuklashda xatolik:', err);
      setError('Buyurtmalarni yuklab olishda xatolik. Iltimos, keyinroq urinib ko\'ring.');
      setLoading(false);
    }
  };

  // 🎯 Komponent yuklanganda buyurtmalarni olish
  useEffect(() => {
    fetchOrders();
  }, []);

  // 🎯 Buyurtmani yangilash funksiyasi - YANGILANDI 
// 🎯 Buyurtmani yangilash funksiyasi
const handleUpdateProduct = async (orderId, updatedData) => {
  try {
    console.log('Yangilanish so\'rovi:', { orderId, updatedData });
    
    const response = await fetch(`http://localhost:2277/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        products: updatedData.products
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Buyurtmani yangilashda xatolik: ${response.status} - ${errorText}`);
    }

    const updatedOrder = await response.json();

    // Mahsulot ma'lumotlarini to'ldirish
    const productsWithDetails = await Promise.all(
      updatedOrder.products.map(async (product) => {
        try {
          const productDetails = await fetchProductDetails(product.productId);
          return {
            ...product,
            productName: productDetails.name,
            unit: productDetails.unit
          };
        } catch (error) {
          console.error(`Mahsulot ${product.productId} uchun xato:`, error);
          return {
            ...product,
            productName: "Noma'lum mahsulot",
            unit: "dona"
          };
        }
      })
    );

    // Local state ni yangilash
    const updatedOrders = orders.map(order =>
      order._id === orderId
        ? { ...updatedOrder, products: productsWithDetails }
        : order
    );
    setOrders(updatedOrders);

    setSnackbar({
      open: true,
      message: 'Buyurtma muvaffaqiyatli yangilandi!',
      severity: 'success'
    });

  } catch (error) {
    console.error('Buyurtmani yangilashda xatolik:', error);
    setSnackbar({
      open: true,
      message: 'Buyurtmani yangilashda xatolik yuz berdi',
      severity: 'error'
    });
    throw error; // 🎯 OrderCard ga xatolikni uzatish uchun
  }
};

// 🎯 Buyurtmani bekor qilish funksiyasi
const handleCancelOrder = async (orderId) => {
  try {
    const response = await fetch(`http://localhost:2277/orders/${orderId}`, {
      method: "DELETE",
      credentials: "include"  
    });

    if (!response.ok) {
      throw new Error('Buyurtmani bekor qilishda xatolik');
    }

    const updatedOrders = orders.filter(order => order._id !== orderId);
    setOrders(updatedOrders);

    setSnackbar({
      open: true,
      message: 'Buyurtma muvaffaqiyatli bekor qilindi!',
      severity: 'success'
    });

  } catch (error) {
    console.error('Buyurtmani bekor qilishda xatolik:', error);
    setSnackbar({
      open: true,
      message: 'Buyurtmani bekor qilishda xatolik yuz berdi',
      severity: 'error'
    });
    throw error; // 🎯 OrderCard ga xatolikni uzatish uchun
  }
};


  // 🎯 Yuklanayotgan holat
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

  // 🎯 Xatolik holati
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Xatolik yuz berdi</h3>
          <p>{error}</p>
          <Button 
            variant="contained" 
            onClick={fetchOrders}
            startIcon={<MdRefresh />}
            className={styles.retryButton}
          >
            Qayta Urinish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 📊 Statistika - Eng tepada */}
      <OrderStats orders={orders} />

      {/* 🔄 Yangilash tugmasi */}
      <div className={styles.refreshSection}>
        <Button 
          variant="outlined" 
          onClick={fetchOrders}
          startIcon={<MdRefresh />}
          className={styles.refreshButton}
        >
          Yangilash
        </Button>
      </div>

      {/* 📦 Asosiy kontent */}
      <div className={styles.content}>
        {orders.length === 0 ? (
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
          <div className={styles.ordersGrid}>
            {orders.map((order) => (
              <OrderCard 
              key={order._id}
  order={order} 
  onUpdateProduct={handleUpdateProduct}
  onCancelOrder={handleCancelOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* 🎯 Toast Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default MyOrders;