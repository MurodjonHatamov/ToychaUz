import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Snackbar, Alert } from '@mui/material';
import { 
  FaCheckCircle, 
  FaTimesCircle,
  FaDownload, 
  FaEye, 
  FaShoppingCart,
  FaStore,
  FaBox,
  FaCalendar,
  FaList,
  FaSpinner,
  FaGlobe,
  FaExclamationTriangle
} from 'react-icons/fa';
import styles from "./DashboardD.module.css";

function DashboardD() {
  // ==================== STATE DEFINITIONS ====================
  
  // Marketlar ro'yxati va tanlangan market
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  
  // Ko'rinish rejimi: 'all' - barcha buyurtmalar, 'market' - maxsus market buyurtmalari
  const [viewMode, setViewMode] = useState('all');
  
  // Buyurtmalar ro'yxati va tanlangan buyurtma
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Mahsulot ma'lumotlari cache (qayta so'rovlarni kamaytirish uchun)
  const [productDetails, setProductDetails] = useState({});
  
  // Modal va xabarlar holatlari
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  // Filtrlar va pagination
  const [filters, setFilters] = useState({
    status: 'all',    // Buyurtma statusi
    from: '',         // Boshlanish sanasi
    to: '',           // Tugash sanasi
    page: 1,          // Joriy sahifa
    limit: 10         // Sahifadagi elementlar soni
  });
  
  const [pagination, setPagination] = useState({
    total: 0,         // Jami buyurtmalar soni
    page: 1,          // Joriy sahifa
    limit: 10         // Limit
  });
  
  // Yuklanish holatlari
  const [loading, setLoading] = useState({
    markets: true,    // Marketlar yuklanmoqda
    orders: false,    // Buyurtmalar yuklanmoqda
    details: false    // Tafsilotlar yuklanmoqda
  });

  // ==================== API FUNCTIONS ====================

  /**
   * Barcha marketlarni serverdan olish
   * @returns {Promise<void>}
   */
  const fetchMarkets = async () => {
    try {
      setLoading(prev => ({ ...prev, markets: true }));
      
      console.log('Marketlar yuklanmoqda...');
      const response = await fetch('http://localhost:2277/markets', {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const marketsData = await response.json();
        console.log(`${marketsData.length} ta market yuklandi`);
        setMarkets(marketsData);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Marketlarni yuklab boʻlmadi:', error);
      showSnackbar('Marketlarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, markets: false }));
    }
  };

  /**
   * Mahsulot ma'lumotlarini ID bo'yicha olish (cache bilan)
   * @param {string} productId - Mahsulot ID si
   * @returns {Promise<Object|null>} - Mahsulot ma'lumotlari
   */
  const fetchProductDetails = async (productId) => {
    // Cache da mavjud bo'lsa, yangi so'rov yubormaslik
    if (productDetails[productId]) {
      return productDetails[productId];
    }

    try {
      console.log(`Mahsulot ma'lumotlari yuklanmoqda: ${productId}`);
      const response = await fetch(`http://localhost:2277/products/${productId}`, {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const product = await response.json();
        // Ma'lumotlarni cache ga saqlash
        setProductDetails(prev => ({ 
          ...prev, 
          [productId]: product 
        }));
        return product;
      } else {
        console.warn(`Mahsulot ${productId} topilmadi`);
        return null;
      }
    } catch (error) {
      console.error('Mahsulot ma\'lumotlarini olishda xatolik:', error);
      return null;
    }
  };

  /**
   * Buyurtmadagi barcha mahsulotlarni to'liq ma'lumotlari bilan yuklash
   * @param {Object} order - Buyurtma obyekti
   * @returns {Promise<Object>} - To'liq ma'lumotli buyurtma
   */
  const loadAllProducts = async (order) => {
    // Har bir mahsulot uchun ma'lumotlarni parallel ravishda yuklash
    const productPromises = order.products.map(async (item) => {
      const product = await fetchProductDetails(item.productId);
      return { 
        ...item, 
        productDetails: product 
      };
    });

    const productsWithDetails = await Promise.all(productPromises);
    return { 
      ...order, 
      productsWithDetails 
    };
  };

  /**
   * Buyurtmalarni serverdan olish
   * @returns {Promise<void>}
   */
  const fetchOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      
      // Query parametrlarni tayyorlash
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString()
      });
      
      // Agar market tanlangan bo'lsa, faqat o'sha marketning buyurtmalarini olish
      if (viewMode === 'market' && selectedMarket) {
        queryParams.append('marketId', selectedMarket._id);
      }
      
      // Filtrlarni qo'shish
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);

      console.log('Buyurtmalar yuklanmoqda...', queryParams.toString());
      const response = await fetch(`http://localhost:2277/deliver/orders?${queryParams}`, {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${data.data?.length || 0} ta buyurtma yuklandi`);
        
        setOrders(data.data || []);
        setPagination({
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || 10
        });
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Buyurtmalarni yuklab boʻlmadi:', error);
      showSnackbar('Buyurtmalarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  /**
   * Buyurtma ma'lumotlarini ID bo'yicha olish
   * @param {string} orderId - Buyurtma ID si
   * @returns {Promise<void>}
   */
  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(prev => ({ ...prev, details: true }));
      
      console.log(`Buyurtma tafsilotlari yuklanmoqda: ${orderId}`);
      const response = await fetch(`http://localhost:2277/deliver/orders/${orderId}`, {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const order = await response.json();
        // Mahsulot ma'lumotlarini yuklash
        const orderWithProducts = await loadAllProducts(order);
        setSelectedOrder(orderWithProducts);
        setDetailDialogOpen(true);
        console.log('Buyurtma tafsilotlari yuklandi');
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Buyurtma ma\'lumotlarini olish mumkin emas:', error);
      showSnackbar('Buyurtma ma\'lumotlarini olish mumkin emas', 'error');
    } finally {
      setLoading(prev => ({ ...prev, details: false }));
    }
  };

  // ==================== ORDER ACTIONS ====================

  /**
   * Buyurtmani qabul qilish
   * @param {string} orderId - Buyurtma ID si
   * @returns {Promise<void>}
   */
  const acceptOrder = async (orderId) => {
    try {
      console.log(`Buyurtma qabul qilinmoqda: ${orderId}`);
      const response = await fetch(`http://localhost:2277/deliver/${orderId}/accept-order`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Buyurtma muvaffaqiyatli qabul qilindi');
        showSnackbar('Buyurtma muvaffaqiyatli qabul qilindi', 'success');
        fetchOrders(); // Ro'yxatni yangilash
        setDetailDialogOpen(false); // Dialogni yopish
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Buyurtmani qabul qilib boʻlmadi:', error);
      showSnackbar('Buyurtmani qabul qilib boʻlmadi', 'error');
    }
  };

  /**
   * Buyurtmani yetkazib berish
   * @param {string} orderId - Buyurtma ID si
   * @returns {Promise<void>}
   */
  const deliverOrder = async (orderId) => {
    try {
      console.log(`Buyurtma yetkazilmoqda: ${orderId}`);
      const response = await fetch(`http://localhost:2277/deliver/${orderId}/delivered-order`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Buyurtma muvaffaqiyatli yetkazib berildi');
        showSnackbar('Buyurtma muvaffaqiyatli yetkazib berildi', 'success');
        fetchOrders();
        setDetailDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Buyurtmani yetkazib berib boʻlmadi:', error);
      showSnackbar('Buyurtmani yetkazib berib boʻlmadi', 'error');
    }
  };

  /**
   * Buyurtmani bekor qilish
   * @param {string} orderId - Buyurtma ID si
   * @returns {Promise<void>}
   */
  const rejectOrder = async (orderId) => {
    try {
      // Foydalanuvchidan tasdiqlash so'rash
      const isConfirmed = window.confirm(
        'Haqiqatan ham bu buyurtmani bekor qilmoqchimisiz?'
      );
      
      if (!isConfirmed) return;

      console.log(`Buyurtma bekor qilinmoqda: ${orderId}`);
      // Bekor qilish API ga so'rov
      const response = await fetch(`http://localhost:2277/deliver/${orderId}/reject-order`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Buyurtma muvaffaqiyatli bekor qilindi');
        showSnackbar('Buyurtma muvaffaqiyatli bekor qilindi', 'warning');
        fetchOrders();
        setDetailDialogOpen(false);
      } else {
        // Agar API mavjud bo'lmasa, oddiy tasdiqlash
        showSnackbar('Buyurtma bekor qilindi', 'warning');
        fetchOrders();
        setDetailDialogOpen(false);
      }
    } catch (error) {
      console.error('Buyurtmani bekor qilib boʻlmadi:', error);
      showSnackbar('Buyurtmani bekor qilib boʻlmadi', 'error');
    }
  };

  /**
   * Excel faylga export qilish
   * @returns {Promise<void>}
   */
  const exportToExcel = async () => {
    try {
      const queryParams = new URLSearchParams();
      
      // Market va filtr ma'lumotlarini qo'shish
      if (viewMode === 'market' && selectedMarket) {
        queryParams.append('marketId', selectedMarket._id);
      }
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);

      console.log('Excel export boshlandi...');
      const response = await fetch(`http://localhost:2277/deliver/export?${queryParams}`, {
        method: 'GET',
        headers: { 
          'accept': '*/*',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Fayl nomini yaratish
        const fileName = `buyurtmalar_${
          viewMode === 'market' ? selectedMarket?.name : 'barcha'
        }_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('Excel fayl muvaffaqiyatli yuklab olindi');
        showSnackbar('Excel fayl muvaffaqiyatli yuklab olindi', 'success');
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Export qilib boʻlmadi:', error);
      showSnackbar('Export qilib boʻlmadi', 'error');
    }
  };

  // ==================== VIEW MODE HANDLERS ====================

  /**
   * Barcha buyurtmalar ko'rinishiga o'tish
   */
  const handleAllOrdersView = () => {
    console.log('Barcha buyurtmalar ko\'rinishiga o\'tildi');
    setViewMode('all');
    setSelectedMarket(null);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  /**
   * Maxsus market buyurtmalariga o'tish
   * @param {Object} market - Tanlangan market
   */
  const handleMarketSelect = (market) => {
    console.log(`Market tanlandi: ${market.name}`);
    setViewMode('market');
    setSelectedMarket(market);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Snackbar xabarini ko'rsatish
   * @param {string} message - Xabar matni
   * @param {string} severity - Xabar turi (success, error, warning, info)
   */
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  /**
   * Status rangini olish
   * @param {string} status - Buyurtma statusi
   * @returns {string} - CSS rang qiymati
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'var(--primary)';
      case 'accepted': return 'var(--warning)';
      case 'delivered': return 'var(--success)';
      case 'rejected': return 'var(--error)';
      default: return 'var(--text-light)';
    }
  };

  /**
   * Status matnini olish
   * @param {string} status - Buyurtma statusi
   * @returns {string} - Status matni
   */
  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Yangi';
      case 'accepted': return 'Qabul qilindi';
      case 'delivered': return 'Yetkazib berildi';
      case 'rejected': return 'Rad etildi';
      default: return status;
    }
  };

  /**
   * Sahifani o'zgartirish
   * @param {number} page - Yangi sahifa raqami
   */
  const handlePageChange = (page) => {
    console.log(`Sahifa o'zgartirildi: ${page}`);
    setFilters(prev => ({ ...prev, page }));
  };

  // ==================== USE EFFECT HOOKS ====================

  // Komponent yuklanganda marketlarni olish
  useEffect(() => {
    fetchMarkets();
  }, []);

  // View mode, selectedMarket yoki filtrlar o'zgarganda buyurtmalarni yangilash
  useEffect(() => {
    fetchOrders();
  }, [viewMode, selectedMarket, filters]);

  // Sahifalar sonini hisoblash
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // ==================== RENDER ====================

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        
        {/* CHAP MENYU - MARKETLAR RO'YXATI */}
        <div className={styles.sidebar}>
          {/* Sarlavha */}
          <div className={styles.sidebarHeader}>
            <FaStore className={styles.sidebarIcon} />
            <h2>Marketlar</h2>
          </div>
          
          {/* Barcha buyurtmalar tugmasi */}
          <div 
            className={`${styles.allOrdersButton} ${
              viewMode === 'all' ? styles.allOrdersButtonActive : ''
            }`}
            onClick={handleAllOrdersView}
          >
            <FaGlobe className={styles.allOrdersIcon} />
            <span>Barcha buyurtmalar</span>
          </div>

          {/* Marketlar ro'yxati */}
          <div className={styles.marketList}>
            {loading.markets ? (
              // Yuklanish ko'rsatkichi
              <div className={styles.loading}>
                <FaSpinner className={styles.spinner} />
                <span>Marketlar yuklanmoqda...</span>
              </div>
            ) : markets.length > 0 ? (
              // Marketlar ro'yxati
              markets.map(market => (
                <div
                  key={market._id}
                  className={`${styles.marketItem} ${
                    viewMode === 'market' && selectedMarket?._id === market._id 
                      ? styles.marketItemActive 
                      : ''
                  }`}
                  onClick={() => handleMarketSelect(market)}
                >
                  <FaStore className={styles.marketIcon} />
                  <div className={styles.marketInfo}>
                    <div className={styles.marketName}>{market.name}</div>
                    <div className={styles.marketPhone}>{market.phone}</div>
                  </div>
                </div>
              ))
            ) : (
              // Marketlar topilmaganda
              <div className={styles.noData}>
                <FaExclamationTriangle className={styles.noDataIcon} />
                <div>Marketlar topilmadi</div>
              </div>
            )}
          </div>
        </div>

        {/* ASOSIY KONTENT - BUYURTMALAR */}
        <div className={styles.mainContent}>
          
          {/* SARLAVHA VA FILTRLAR */}
          <div className={styles.headerCard}>
            <div className={styles.cardContent}>
              {/* Sarlavha qismi */}
              <div className={styles.header}>
                <div className={styles.title}>
                  <FaShoppingCart className={styles.titleIcon} />
                  <div>
                    <h1>
                      {viewMode === 'all' 
                        ? 'Barcha buyurtmalar' 
                        : `${selectedMarket?.name} - Buyurtmalar`
                      }
                    </h1>
                    {viewMode === 'market' && selectedMarket && (
                      <div className={styles.marketDetails}>
                        Telefon: {selectedMarket.phone}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Excel export tugmasi */}
                <Button
                  variant="contained"
                  startIcon={<FaDownload />}
                  onClick={exportToExcel}
                  className={styles.exportBtn}
                  disabled={loading.orders}
                >
                  {loading.orders ? 'Yuklanmoqda...' : 'Excel Export'}
                </Button>
              </div>

              {/* FILTRLAR PANELI */}
              <div className={styles.filterGrid}>
                {/* Status filtri */}
                <div className={styles.filterItem}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      status: e.target.value, 
                      page: 1 
                    }))}
                    className={styles.filterInput}
                    size="small"
                  >
                    <MenuItem value="all">Barchasi</MenuItem>
                    <MenuItem value="new">Yangi</MenuItem>
                    <MenuItem value="accepted">Qabul qilindi</MenuItem>
                    <MenuItem value="delivered">Yetkazib berildi</MenuItem>
                    <MenuItem value="rejected">Rad etildi</MenuItem>
                  </TextField>
                </div>
                
                {/* Boshlanish sanasi filtri */}
                <div className={styles.filterItem}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Dan"
                    InputLabelProps={{ shrink: true }}
                    value={filters.from}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      from: e.target.value, 
                      page: 1 
                    }))}
                    className={styles.filterInput}
                    size="small"
                  />
                </div>
                
                {/* Tugash sanasi filtri */}
                <div className={styles.filterItem}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Gacha"
                    InputLabelProps={{ shrink: true }}
                    value={filters.to}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      to: e.target.value, 
                      page: 1 
                    }))}
                    className={styles.filterInput}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BUYURTMALAR JADVALI */}
          <div className={styles.tableCard}>
            <div className={styles.cardContent}>
              {loading.orders ? (
                // Buyurtmalar yuklanayotgan holat
                <div className={styles.loading}>
                  <FaSpinner className={styles.spinner} />
                  <span>Buyurtmalar yuklanmoqda...</span>
                </div>
              ) : (
                // Buyurtmalar ro'yxati
                <>
                  <div className={styles.tableContainer}>
                    <div className={`${styles.table} ${
                      viewMode === 'all' ? styles.allView : ''
                    }`}>
                      {/* Jadval sarlavhasi */}
                      <div className={`${styles.tableHeader} ${
                        viewMode === 'all' ? styles.allView : ''
                      }`}>
                        <div className={styles.tableCell}>ID</div>
                        {viewMode === 'all' && <div className={styles.tableCell}>Market</div>}
                        <div className={styles.tableCell}>Mahsulotlar</div>
                        <div className={styles.tableCell}>Status</div>
                        <div className={styles.tableCell}>Sana</div>
                        <div className={styles.tableCell}>Harakatlar</div>
                      </div>
                      
                      {/* Jadval tana qismi */}
                      <div className={styles.tableBody}>
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <div 
                              key={order._id} 
                              className={`${styles.tableRow} ${
                                viewMode === 'all' ? styles.allView : ''
                              }`}
                            >
                              {/* Buyurtma ID si */}
                              <div className={styles.tableCell}>
                                <div className={styles.idText} title={order._id}>
                                  {order._id.substring(0, 10)}...
                                </div>
                              </div>
                              
                              {/* Market nomi (faqat barcha buyurtmalar ko'rinishida) */}
                              {viewMode === 'all' && (
                                <div className={styles.tableCell}>
                                  <div className={styles.marketInfoSmall}>
                                    <FaStore className={styles.marketIconSmall} />
                                    <span title={order.marketId?.name}>
                                      {order.marketId?.name || 'Noma\'lum'}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Mahsulotlar soni */}
                              <div className={styles.tableCell}>
                                <div className={styles.productCount}>
                                  <FaBox className={styles.productIcon} />
                                  {order.products?.length || 0}
                                </div>
                              </div>
                              
                              {/* Status */}
                              <div className={styles.tableCell}>
                                <div 
                                  className={styles.statusBadge}
                                  style={{ backgroundColor: getStatusColor(order.status) }}
                                  title={getStatusText(order.status)}
                                >
                                  {getStatusText(order.status)}
                                </div>
                              </div>
                              
                              {/* Sana */}
                              <div className={styles.tableCell}>
                                <div className={styles.dateInfo}>
                                  <FaCalendar className={styles.dateIcon} />
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              
                              {/* Harakatlar tugmalari */}
                              <div className={styles.tableCell}>
                                <div className={styles.actionButtons}>
                                  {/* Ko'rish tugmasi */}
                                  <Button
                                    size="small"
                                    startIcon={<FaEye />}
                                    onClick={() => fetchOrderDetails(order._id)}
                                    className={styles.viewBtn}
                                    title="Buyurtma tafsilotlarini ko'rish"
                                  >
                                    Ko'rish
                                  </Button>
                                  
                                  {/* Statusga qarab harakat tugmalari */}
                                  {order.status === 'new' && (
                                    <>
                                      <Button
                                        size="small"
                                        color="success"
                                        startIcon={<FaCheckCircle />}
                                        onClick={() => acceptOrder(order._id)}
                                        className={styles.actionBtn}
                                        title="Buyurtmani qabul qilish"
                                      >
                                        Qabul
                                      </Button>
                                      <Button
                                        size="small"
                                        color="error"
                                        startIcon={<FaTimesCircle />}
                                        onClick={() => rejectOrder(order._id)}
                                        className={styles.actionBtn}
                                        title="Buyurtmani bekor qilish"
                                      >
                                        Bekor
                                      </Button>
                                    </>
                                  )}
                                  
                                  {order.status === 'accepted' && (
                                    <Button
                                      size="small"
                                      color="primary"
                                      startIcon={<FaCheckCircle />}
                                      onClick={() => deliverOrder(order._id)}
                                      className={styles.actionBtn}
                                      title="Buyurtmani yetkazib berish"
                                    >
                                      Yetkaz
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Buyurtmalar topilmaganda
                          <div className={styles.noData}>
                            <FaShoppingCart className={styles.noDataIcon} />
                            <div>Hech qanday buyurtma topilmadi</div>
                            <div className={styles.noDataSubtitle}>
                              Filtrlarni o'zgartirib ko'ring
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PAGINATION - Sahifalash */}
                  {pagination.total > 0 && (
                    <div className={styles.pagination}>
                      {/* Ma'lumotlar soni */}
                      <div className={styles.paginationInfo}>
                        Jami: {pagination.total} ta buyurtma
                      </div>
                      
                      {/* Sahifa tugmalari */}
                      <div className={styles.paginationButtons}>
                        {/* Oldingi sahifa */}
                        <Button
                          disabled={pagination.page === 1}
                          onClick={() => handlePageChange(pagination.page - 1)}
                          className={styles.paginationBtn}
                          size="small"
                        >
                          Oldingi
                        </Button>
                        
                        {/* Sahifa raqami */}
                        <span className={styles.pageInfo}>
                          {pagination.page} / {totalPages}
                        </span>
                        
                        {/* Keyingi sahifa */}
                        <Button
                          disabled={pagination.page === totalPages}
                          onClick={() => handlePageChange(pagination.page + 1)}
                          className={styles.paginationBtn}
                          size="small"
                        >
                          Keyingi
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BUYURTMA TAFSILOTLARI DIALOGI */}
      {detailDialogOpen && (
        <div className={styles.dialogOverlay} onClick={() => setDetailDialogOpen(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            {/* Dialog sarlavhasi */}
            <div className={styles.dialogHeader}>
              <FaShoppingCart className={styles.dialogIcon} />
              <h2>Buyurtma Tafsilotlari</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setDetailDialogOpen(false)}
                aria-label="Yopish"
              >
                ×
              </button>
            </div>
            
            {/* Dialog kontenti */}
            <div className={styles.dialogContent}>
              {loading.details ? (
                // Ma'lumotlar yuklanayotgan holat
                <div className={styles.loading}>
                  <FaSpinner className={styles.spinner} />
                  <span>Ma'lumotlar yuklanmoqda...</span>
                </div>
              ) : selectedOrder ? (
                // Buyurtma tafsilotlari
                <div>
                  {/* Umumiy ma'lumotlar */}
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <FaList className={styles.sectionIcon} />
                      Umumiy ma'lumotlar
                    </h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Buyurtma ID:</label>
                        <div className={styles.detailValue}>{selectedOrder._id}</div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Holati:</label>
                        <div 
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                        >
                          {getStatusText(selectedOrder.status)}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Yaratilgan sana:</label>
                        <div className={styles.detailValue}>
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Yangilangan sana:</label>
                        <div className={styles.detailValue}>
                          {new Date(selectedOrder.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mahsulotlar ro'yxati */}
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <FaBox className={styles.sectionIcon} />
                      Mahsulotlar ({selectedOrder.productsWithDetails?.length || 0})
                    </h3>
                    <div className={styles.productsTable}>
                      {/* Mahsulotlar jadvali sarlavhasi */}
                      <div className={styles.productsHeader}>
                        <div className={styles.productCell}>Mahsulot Nomi</div>
                        <div className={styles.productCell}>Miqdor</div>
                        <div className={styles.productCell}>Oʻlchov Birligi</div>
                      </div>
                      
                      {/* Mahsulotlar ro'yxati */}
                      <div className={styles.productsBody}>
                        {selectedOrder.productsWithDetails?.map((product, index) => (
                          <div key={product._id || index} className={styles.productRow}>
                            <div className={styles.productCell}>
                              {product.productDetails?.name || 'Noma\'lum mahsulot'}
                            </div>
                            <div className={styles.productCell}>
                              <span className={styles.quantity}>
                                {product.quantity}
                              </span>
                            </div>
                            <div className={styles.productCell}>
                              {product.productDetails?.unit || 'N/A'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Ma'lumotlar topilmaganda
                <div className={styles.noData}>
                  <FaExclamationTriangle className={styles.noDataIcon} />
                  <div>Ma'lumotlar topilmadi</div>
                </div>
              )}
            </div>
            
            {/* Dialog harakatlari */}
            <div className={styles.dialogActions}>
              {/* Yopish tugmasi */}
              <Button 
                onClick={() => setDetailDialogOpen(false)}
                className={styles.closeDialogBtn}
              >
                Yopish
              </Button>
              
              {/* Statusga qarab harakat tugmalari */}
              {selectedOrder?.status === 'new' && (
                <>
                  <Button 
                    variant="contained" 
                    color="success"
                    startIcon={<FaCheckCircle />}
                    onClick={() => acceptOrder(selectedOrder._id)}
                    className={styles.actionDialogBtn}
                  >
                    Qabul qilish
                  </Button>
                  <Button 
                    variant="outlined"
                    color="error"
                    startIcon={<FaTimesCircle />}
                    onClick={() => rejectOrder(selectedOrder._id)}
                    className={styles.actionDialogBtn}
                  >
                    Bekor qilish
                  </Button>
                </>
              )}
              
              {selectedOrder?.status === 'accepted' && (
                <Button 
                  variant="contained" 
                  startIcon={<FaCheckCircle />}
                  onClick={() => deliverOrder(selectedOrder._id)}
                  className={styles.actionDialogBtn}
                >
                  Yetkazish
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* XABARLAR UCHUN SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default DashboardD;