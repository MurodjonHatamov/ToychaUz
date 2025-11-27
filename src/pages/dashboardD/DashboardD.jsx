import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { 
  FaDownload, 
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import styles from "./DashboardD.module.css";

function DashboardD() {
  // ==================== STATE DEFINITIONS ====================
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Filtrlar
  const [filters, setFilters] = useState({
    status: 'all',
    from: '',
    to: ''
  });

  // Yuklanish holatlari
  const [loading, setLoading] = useState({
    markets: true,
    orders: false,
    export: false,
    details: false
  });

  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // ==================== API FUNCTIONS ====================

  const fetchMarkets = async () => {
    try {
      setLoading(prev => ({ ...prev, markets: true }));
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
        setMarkets(marketsData);
        if (marketsData.length > 0) {
          setSelectedMarket(marketsData[0]._id);
        }
      }
    } catch (error) {
      console.error('Marketlarni yuklab boʻlmadi:', error);
      showSnackbar('Marketlarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, markets: false }));
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      
      const queryParams = new URLSearchParams();
      
      // Market tanlangan bo'lsa
      if (selectedMarket) {
        queryParams.append('marketId', selectedMarket);
      }
      
      // Filtrlarni qo'shish
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);

      // Required parametrlar
      queryParams.append('page', '1');
      queryParams.append('limit', '100');

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
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Buyurtmalarni yuklab boʻlmadi:', error);
      showSnackbar('Buyurtmalarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(prev => ({ ...prev, details: true }));
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
        setSelectedOrder(order);
        setOrderDialogOpen(true);
      }
    } catch (error) {
      console.error('Buyurtma ma\'lumotlarini olish mumkin emas:', error);
      showSnackbar('Buyurtma ma\'lumotlarini olish mumkin emas', 'error');
    } finally {
      setLoading(prev => ({ ...prev, details: false }));
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:2277/deliver/${orderId}/accept-order`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        showSnackbar('Buyurtma muvaffaqiyatli qabul qilindi', 'success');
        fetchOrders();
        setOrderDialogOpen(false);
      }
    } catch (error) {
      console.error('Buyurtmani qabul qilib boʻlmadi:', error);
      showSnackbar('Buyurtmani qabul qilib boʻlmadi', 'error');
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:2277/deliver/${orderId}/delivered-order`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        showSnackbar('Buyurtma muvaffaqiyatli yetkazib berildi', 'success');
        fetchOrders();
        setOrderDialogOpen(false);
      }
    } catch (error) {
      console.error('Buyurtmani yetkazib berib boʻlmadi:', error);
      showSnackbar('Buyurtmani yetkazib berib boʻlmadi', 'error');
    }
  };

  const rejectOrder = async (orderId) => {
    try {
      const isConfirmed = window.confirm('Haqiqatan ham bu buyurtmani bekor qilmoqchimisiz?');
      if (!isConfirmed) return;

      const response = await fetch(`http://localhost:2277/deliver/${orderId}/reject-order`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        showSnackbar('Buyurtma muvaffaqiyatli bekor qilindi', 'warning');
        fetchOrders();
        setOrderDialogOpen(false);
      }
    } catch (error) {
      console.error('Buyurtmani bekor qilib boʻlmadi:', error);
      showSnackbar('Buyurtmani bekor qilib boʻlmadi', 'error');
    }
  };

  const exportToExcel = async () => {
    try {
      setLoading(prev => ({ ...prev, export: true }));
      
      const queryParams = new URLSearchParams();
      
      if (selectedMarket) {
        queryParams.append('marketId', selectedMarket);
      }
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);

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
        
        const fileName = `buyurtmalar_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSnackbar('Excel fayl muvaffaqiyatli yuklab olindi', 'success');
      }
    } catch (error) {
      console.error('Export qilib boʻlmadi:', error);
      showSnackbar('Export qilib boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  // ==================== EXCEL TABLE FUNCTIONS ====================

  const calculateExcelTableData = () => {
    const productData = {};
    const marketOrders = {};
    
    // Har bir buyurtma uchun
    orders.forEach(order => {
      const marketName = order.marketId?.name || 'Noma\'lum market';
      const date = new Date(order.createdAt).toLocaleDateString();
      const status = order.status;
      const orderKey = `${marketName} (${date})`;
      
      if (!marketOrders[orderKey]) {
        marketOrders[orderKey] = {
          order: order,
          status: status
        };
      }
      
      // Har bir mahsulot uchun
      order.products?.forEach(product => {
        const productName = product.productId?.name || 'Noma\'lum mahsulot';
        
        if (!productData[productName]) {
          productData[productName] = {};
        }
        
        // Mahsulot miqdorini qo'shish
        productData[productName][orderKey] = (productData[productName][orderKey] || 0) + product.quantity;
      });
    });
    
    return {
      productData,
      marketOrders,
      marketColumns: Object.keys(marketOrders).sort()
    };
  };

  const calculateTotals = (productData, marketColumns) => {
    const rowTotals = {};
    const columnTotals = {};
    let grandTotal = 0;
    
    // Qator jami hisoblari
    Object.keys(productData).forEach(productName => {
      rowTotals[productName] = marketColumns.reduce((sum, column) => {
        return sum + (productData[productName][column] || 0);
      }, 0);
    });
    
    // Ustun jami hisoblari
    marketColumns.forEach(column => {
      columnTotals[column] = Object.keys(productData).reduce((sum, productName) => {
        return sum + (productData[productName][column] || 0);
      }, 0);
    });
    
    // Umumiy jami
    grandTotal = Object.values(rowTotals).reduce((sum, total) => sum + total, 0);
    
    return { rowTotals, columnTotals, grandTotal };
  };

  // ==================== HELPER FUNCTIONS ====================

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#1976d2';
      case 'accepted': return '#ed6c02';
      case 'delivered': return '#2e7d32';
      case 'rejected': return '#d32f2f';
      default: return '#666666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Yangi';
      case 'accepted': return 'Qabul qilindi';
      case 'delivered': return 'Yetkazib berildi';
      case 'rejected': return 'Rad etildi';
      default: return status;
    }
  };

  // ==================== USE EFFECT HOOKS ====================

  useEffect(() => {
    fetchMarkets();
  }, []);

  useEffect(() => {
    if (selectedMarket) {
      fetchOrders();
    }
  }, [selectedMarket, filters]);

  // Excel jadval ma'lumotlarini hisoblash
  const { productData, marketOrders, marketColumns } = calculateExcelTableData();
  const { rowTotals, columnTotals, grandTotal } = calculateTotals(productData, marketColumns);

  // ==================== RENDER ====================

  return (
    <div className={styles.dashboard}>
      {/* FILTR PANELI */}
      <div className={styles.filterPanel}>
        <div className={styles.filterHeader}>
          <h2>Excel Jadval</h2>
        </div>
        
        <div className={styles.filterControls}>
          {/* Market tanlash */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Market</label>
            <select 
              className={styles.filterSelect}
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
            >
              {markets.map(market => (
                <option key={market._id} value={market._id}>
                  {market.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filtri */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select 
              className={styles.filterSelect}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">Barchasi</option>
              <option value="new">Yangi</option>
              <option value="accepted">Qabul qilindi</option>
              <option value="delivered">Yetkazib berildi</option>
              <option value="rejected">Rad etildi</option>
            </select>
          </div>

          {/* Sana filtrlari */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Dan</label>
            <input
              type="datetime-local"
              className={styles.filterInput}
              value={filters.from}
              onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Gacha</label>
            <input
              type="datetime-local"
              className={styles.filterInput}
              value={filters.to}
              onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>

          {/* Export tugmasi */}
          <button
            className={styles.exportButton}
            onClick={exportToExcel}
            disabled={loading.export || loading.orders}
          >
            {loading.export ? (
              <FaSpinner className={styles.buttonSpinner} />
            ) : (
              <FaDownload className={styles.buttonIcon} />
            )}
            {loading.export ? 'Yuklanmoqda...' : 'Excelga Export'}
          </button>
        </div>
      </div>

      {/* EXCEL JADVALI */}
      <div className={styles.excelTablePanel}>
        {loading.orders ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Buyurtmalar yuklanmoqda...</span>
          </div>
        ) : orders.length > 0 ? (
          <div className={styles.excelTableContainer}>
            <table className={styles.excelTable}>
              <thead>
                <tr>
                  <th className={styles.productHeader}>Mahsulot NOMi / Bo'g'chalar</th>
                  {marketColumns.map(column => {
                    const order = marketOrders[column]?.order;
                    const status = marketOrders[column]?.status;
                    return (
                      <th 
                        key={column} 
                        className={styles.marketHeader}
                        style={{ 
                          backgroundColor: getStatusColor(status),
                          color: 'white',
                          cursor: 'pointer'
                        }}
                        onClick={() => order && fetchOrderDetails(order._id)}
                        title={`${column} - ${getStatusText(status)} (Batafsil ko'rish uchun bosing)`}
                      >
                        {column}
                        <div className={styles.statusBadge}>
                          {getStatusText(status)}
                        </div>
                      </th>
                    );
                  })}
                  <th className={styles.totalHeader}>Jami</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(productData).map(productName => (
                  <tr key={productName} className={styles.productRow}>
                    <td className={styles.productCell}>{productName}</td>
                    {marketColumns.map(column => (
                      <td key={column} className={styles.quantityCell}>
                        {productData[productName][column] || 0}
                      </td>
                    ))}
                    <td className={styles.rowTotal}>{rowTotals[productName]}</td>
                  </tr>
                ))}
                
                {/* JAMI QATORI */}
                <tr className={styles.grandTotalRow}>
                  <td className={styles.grandTotalLabel}>JAMI</td>
                  {marketColumns.map(column => (
                    <td key={column} className={styles.columnTotal}>
                      {columnTotals[column]}
                    </td>
                  ))}
                  <td className={styles.grandTotal}>{grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.noData}>
            <FaExclamationTriangle className={styles.noDataIcon} />
            <div>Hech qanday buyurtma topilmadi</div>
            <div className={styles.noDataSubtitle}>
              Filtrlarni o'zgartirib ko'ring yoki boshqa market tanlang
            </div>
          </div>
        )}
      </div>

      {/* BUYURTMA TAFSILOTLARI DIALOGI */}
      {orderDialogOpen && selectedOrder && (
        <div className={styles.dialogOverlay} onClick={() => setOrderDialogOpen(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <h2>Buyurtma Tafsilotlari</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setOrderDialogOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.dialogContent}>
              {loading.details ? (
                <div className={styles.loading}>
                  <FaSpinner className={styles.spinner} />
                  <span>Ma'lumotlar yuklanmoqda...</span>
                </div>
              ) : (
                <div>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Umumiy ma'lumotlar</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Buyurtma ID:</label>
                        <div className={styles.detailValue}>{selectedOrder._id}</div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Market:</label>
                        <div className={styles.detailValue}>
                          {selectedOrder.marketId?.name || 'Noma\'lum'}
                        </div>
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
                        <label>Sana:</label>
                        <div className={styles.detailValue}>
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      Mahsulotlar ({selectedOrder.products?.length || 0})
                    </h3>
                    <div className={styles.productsTable}>
                      {selectedOrder.products?.map((product, index) => (
                        <div key={index} className={styles.productRowDetail}>
                          <div className={styles.productName}>
                            {product.productId?.name || 'Noma\'lum mahsulot'}
                          </div>
                          <div className={styles.productQuantity}>
                            {product.quantity} ta
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.dialogActions}>
              <button 
                className={styles.closeDialogBtn}
                onClick={() => setOrderDialogOpen(false)}
              >
                Yopish
              </button>
              
              {selectedOrder.status === 'new' && (
                <>
                  <button 
                    className={styles.acceptBtn}
                    onClick={() => acceptOrder(selectedOrder._id)}
                  >
                    Qabul qilish
                  </button>
                  <button 
                    className={styles.rejectBtn}
                    onClick={() => rejectOrder(selectedOrder._id)}
                  >
                    Bekor qilish
                  </button>
                </>
              )}
              
              {selectedOrder.status === 'accepted' && (
                <button 
                  className={styles.deliverBtn}
                  onClick={() => deliverOrder(selectedOrder._id)}
                >
                  Yetkazish
                </button>
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default DashboardD;