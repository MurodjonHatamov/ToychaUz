import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import {
  FaDownload,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
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
  const [categories, setCategories] = useState([]); // ✅ Yangi: kategoriyalar
  const [selectedCategory, setSelectedCategory] = useState("all"); // ✅ Yangi: tanlangan kategoriya
  const [marketNames, setMarketNames] = useState({});
  const [productNames, setProductNames] = useState({});
  const [categoryNames, setCategoryNames] = useState({}); // ✅ Yangi: kategoriya nomlari

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // ✅ VAQT VA KATEGORIYA FILTRLARI
  const [filters, setFilters] = useState({
    status: "all",
    from: "",
    to: "",
    categoryId: "all", // ✅ Yangi: kategoriya filteri
  });

  const [loading, setLoading] = useState({
    markets: true,
    orders: false,
    export: false,
    details: false,
    products: true,
    categories: true, // ✅ Yangi: kategoriyalar yuklanmoqda
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // ==================== API FUNCTIONS ====================

  const fetchMarkets = async () => {
    try {
      setLoading((prev) => ({ ...prev, markets: true }));
      const response = await fetch(`${baseURL}/markets`, {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        const marketsData = await response.json();
        setMarkets(marketsData);
        const marketMap = {};
        marketsData.forEach((market) => {
          marketMap[market._id] = market.name;
        });
        setMarketNames(marketMap);
      }
    } catch (error) {
      showSnackbar("Marketlarni yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, markets: false }));
    }
  };

  // ✅ YANGI: KATEGORIYALARNI OLISH FUNKSIYASI
  const fetchCategories = async () => {
    try {
      setLoading((prev) => ({ ...prev, categories: true }));
      const response = await fetch(`${baseURL}/product-category`, {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
        
        // Kategoriya nomlari map'ini yaratish
        const categoryMap = {};
        categoriesData.forEach((category) => {
          categoryMap[category._id] = category.name;
        });
        setCategoryNames(categoryMap);
      }
    } catch (error) {
      showSnackbar("Kategoriyalarni yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading((prev) => ({ ...prev, products: true }));
      const response = await fetch(`${baseURL}/products`, {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      logaut(response);

      if (response.ok) {
        const productsData = await response.json();
        setProducts(productsData);
        const productMap = {};
        productsData.forEach((product) => {
          productMap[product._id] = product.name;
        });
        setProductNames(productMap);
      }
    } catch (error) {
      showSnackbar("Mahsulotlarni yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  // ✅ KATEGORIYA FILTRI BILAN QIDIRISH FUNKSIYASI
  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      setLoading((prev) => ({ ...prev, orders: true }));

      const queryParams = new URLSearchParams();

      if (selectedMarket && selectedMarket !== "all") {
        queryParams.append("marketId", selectedMarket);
      }

      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }

      // ✅ Kategoriya filteri qo'shildi
      if (filters.categoryId && filters.categoryId !== "all") {
        queryParams.append("categoryId", filters.categoryId);
      }

      // ✅ Datetime-local formatni ISO formatga o'zgartirish
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

      const response = await fetch(
        `${baseURL}/deliver/orders?${queryParams}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      logaut(response);

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);

        const total = data.total || 0;
        const lim = data.limit || limit;
        const currentPage = data.page || page;

        setPagination({
          page: currentPage,
          limit: lim,
          total: total,
          totalPages: Math.ceil(total / lim),
        });
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      showSnackbar("Buyurtmalarni yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading((prev) => ({ ...prev, details: true }));
      const response = await fetch(
        `${baseURL}/deliver/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      logaut(response);

      if (response.ok) {
        const order = await response.json();
        setSelectedOrder(order);
        setOrderDialogOpen(true);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      showSnackbar("Buyurtma ma'lumotlarini olish mumkin emas", "error");
    } finally {
      setLoading((prev) => ({ ...prev, details: false }));
    }
  };

  // ==================== PAGINATION FUNCTIONS ====================

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    fetchOrders(1, newLimit);
  };

  // ==================== HELPER FUNCTIONS ====================

  const getMarketName = (marketId) => {
    if (!marketId) return "Noma'lum market";
    if (typeof marketId === "object" && marketId.name) {
      return marketId.name;
    }
    const marketName = marketNames[marketId];
    return marketName || "Noma'lum market";
  };

  const getProductName = (productId) => {
    if (!productId) return "Noma'lum mahsulot";
    if (typeof productId === "object" && productId.name) {
      return productId.name;
    }
    const productName = productNames[productId];
    return productName || "Noma'lum mahsulot";
  };

  // ✅ KATEGORIYA NOMINI OLISH
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Noma'lum kategoriya";
    if (typeof categoryId === "object" && categoryId.name) {
      return categoryId.name;
    }
    const categoryName = categoryNames[categoryId];
    return categoryName || "Noma'lum kategoriya";
  };

  // ✅ SANA VA VAQTNI FORMATLASH FUNKSIYASI
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `(${month}/${day}/${year} ${hours}:${minutes})`;
  };

  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(
        `${baseURL}/deliver/${orderId}/accept-order`,
        {
          method: "PATCH",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      logaut(response);

      if (response.ok) {
        showSnackbar("Buyurtma muvaffaqiyatli qabul qilindi", "success");
        fetchOrders(pagination.page, pagination.limit);
        setOrderDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      showSnackbar("Buyurtmani qabul qilib boʻlmadi", "error");
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      const response = await fetch(
        `${baseURL}/deliver/${orderId}/delivered-order`,
        {
          method: "PATCH",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      logaut(response);

      if (response.ok) {
        showSnackbar("Buyurtma muvaffaqiyatli yetkazib berildi", "success");
        fetchOrders(pagination.page, pagination.limit);
        setOrderDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      showSnackbar("Buyurtmani yetkazib berib boʻlmadi", "error");
    }
  };

  const rejectOrder = async (orderId) => {
    try {
      const isConfirmed = window.confirm(
        "Haqiqatan ham bu buyurtmani bekor qilmoqchimisiz?"
      );
      if (!isConfirmed) return;

      const response = await fetch(
        `${baseURL}/deliver/${orderId}/reject-order`,
        {
          method: "PATCH",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      logaut(response);

      if (response.ok) {
        showSnackbar("Buyurtma muvaffaqiyatli bekor qilindi", "warning");
        fetchOrders(pagination.page, pagination.limit);
        setOrderDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      showSnackbar("Buyurtmani bekor qilib boʻlmadi", "error");
    }
  };

  // ✅ KATEGORIYA FILTRI BILAN EXPORT QILISH
  const exportToExcel = async () => {
    try {
      setLoading((prev) => ({ ...prev, export: true }));

      const queryParams = new URLSearchParams();

      if (selectedMarket && selectedMarket !== "all") {
        queryParams.append("marketId", selectedMarket);
      }
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters.categoryId && filters.categoryId !== "all") {
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

      const response = await fetch(
        `${baseURL}/deliver/export?${queryParams}`,
        {
          method: "GET",
          headers: {
            accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          credentials: "include",
        }
      );
      logaut(response);

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error("Fayl bo'sh");
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const fileName = `buyurtmalar_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showSnackbar("Excel fayl muvaffaqiyatli yuklab olindi", "success");
      } else {
        const errorText = await response.text();
        throw new Error(`Server xatosi: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      showSnackbar(`Export qilib boʻlmadi: ${error.message}`, "error");
    } finally {
      setLoading((prev) => ({ ...prev, export: false }));
    }
  };

  // ==================== EXCEL TABLE FUNCTIONS ====================

  const calculateExcelTableData = () => {
    const productData = {};
    const orderColumns = {};

    orders.forEach((order) => {
      const marketName = getMarketName(order.marketId);
      const dateTime = formatDateTime(order.createdAt);
      const status = order.status;
      const orderKey = `${marketName} (${dateTime})`;

      orderColumns[orderKey] = {
        order: order,
        status: status,
        marketName: marketName,
        dateTime: dateTime,
      };

      order.products?.forEach((product) => {
        const productName = getProductName(product.productId);

        if (!productData[productName]) {
          productData[productName] = {};
        }

        productData[productName][orderKey] = product.quantity;
      });
    });

    return {
      productData,
      orderColumns,
      orderKeys: Object.keys(orderColumns).sort(),
    };
  };

  const calculateTotals = (productData, orderKeys) => {
    const rowTotals = {};
    const columnTotals = {};
    let grandTotal = 0;

    Object.keys(productData).forEach((productName) => {
      rowTotals[productName] = orderKeys.reduce((sum, orderKey) => {
        return sum + (productData[productName][orderKey] || 0);
      }, 0);
    });

    orderKeys.forEach((orderKey) => {
      columnTotals[orderKey] = Object.keys(productData).reduce(
        (sum, productName) => {
          return sum + (productData[productName][orderKey] || 0);
        },
        0
      );
    });

    grandTotal = Object.values(rowTotals).reduce(
      (sum, total) => sum + total,
      0
    );

    return { rowTotals, columnTotals, grandTotal };
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "#1976d2";
      case "accepted":
        return "#ed6c02";
      case "delivered":
        return "#2e7d32";
      case "rejected":
        return "#d32f2f";
      default:
        return "#666666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "new":
        return "Yangi";
      case "accepted":
        return "Qabul qilindi";
      case "delivered":
        return "Yetkazib berildi";
      case "rejected":
        return "Rad etildi";
      default:
        return status;
    }
  };

  // ==================== USE EFFECT HOOKS ====================

  useEffect(() => {
    fetchMarkets();
    fetchProducts();
    fetchCategories(); // ✅ Kategoriyalarni yuklash
  }, []);

  useEffect(() => {
    fetchOrders(1, pagination.limit);
  }, [selectedMarket, filters]);

  // ✅ VAQTNI QO'SHGAN JADVAL MA'LUMOTLARI
  const { productData, orderColumns, orderKeys } = calculateExcelTableData();
  const { rowTotals, columnTotals, grandTotal } = calculateTotals(
    productData,
    orderKeys
  );

  // ==================== RENDER ====================

  return (
    <div className={styles.dashboard}>
      {/* FILTR PANELI - datetime-local va kategoriya bilan */}
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
              {markets.map((market) => (
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
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="all">Barchasi</option>
              <option value="new">Yangi</option>
              <option value="accepted">Qabul qilindi</option>
              <option value="delivered">Yetkazib berildi</option>
              <option value="rejected">Rad etildi</option>
            </select>
          </div>

          {/* ✅ YANGI: KATEGORIYA FILTRI */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Kategoriya</label>
            <select
              className={styles.filterSelect}
              value={filters.categoryId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              disabled={loading.categories}
            >
              <option value="all">Barcha Kategoriyalar</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ DATETIME-LOCAL INPUTLARI */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Dan (sana va vaqt)</label>
            <input
              type="datetime-local"
              className={styles.filterInput}
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Gacha (sana va vaqt)</label>
            <input
              type="datetime-local"
              className={styles.filterInput}
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
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
            Jami: {pagination.total} ta buyurtma | Sahifa: {pagination.page} /{" "}
            {pagination.totalPages}
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
            <table className={styles.excelTable}>
              <thead>
                <tr>
                  <th className={styles.productHeader}>
                    Mahsulot nomi
                  </th>
                  {orderKeys.map((orderKey) => {
                    const order = orderColumns[orderKey]?.order;
                    const status = orderColumns[orderKey]?.status;
                    const dateTime = orderColumns[orderKey]?.dateTime;
                    
                    return (
                      <th
                        key={orderKey}
                        className={styles.orderHeader}
                        style={{
                          backgroundColor: getStatusColor(status),
                          color: "white",
                        }}
                        onClick={() => order && fetchOrderDetails(order._id)}
                        title={`${orderKey} - ${getStatusText(
                          status
                        )} (Batafsil ko'rish uchun bosing)`}
                      >
                        <div className={styles.orderHeaderContent}>
                          <div className={styles.orderTitle}>
                            <div className={styles.marketName}>
                              {orderColumns[orderKey]?.marketName}
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
                {Object.keys(productData).map((productName, index) => (
                  <tr 
                    key={productName} 
                    className={`${styles.productRow} ${
                      index % 2 === 0 ? styles.evenRow : styles.oddRow
                    }`}
                  >
                    <td className={styles.productCell}>{productName}</td>
                    {orderKeys.map((orderKey) => (
                      <td key={orderKey} className={styles.quantityCell}>
                        {productData[productName][orderKey] || 0}
                      </td>
                    ))}
                    <td className={styles.rowTotal}>
                      {rowTotals[productName]}
                    </td>
                  </tr>
                ))}
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

      {/* DIALOG */}
      {orderDialogOpen && selectedOrder && (
      <EditOrderModal setOrderDialogOpen={setOrderDialogOpen}
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
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default DashboardD;