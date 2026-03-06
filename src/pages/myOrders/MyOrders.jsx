import React, { useState, useEffect } from 'react';
import { CircularProgress, Button, Snackbar, Alert, Pagination, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import {
  MdShoppingCart,
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdRefresh,
  MdDoneAll
} from 'react-icons/md';
import styles from './MyOrders.module.css';
import OrderCard from '../../components/orderCard/OrderCard';
import Error from '../../components/error/Error';
import { logaut } from '../logaut';
import { baseURL } from '../config';

// OrderStats komponenti - Buyurtma statistikasini ko'rsatadi
const OrderStats = ({ orders }) => {
  const stats = {
    total: orders.length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    new: orders.filter(order => order.status === 'new').length,
    accepted: orders.filter(order => order.status === 'accepted').length,
    rejected: orders.filter(order => order.status === 'rejected').length
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
            <MdDoneAll  className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberAccepted}`}>
              {stats.accepted}
            </div>
            <div className={styles.statLabel}>Qabul qilingan</div>
          </div>
          <div className={styles.statItem}>
            <MdCancel className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberRejected}`}>
              {stats.rejected}
            </div>
            <div className={styles.statLabel}>Bekor qilingan</div>
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 🎯 YANGI: Pagination state lari
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // 🎯 YANGI: Filter state lari
  const [filters, setFilters] = useState({
    status: 'all' // 'all', 'new', 'accepted', 'delivered'
  });

  // 🎯 Toast notification ni yopish
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 🎯 Mahsulot ma'lumotlarini ID bo'yicha olish
  const fetchProductDetails = async (productId) => {
    try {
      const response = await fetch(`${baseURL}/orders/products/${productId}`, {
        method: "GET",
        credentials: "include"
      });


      logaut(response);

      if (!response.ok) {
        throw new Error(`Mahsulot ma'lumotlarini olishda xatolik: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
     
      return {
        _id: productId,
        name: "Noma'lum mahsulot",
        unit: "dona"
      };
    }
  };

  // 🎯 Buyurtmalarni backenddan yuklash - YANGILANDI
  const fetchOrders = async (page = pagination.page, status = filters.status) => {
    try {
      setLoading(true);
      setError(null);

      // 🎯 Query parametrlarni yaratish
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      // 🎯 Status filter qo'shish (agar 'all' bo'lmasa)
      if (status !== 'all') {
        queryParams.append('status', status);
      }

      const url = `${baseURL}/orders?${queryParams}`;


      const ordersResponse = await fetch(url, {
        method: "GET",
        credentials: "include"
      });


      // logaut(ordersResponse);

      logaut(ordersResponse);

      if (!ordersResponse.ok) {
        throw new Error(`Buyurtmalarni yuklab olishda xatolik: ${ordersResponse.status}`);
      }

      const responseData = await ordersResponse.json();
   

      // 🎯 PAGINATION MA'LUMOTLARINI SAQLASH
      setPagination(prev => ({
        ...prev,
        page: responseData.page,
        total: responseData.total,
        totalPages: Math.ceil(responseData.total / prev.limit)
      }));

      // 🎯 MAHSULOT MA'LUMOTLARINI TO'LDIRISH
      const ordersWithProductDetails = await Promise.all(
        responseData.data.map(async (order) => {
          try {
            const productsWithDetails = await Promise.all(
              order.products.map(async (product) => {
                try {
                  // 🎯 YANGI: productId object bo'lsa, undan name ni olish
                  const productId = product.productId._id || product.productId;
                  const productName = product.productId.name || "Noma'lum mahsulot";
                  
                  // 🎯 Birlik ma'lumotlarini olish
                  const productDetails = await fetchProductDetails(productId);
                  
                  return {
                    ...product,
                    productId: productId, // Faqat ID ni saqlaymiz
                    productName: productName,
                    unit: productDetails.unit || "dona"
                  };
                } catch (error) {
                
                  return {
                    ...product,
                    productId: product.productId._id || product.productId,
                    productName: product.productId.name || "Noma'lum mahsulot",
                    unit: "dona"
                  };
                }
              })
            );

            return {
              ...order,
              products: productsWithDetails
            };
          } catch (error) {
       
            return {
              ...order,
              products: []
            };
          }
        })
      );

      setOrders(ordersWithProductDetails);
      setLoading(false);

    } catch (err) {
     
      setError('Buyurtmalarni yuklab olishda xatolik. Iltimos, keyinroq urinib ko\'ring.');
      setLoading(false);
    }
  };

  // 🎯 Komponent yuklanganda buyurtmalarni olish
  useEffect(() => {
    fetchOrders(1, filters.status);
  }, [filters.status]); // 🎯 Status o'zgarganda qayta yuklash

  // 🎯 Sahifa o'zgartirish
  const handlePageChange = (event, value) => {
    fetchOrders(value, filters.status);
  };

  // 🎯 Status filter o'zgartirish
  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setFilters(prev => ({ ...prev, status: newStatus }));
    // Status o'zgarganda 1-sahifaga qaytamiz
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 🎯 Limit o'zgartirish
  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    // Limit o'zgarganda qayta yuklash
    setTimeout(() => fetchOrders(1, filters.status), 100);
  };

  // 🎯 Buyurtmani yangilash funksiyasi
  const handleUpdateProduct = async (orderId, updatedData) => {
    try {
    
      
      const response = await fetch(`${baseURL}/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          products: updatedData.products
        })
      });
      logaut(response);


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
  
      setSnackbar({
        open: true,
        message: 'Buyurtmani yangilashda xatolik yuz berdi',
        severity: 'error'
      });
      throw error;
    }
  };

  // 🎯 Buyurtmani bekor qilish funksiyasi
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${baseURL}/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include"  
      });
      logaut(response);

      if (!response.ok) {
        throw new Error('Buyurtmani bekor qilishda xatolik');
      }

      // 🎯 Buyurtma o'chirilgandan so'ng qayta yuklash
      fetchOrders(pagination.page, filters.status);

      setSnackbar({
        open: true,
        message: 'Buyurtma muvaffaqiyatli bekor qilindi!',
        severity: 'success'
      });

    } catch (error) {
   
      setSnackbar({
        open: true,
        message: 'Buyurtmani bekor qilishda xatolik yuz berdi',
        severity: 'error'
      });
      throw error;
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

  // 🎯 Xatolik holati - YANGILANDI
  if (error) {
    return (
      <Error 
        error={error} 
        fetchOrders={fetchOrders}
        filters={filters} // filters prop qo'shildi
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* 📊 Statistika - Eng tepada */}
      <OrderStats orders={orders} />

      {/* 🎯 FILTER VA PAGINATION CONTROLS */}
      <div className={styles.controlsSection}>
        <div className={styles.filters}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel
              sx={{
                color: "var(--primary)",
                "&.Mui-focused": {
                  color: "var(--primary)",
                }
              }}
            >
              Status
            </InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={handleStatusChange}
              sx={{
                color: "var(--primary)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--primary)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--primary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--primary)",
                }
              }}
            >
              <MenuItem value="all">Barchasi</MenuItem>
              <MenuItem value="new">Yangi</MenuItem>
              <MenuItem value="accepted">Qabul qilingan</MenuItem>
              <MenuItem value="delivered">Yetkazilgan</MenuItem>
              <MenuItem value="rejected">Bekor qilingan</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel sx={{
              color: "var(--primary)",
              "&.Mui-focused": {
                color: "var(--primary)",
              }
            }}>Limit</InputLabel>
            <Select
              sx={{
                color: "var(--primary)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--primary)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--primary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--primary)",
                }
              }}
              value={pagination.limit}
              label="Limit"
              onChange={handleLimitChange}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* 🔄 Yangilash tugmasi */}
        <Button 
          variant="outlined" 
          onClick={() => fetchOrders(pagination.page, filters.status)}
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
                {filters.status === 'all' ? 'Hali buyurtma yo\'q' : `"${filters.status}" statusidagi buyurtmalar yo'q`}
              </h3>
              <p className={styles.emptyDescription}>
                {filters.status === 'all' 
                  ? 'Birinchi buyurtma qilish uchun "Buyurtma Berish" bo\'limiga o\'ting' 
                  : 'Boshqa statusdagi buyurtmalarni ko\'rish uchun filterni o\'zgartiring'
                }
              </p>
            </div>
          </div>
        ) : (
          <>
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

            {/* 🎯 PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      backgroundColor: "var(--item)",
                      boxShadow: "var(--shadow)",
                      transition: "0.2s",
                    },
                    "& .MuiPaginationItem-root:hover": {
                      backgroundColor: "var(--secondary)",
                      color: "var(--surface)",
                      borderColor: "var(--secondary-dark)",
                    },
                    "& .MuiPaginationItem-root.Mui-selected": {
                      backgroundColor: "var(--primary)",   
                      color: "var(--surface)",
                      borderColor: "var(--primary-dark)",
                      fontWeight: "600",
                    }
                  }}
                />
                <div className={styles.paginationInfo}>
                  {pagination.total} ta buyurtmadan {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} oraligʻi
                </div>
              </div>
            )}
          </>
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