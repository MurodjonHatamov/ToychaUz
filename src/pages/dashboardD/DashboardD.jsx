import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import {
  FaDownload,
  FaSpinner,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import styles from "./DashboardD.module.css";
import { logaut } from "../logaut";
import { baseURL } from "../config";
import EditOrderModal from "../../components/editOrderModal/EditOrderModal";

function DashboardD() {
  // ==================== STATE DEFINITIONS ====================
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marketNames, setMarketNames] = useState({});
  const [productNames, setProductNames] = useState({});
  const [productUnits, setProductUnits] = useState({});

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    status: "all",
    from: "",
    to: "",
    categoryId: "",
  });

  const [loading, setLoading] = useState({
    markets: true,
    orders: false,
    export: false,
    details: false,
    products: true,
    categories: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // ==================== PAGINATION FUNCTIONS ====================
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    fetchOrders(1, newLimit);
  };

  // ==================== API FUNCTIONS ====================
  const fetchMarkets = async () => {
    try {
      setLoading(prev => ({ ...prev, markets: true }));
      const response = await fetch(`${baseURL}/markets`, {
        method: "GET",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        const marketsData = await response.json();
        setMarkets(marketsData);
        const marketMap = {};
        marketsData.forEach(market => {
          marketMap[market._id] = market.name;
        });
        setMarketNames(marketMap);
      }
    } catch (error) {
      showSnackbar("Marketlarni yuklab boʻlmadi", "error");
    } finally {
      setLoading(prev => ({ ...prev, markets: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const response = await fetch(`${baseURL}/product-category`, {
        method: "GET",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      showSnackbar("Kategoriyalarni yuklab boʻlmadi", "error");
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      const response = await fetch(`${baseURL}/products`, {
        method: "GET",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        const productsData = await response.json();
        setProducts(productsData);
        const productMap = {};
        const unitMap = {};
        productsData.forEach(product => {
          productMap[product._id] = product.name;
          unitMap[product._id] = product.unit || "";
        });
        setProductNames(productMap);
        setProductUnits(unitMap);
      }
    } catch (error) {
      showSnackbar("Mahsulotlarni yuklab boʻlmadi", "error");
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));

      const queryParams = new URLSearchParams();
      if (selectedMarket && selectedMarket !== "all") {
        queryParams.append("marketId", selectedMarket);
      }
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters.categoryId && filters.categoryId !== "") {
        queryParams.append("categoryId", filters.categoryId);
      }
      if (filters.from) {
        const fromDate = new Date(filters.from);
        queryParams.append("from", fromDate.toISOString());
      }
      if (filters.to) {
        const toDate = new Date(filters.to);
        queryParams.append("to", toDate.toISOString());
      }
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(`${baseURL}/deliver/orders?${queryParams}`, {
        method: "GET",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        const result = await response.json();
        
        // Buyurtmalar ro'yxatini olish
        const ordersList = result.data || result.orders || [];
        
        // Pagination ma'lumotlarini olish
        const total = result.total || result.totalOrders || 0;
        const currentPage = result.page || page;
        const currentLimit = result.limit || limit;
        const totalPages = result.totalPages || Math.ceil(total / currentLimit) || 1;

        console.log("API dan kelgan orders:", ordersList.length, "ta");
        console.log("Birinchi order:", ordersList[0]);

        setOrders(ordersList);
        setPagination({
          page: currentPage,
          limit: currentLimit,
          total: total,
          totalPages: totalPages,
        });

      } else {
        showSnackbar(`Server xatosi: ${response.status}`, "error");
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      showSnackbar("Buyurtmalarni yuklab boʻlmadi", "error");
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(prev => ({ ...prev, details: true }));
      const response = await fetch(`${baseURL}/deliver/orders/${orderId}`, {
        method: "GET",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        const order = await response.json();
        setSelectedOrder(order);
        setOrderDialogOpen(true);
      }
    } catch (error) {
      showSnackbar("Buyurtma ma'lumotlarini olish mumkin emas", "error");
    } finally {
      setLoading(prev => ({ ...prev, details: false }));
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const getMarketName = (marketId) => {
    if (!marketId) return "Noma'lum market";
    
    // Agar marketId object bo'lsa
    if (typeof marketId === "object") {
      // 1. Agar direct name property bo'lsa
      if (marketId.name) return marketId.name;
      // 2. Agar _id bo'lsa, marketNames map'dan qidirish
      if (marketId._id) return marketNames[marketId._id] || "Noma'lum market";
      // 3. Agar marketInfo bo'lsa
      if (marketId.marketInfo?.name) return marketId.marketInfo.name;
    }
    
    // Agar string bo'lsa
    return marketNames[marketId] || "Noma'lum market";
  };

  const getProductName = (productId) => {
    if (!productId) return "Noma'lum mahsulot";
    
    // Agar productId object bo'lsa
    if (typeof productId === "object") {
      // 1. Agar direct name property bo'lsa
      if (productId.name) return productId.name;
      // 2. Agar _id bo'lsa, productNames map'dan qidirish
      if (productId._id) return productNames[productId._id] || "Noma'lum mahsulot";
    }
    
    // Agar string bo'lsa
    return productNames[productId] || "Noma'lum mahsulot";
  };

  const getProductUnit = (productId) => {
    if (!productId) return "";
    
    let actualProductId;
    
    // Agar productId object bo'lsa
    if (typeof productId === "object") {
      // 1. Agar direct unit property bo'lsa
      if (productId.unit) {
        const unitMap = {
          'piece': 'dona',
          'kg': 'kg',
          'liter': 'l',
          'litr': 'l',
          'gram': 'gr',
          'meter': 'm',
          'metr': 'm',
          'unit': 'dona'
        };
        return unitMap[productId.unit] || productId.unit;
      }
      // 2. Agar _id bo'lsa, productUnits map'dan qidirish
      if (productId._id) actualProductId = productId._id;
    } else {
      actualProductId = productId;
    }
    
    // Agar unit map'dan topilsa
    const unit = productUnits[actualProductId];
    if (!unit) return "";
    
    const unitMap = {
      'piece': 'dona',
      'kg': 'kg',
      'liter': 'l',
      'litr': 'l',
      'gram': 'gr',
      'meter': 'm',
      'metr': 'm',
      'unit': 'dona'
    };
    
    return unitMap[unit] || unit;
  };

  const findProductIdByName = (productName) => {
    return Object.keys(productNames).find(key => productNames[key] === productName);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return "";
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(`${baseURL}/deliver/${orderId}/accept-order`, {
        method: "PATCH",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        showSnackbar("Buyurtma qabul qilindi", "success");
        fetchOrders(pagination.page, pagination.limit);
        setOrderDialogOpen(false);
      }
    } catch (error) {
      showSnackbar("Buyurtmani qabul qilib boʻlmadi", "error");
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      const response = await fetch(`${baseURL}/deliver/${orderId}/delivered-order`, {
        method: "PATCH",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        showSnackbar("Buyurtma yetkazib berildi", "success");
        fetchOrders(pagination.page, pagination.limit);
        setOrderDialogOpen(false);
      }
    } catch (error) {
      showSnackbar("Buyurtmani yetkazib berib boʻlmadi", "error");
    }
  };

  const rejectOrder = async (orderId) => {
    try {
      const isConfirmed = window.confirm("Bu buyurtmani bekor qilmoqchimisiz?");
      if (!isConfirmed) return;

      const response = await fetch(`${baseURL}/deliver/${orderId}/reject-order`, {
        method: "PATCH",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        showSnackbar("Buyurtma bekor qilindi", "warning");
        fetchOrders(pagination.page, pagination.limit);
        setOrderDialogOpen(false);
      }
    } catch (error) {
      showSnackbar("Buyurtmani bekor qilib boʻlmadi", "error");
    }
  };

  const exportToExcel = async () => {
    try {
      setLoading(prev => ({ ...prev, export: true }));

      const queryParams = new URLSearchParams();
      if (selectedMarket !== "all") queryParams.append("marketId", selectedMarket);
      if (filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.categoryId) queryParams.append("categoryId", filters.categoryId);
      if (filters.from) queryParams.append("from", new Date(filters.from).toISOString());
      if (filters.to) queryParams.append("to", new Date(filters.to).toISOString());

      const response = await fetch(`${baseURL}/deliver/export?${queryParams}`, {
        method: "GET",
        headers: { accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `buyurtmalar_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showSnackbar("Excel fayli yuklab olindi", "success");
      }
    } catch (error) {
      showSnackbar("Export qilib boʻlmadi", "error");
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  // ==================== EXCEL TABLE FUNCTIONS ====================
  const calculateExcelTableData = () => {
    console.log("Orders soni:", orders.length);
    
    const productData = {};
    const orderColumns = {};

    // Har bir order uchun alohida column yaratish
    orders.forEach((order, index) => {
      const marketName = getMarketName(order.marketId);
      const dateTime = formatDateTime(order.createdAt);
      const status = order.status;
      
      // HAR BIR ORDER UCHUN UNIQUE KEY - ORDER ID SI
      const orderKey = order._id;
      
      // Order column ma'lumotlarini saqlash
      orderColumns[orderKey] = {
        order: order,
        status: status,
        marketName: marketName,
        dateTime: dateTime,
        orderNumber: index + 1,
        createdAt: order.createdAt
      };

      // Agar orderda mahsulotlar bo'lsa
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach((product) => {
          const productName = getProductName(product.productId);
          
          if (!productData[productName]) {
            productData[productName] = {};
          }
          // Har bir order uchun alohida miqdor
          productData[productName][orderKey] = product.quantity || 0;
        });
      }
    });

    console.log("Jadvaldagi ustunlar soni:", Object.keys(orderColumns).length);
    console.log("Mahsulotlar soni:", Object.keys(productData).length);

    // Mahsulot nomlarini tartiblash
    const sortedProductNames = Object.keys(productData).sort((a, b) => {
      return a.localeCompare(b, 'uz', { sensitivity: 'base' });
    });

    const sortedProductData = {};
    sortedProductNames.forEach(name => {
      sortedProductData[name] = productData[name];
    });

    // Orderlarni yaratilish vaqti bo'yicha tartiblash
    const sortedOrderKeys = Object.keys(orderColumns).sort((a, b) => {
      const dateA = new Date(orderColumns[a].createdAt);
      const dateB = new Date(orderColumns[b].createdAt);
      return dateB - dateA; // Yangilarni birinchi
    });

    return {
      productData: sortedProductData,
      orderColumns,
      orderKeys: sortedOrderKeys,
    };
  };

  const calculateTotals = (productData, orderKeys) => {
    const rowTotals = {};
    const columnTotals = {};
    let grandTotal = 0;

    Object.keys(productData).forEach(productName => {
      rowTotals[productName] = orderKeys.reduce((sum, orderKey) => {
        return sum + (productData[productName][orderKey] || 0);
      }, 0);
    });

    orderKeys.forEach(orderKey => {
      columnTotals[orderKey] = Object.keys(productData).reduce((sum, productName) => {
        return sum + (productData[productName][orderKey] || 0);
      }, 0);
    });

    grandTotal = Object.values(rowTotals).reduce((sum, total) => sum + total, 0);

    return { rowTotals, columnTotals, grandTotal };
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new": return "#1976d2";
      case "accepted": return "#ed6c02";
      case "delivered": return "#2e7d32";
      case "rejected": return "#d32f2f";
      default: return "#666666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "new": return "Yangi";
      case "accepted": return "Qabul qilindi";
      case "delivered": return "Yetkazib berildi";
      case "rejected": return "Rad etildi";
      default: return status;
    }
  };

  // ==================== USE EFFECT HOOKS ====================
  useEffect(() => {
    fetchMarkets();
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filtrlarni o'zgartirganda 1-sahifadan boshlash
    fetchOrders(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMarket, filters]);

  // ==================== RENDER ====================
  const { productData, orderColumns, orderKeys } = calculateExcelTableData();
  const { rowTotals } = calculateTotals(productData, orderKeys);

  return (
    <div className={styles.dashboard}>
      {/* FILTR PANELI */}
      <div className={styles.filterPanel}>
        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Market</label>
            <select
              className={styles.filterSelect}
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
            >
              <option value="all">Barcha Marketlar</option>
              {markets.map(market => (
                <option key={market._id} value={market._id}>
                  {market.name}
                </option>
              ))}
            </select>
          </div>

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

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Kategoriya</label>
            <select
              className={styles.filterSelect}
              value={filters.categoryId}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
            >
              <option value="">Barcha Kategoriyalar</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Dan (sana va vaqt)</label>
            <input
              type="datetime-local"
              className={styles.filterInput}
              value={filters.from}
              onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Gacha (sana va vaqt)</label>
            <input
              type="datetime-local"
              className={styles.filterInput}
              value={filters.to}
              onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>

          <button
            className={styles.exportButton}
            onClick={exportToExcel}
            disabled={loading.export || loading.orders || orders.length === 0}
          >
            {loading.export ? (
              <FaSpinner className={styles.buttonSpinner} />
            ) : (
              <FaDownload className={styles.buttonIcon} />
            )}
            {loading.export ? "Yuklanmoqda..." : "Excelga Export"}
          </button>
        </div>
      </div>

      {/* PAGINATION */}
      {orders.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Jami: {pagination.total} ta buyurtma | 
            Sahifa: {pagination.page} / {pagination.totalPages} | 
            Ko'rsatilmoqda: {orders.length} ta
          </div>

          <div className={styles.paginationControls}>
            <select
              className={styles.pageSizeSelect}
              value={pagination.limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            >
              <option value={5}>5 ta</option>
              <option value={10}>10 ta</option>
              <option value={25}>25 ta</option>
              <option value={50}>50 ta</option>
              <option value={100}>100 ta</option>
            </select>

            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <FaChevronLeft />
            </button>

            <span className={styles.pageInfo}>
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* EXCEL JADVALI */}
      <div className={styles.excelTablePanel}>
        {loading.orders ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Buyurtmalar yuklanmoqda...</span>
          </div>
        ) : orders.length > 0 ? (
          <div className={styles.excelTableContainer}>
            <div className={styles.tableWrapper}>
              <table className={styles.excelTable}>
                <thead>
                  <tr>
                    <th className={styles.productHeader}>Mahsulot nomi</th>
                    {orderKeys.map(orderKey => {
                      const order = orderColumns[orderKey]?.order;
                      const status = orderColumns[orderKey]?.status;
                      const marketName = orderColumns[orderKey]?.marketName;
                      const dateTime = orderColumns[orderKey]?.dateTime;
                      const orderNumber = orderColumns[orderKey]?.orderNumber;
                      
                      return (
                        <th
                          key={orderKey}
                          className={styles.orderHeader}
                          style={{ backgroundColor: getStatusColor(status), color: "white" }}
                          onClick={() => order && fetchOrderDetails(order._id)}
                          title={`${marketName} - ${dateTime} - ${getStatusText(status)}`}
                        >
                          <div className={styles.orderHeaderContent}>
                       
                            <div className={styles.orderTitle}>
                              <div className={styles.marketName}>
                                {marketName}
                              </div>
                              <div className={styles.orderDateTime}>
                                {dateTime}
                              </div>
                            </div>
                            <div className={styles.statusBadge}>
                              {getStatusText(status)}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    <th className={styles.totalHeader}>Jami</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(productData).length > 0 ? (
                    Object.keys(productData).map((productName, index) => {
                      const productId = findProductIdByName(productName);
                      const unit = getProductUnit(productId || "");
                      
                      return (
                        <tr 
                          key={productName} 
                          className={`${styles.productRow} ${index % 2 === 0 ? styles.evenRow : styles.oddRow}`}
                        >
                          <td className={styles.productCell}>
                            {productName}
                          </td>
                          
                          {orderKeys.map(orderKey => (
                            <td key={orderKey} className={styles.quantityCell}>
                              {productData[productName][orderKey] || 0}
                            </td>
                          ))}
                          
                          <td className={styles.rowTotal}>
                            {rowTotals[productName]}
                            {unit && <span className={styles.unitLabel}> {unit}</span>}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={orderKeys.length + 2} style={{ textAlign: "center", padding: "20px" }}>
                        Mahsulotlar topilmadi. Buyurtmalarda mahsulotlar mavjud emas yoki ma'lumotlar to'g'ri olinmadi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

      {/* DIALOG */}
      {orderDialogOpen && selectedOrder && (
        <EditOrderModal 
          setOrderDialogOpen={setOrderDialogOpen}
          selectedOrder={selectedOrder}
          loading={loading}
          getMarketName={getMarketName}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          formatDateTime={formatDateTime}
          getProductName={getProductName}
          acceptOrder={acceptOrder}
          rejectOrder={rejectOrder}
          deliverOrder={deliverOrder}
          fetchOrders={fetchOrders}
          products={products}
          setSnackbar={setSnackbar}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default DashboardD;  