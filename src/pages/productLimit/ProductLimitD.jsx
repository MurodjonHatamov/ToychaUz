import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Snackbar, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBox, 
  FaSpinner,
  FaSearch,
  FaSync,
  FaStore,
  FaBalanceScale,
  FaCube
} from 'react-icons/fa';
import styles from './ProductLimitD.module.css';
import { logaut } from '../logaut';
import { baseURL } from '../config';

function ProductLimitD() {
  // ==================== STATE DEFINITIONS ====================
  
  const [productLimits, setProductLimits] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLimits, setFilteredLimits] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState(null);
  
  const [formData, setFormData] = useState({
    marketId: '',
    productId: '',
    amount: '',
    days: ''
  });
  
  const [filters, setFilters] = useState({
    marketId: '',
    productId: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [loading, setLoading] = useState({
    limits: true,
    markets: true,
    products: true,
    submit: false,
    delete: false
  });

  const API_BASE = `${baseURL}`;

  // ==================== API FUNCTIONS ====================

  /**
   * Barcha marketlarni yuklash
   */
  const fetchMarkets = async () => {
    try {
      setLoading(prev => ({ ...prev, markets: true }));
      
      const response = await fetch(`${API_BASE}/markets`, {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      logaut(response);
      
      if (response.ok) {
        const marketsData = await response.json();
        setMarkets(marketsData);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
    
      showSnackbar('Marketlarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, markets: false }));
    }
  };

  /**
   * Barcha mahsulotlarni yuklash
   */
  const fetchProducts = async () => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      
      const response = await fetch(`${API_BASE}/products`, {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      logaut(response);
      if (response.ok) {
        const productsData = await response.json();
        setProducts(productsData);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
          
      showSnackbar('Mahsulotlarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  /**
   * Limitlarni yuklash
   */
  const fetchProductLimits = async () => {
    try {
      setLoading(prev => ({ ...prev, limits: true }));
      
      const queryParams = new URLSearchParams();
      if (filters.marketId) queryParams.append('marketId', filters.marketId);
      if (filters.productId) queryParams.append('productId', filters.productId);

      const response = await fetch(`${API_BASE}/product-limit?${queryParams}`, {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      logaut(response);
      if (response.ok) {
        const limitsData = await response.json();
        setProductLimits(limitsData);
        setFilteredLimits(limitsData);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      
      showSnackbar('Limitlarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, limits: false }));
    }
  };

  /**
   * Yangi limit qo'shish
   */
  const createProductLimit = async (limitData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const response = await fetch(
        `${API_BASE}/product-limit/${limitData.marketId}/${limitData.productId}`, 
        {
          method: 'POST',
          headers: { 
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: parseInt(limitData.amount),
            days: parseInt(limitData.days)
          })
        }
      );
      logaut(response);
      if (response.ok) {
        showSnackbar('Limit muvaffaqiyatli qoʻshildi', 'success');
        fetchProductLimits();
        resetForm();
        setDialogOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server xatosi: ${response.status}`);
      }
    } catch (error) {
  
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  /**
   * Limitni yangilash
   */
  const updateProductLimit = async (limitId, limitData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const response = await fetch(`${API_BASE}/product-limit/${limitId}`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseInt(limitData.amount),
          days: parseInt(limitData.days)
        })
      });
      logaut(response);
      if (response.ok) {
        showSnackbar('Limit muvaffaqiyatli yangilandi', 'success');
        fetchProductLimits();
        resetForm();
        setDialogOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server xatosi: ${response.status}`);
      }
    } catch (error) {
   
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  /**
   * Limitni o'chirish
   */
  const deleteProductLimit = async (limitId) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      
      const response = await fetch(`${API_BASE}/product-limit/${limitId}`, {
        method: 'DELETE',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      logaut(response);
      if (response.ok) {
        showSnackbar('Limit muvaffaqiyatli oʻchirildi', 'success');
        fetchProductLimits();
        setDeleteDialogOpen(false);
        setEditingLimit(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server xatosi: ${response.status}`);
      }
    } catch (error) {
  
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // ==================== FORM HANDLERS ====================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      marketId: '',
      productId: '',
      amount: '',
      days: ''
    });
    setEditingLimit(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validatsiya
    if (!formData.marketId || !formData.productId || !formData.amount || !formData.days) {
      showSnackbar('Iltimos, barcha maydonlarni toʻldiring', 'warning');
      return;
    }

    if (formData.amount <= 0 || formData.days <= 0) {
      showSnackbar('Miqdor va kunlar soni 0 dan katta boʻlishi kerak', 'warning');
      return;
    }

    if (editingLimit) {
      updateProductLimit(editingLimit._id, formData);
    } else {
      createProductLimit(formData);
    }
  };

  const handleEdit = (limit) => {
    setEditingLimit(limit);
    setFormData({
      marketId: limit.marketId,
      productId: limit.productId,
      amount: limit.amount.toString(),
      days: limit.days.toString()
    });
    setDialogOpen(true);
  };

  const handleDelete = (limit) => {
    setEditingLimit(limit);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  // ==================== SEARCH & FILTER ====================

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredLimits(productLimits);
    } else {
      const filtered = productLimits.filter(limit => {
        const market = markets.find(m => m._id === limit.marketId);
        const product = products.find(p => p._id === limit.productId);
        
        return (
          (market?.name?.toLowerCase().includes(term)) ||
          (product?.name?.toLowerCase().includes(term)) ||
          (limit.amount?.toString().includes(term)) ||
          (limit.days?.toString().includes(term))
        );
      });
      setFilteredLimits(filtered);
    }
  };

  const applyFilters = () => {
    fetchProductLimits();
  };

  const clearFilters = () => {
    setFilters({
      marketId: '',
      productId: ''
    });
    setSearchTerm('');
    fetchProductLimits();
  };

  // ==================== HELPER FUNCTIONS ====================

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Noma\'lum';
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMarketName = (marketId) => {
    const market = markets.find(m => m._id === marketId);
    return market?.name || 'Noma\'lum market';
  };

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product?.name || 'Noma\'lum mahsulot';
  };

  const getProductUnit = (productId) => {
    const product = products.find(p => p._id === productId);
    return product?.unit || 'piece'; // default qiymat
  };

  const getUnitDisplayName = (unit) => {
    const unitMap = {
      'kg': 'kg',
      'piece': 'dona',
      'liter': 'litr',
      'meter': 'metr',
      'pack': 'paket',
      'box': 'quti'
    };
    return unitMap[unit] || unit;
  };

  const getUnitIcon = (unit) => {
    const iconMap = {
      'kg': <FaBalanceScale className={styles.unitIcon} />,
      'piece': <FaCube className={styles.unitIcon} />,
      'liter': '🥤',
      'meter': '📏',
      'pack': '📦',
      'box': '📦'
    };
    return iconMap[unit] || <FaBox className={styles.unitIcon} />;
  };

  const calculateEndDate = (startDate, days) => {
    if (!startDate) return 'Noma\'lum';
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    return formatDate(endDate);
  };

  // ==================== USE EFFECT HOOKS ====================

  useEffect(() => {
    fetchMarkets();
    fetchProducts();
    fetchProductLimits();
  }, []);

  useEffect(() => {
    // Filtrlar o'zgarganda limitlarni yangilash
    fetchProductLimits();
  }, [filters.marketId, filters.productId]);

  // ==================== RENDER ====================

  return (
    <div className={styles.productLimitsPage}>
      {/* SARLAVHA VA AKTsiYALAR */}
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <div className={styles.title}>
            <FaBox className={styles.titleIcon} />
            <h1>Mahsulot Limitlari Boshqaruvi</h1>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="outlined"
              startIcon={<FaSync />}
              onClick={fetchProductLimits}
              className={styles.refreshButton}
              disabled={loading.limits}
            >
              {loading.limits ? 'Yuklanmoqda...' : 'Yangilash'}
            </Button>
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={handleAddNew}
              className={styles.addButton}
            >
              Yangi Limit
            </Button>
          </div>
        </div>

        {/* FILTRLAR */}
        <div className={styles.filtersSection}>
          <div className={styles.filterGrid}>
            <FormControl fullWidth size="small" className={styles.filterField}>
              <InputLabel>Market</InputLabel>
              <Select
                value={filters.marketId}
                onChange={(e) => handleFilterChange('marketId', e.target.value)}
                label="Market"
              >
                <MenuItem value="">Barcha Marketlar</MenuItem>
                {markets.map((market) => (
                  <MenuItem key={market._id} value={market._id}>
                    {market.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" className={styles.filterField}>
              <InputLabel>Mahsulot</InputLabel>
              <Select
                value={filters.productId}
                onChange={(e) => handleFilterChange('productId', e.target.value)}
                label="Mahsulot"
              >
                <MenuItem value="">Barcha Mahsulotlar</MenuItem>
                {products.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    <div className={styles.productMenuItem}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productUnit}>
                        ({getUnitDisplayName(product.unit)})
                      </span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className={styles.filterActions}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                className={styles.clearFilterButton}
              >
                Tozalash
              </Button>
            </div>
          </div>
        </div>

        {/* QIDIRUV */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Market, mahsulot, miqdor yoki kunlar boʻyicha qidirish..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.limitsCount}>
            Jami: {filteredLimits.length} ta limit
          </div>
        </div>
      </div>

      {/* LIMITLAR JADVALI */}
      <div className={styles.tableSection}>
        {loading.limits ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Limitlar yuklanmoqda...</span>
          </div>
        ) : filteredLimits.length > 0 ? (
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table className={styles.table}>
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell className={styles.tableHeaderCell}>Market</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Mahsulot</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Limit Miqdori</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Kunlar</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Boshlanish Sanasi</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Tugash Sanasi</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Harakatlar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLimits.map((limit) => {
                  const productUnit = getProductUnit(limit.productId);
                  const unitDisplayName = getUnitDisplayName(productUnit);
                  
                  return (
                    <TableRow key={limit._id} className={styles.tableRow}>
                      <TableCell className={styles.tableCell}>
                        <div className={styles.marketCell}>
                          <FaStore className={styles.marketIcon} />
                          <span className={styles.marketName}>{getMarketName(limit.marketId)}</span>
                        </div>
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        <div className={styles.productCell}>
                          <FaBox className={styles.productIcon} />
                          <div className={styles.productInfo}>
                            <span className={styles.productName}>{getProductName(limit.productId)}</span>
                            
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        <div className={styles.amountCell}>
                          <span className={styles.amountText}>
                            {limit.amount}
                          </span>
                          <span className={styles.unitText}>
                            {unitDisplayName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        <span className={styles.daysText}>
                          {limit.days} kun
                        </span>
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        <span className={styles.dateText}>
                          {formatDate(limit.startDate)}
                        </span>
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        <span className={styles.dateText}>
                          {calculateEndDate(limit.startDate, limit.days)}
                        </span>
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <IconButton
                            onClick={() => handleEdit(limit)}
                            className={styles.editButton}
                            title="Tahrirlash"
                            size="small"
                          >
                            <FaEdit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(limit)}
                            className={styles.deleteButton}
                            title="Oʻchirish"
                            size="small"
                          >
                            <FaTrash />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <div className={styles.noData}>
            <FaBox className={styles.noDataIcon} />
            <div className={styles.noDataText}>
              {searchTerm || filters.marketId || filters.productId 
                ? 'Qidiruv boʻyicha limitlar topilmadi' 
                : 'Hech qanday limit topilmadi'
              }
            </div>
            {(searchTerm || filters.marketId || filters.productId) && (
              <Button
                variant="outlined"
                onClick={clearFilters}
                className={styles.clearSearchButton}
              >
                Filtrlarni tozalash
              </Button>
            )}
          </div>
        )}
      </div>

      {/* LIMIT QO'SHISH/TAHRIRLASH MODALI */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          <FaBox className={styles.dialogIcon} />
          {editingLimit ? 'Limitni Tahrirlash' : 'Yangi Limit Qoʻshish'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent className={styles.dialogContent}>
            <div className={styles.formGrid}>
              <FormControl fullWidth className={styles.formField}>
                <InputLabel>Market *</InputLabel>
                <Select
                  name="marketId"
                  value={formData.marketId}
                  onChange={handleInputChange}
                  label="Market *"
                  required
                  disabled={!!editingLimit}
                >
                  {markets.map((market) => (
                    <MenuItem key={market._id} value={market._id}>
                      {market.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth className={styles.formField}>
                <InputLabel>Mahsulot *</InputLabel>
                <Select
                  name="productId"
                  value={formData.productId}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Mahsulot tanlanganda, unit ni ko'rsatish
                    const selectedProduct = products.find(p => p._id === e.target.value);
                    if (selectedProduct) {
                      showSnackbar(
                        `Tanlangan mahsulot: ${selectedProduct.name} (${getUnitDisplayName(selectedProduct.unit)})`,
                        'info'
                      );
                    }
                  }}
                  label="Mahsulot *"
                  required
                  disabled={!!editingLimit}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      <div className={styles.productMenuItem}>
                        <span className={styles.productName}>{product.name}</span>
                        <span className={styles.productUnit}>
                          ({getUnitDisplayName(product.unit)})
                        </span>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={
                  formData.productId 
                    ? `Limit Miqdori (${getUnitDisplayName(getProductUnit(formData.productId))}) *`
                    : 'Limit Miqdori *'
                }
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className={styles.formField}
                placeholder={
                  formData.productId 
                    ? `Masalan: 200 ${getUnitDisplayName(getProductUnit(formData.productId))}`
                    : 'Masalan: 200'
                }
                inputProps={{ min: 1 }}
            
              />

              <TextField
                fullWidth
                label="Kunlar *"
                name="days"
                type="number"
                value={formData.days}
                onChange={handleInputChange}
                required
                className={styles.formField}
                placeholder="Masalan: 7"
                inputProps={{ min: 1 }}
               
              />
            </div>

            {/* Selected product info */}
            {formData.productId && (
              <div className={styles.selectedProductInfo}>
                <div className={styles.productInfoCard}>
                  <FaBox className={styles.infoIcon} />
                  <div className={styles.productDetails}>
                    <div className={styles.productName}>
                      {getProductName(formData.productId)}
                    </div>
                    <div className={styles.productUnit}>
                      Oʻlchov birligi: {getUnitDisplayName(getProductUnit(formData.productId))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>

          <DialogActions className={styles.dialogActions}>
            <Button
              onClick={() => setDialogOpen(false)}
              className={styles.cancelButton}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading.submit}
              className={styles.submitButton}
            >
              {loading.submit ? (
                <>
                  <FaSpinner className={styles.buttonSpinner} />
                  {editingLimit ? 'Saqlanmoqda...' : 'Qoʻshilmoqda...'}
                </>
              ) : (
                editingLimit ? 'Saqlash' : 'Qoʻshish'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* O'CHIRISH TASDIQLASH MODALI */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className={styles.deleteDialogTitle}>
          <FaTrash className={styles.deleteDialogIcon} />
          Limitni Oʻchirish
        </DialogTitle>
        
        <DialogContent className={styles.deleteDialogContent}>
          <div className={styles.deleteWarning}>
            Quyidagi limitni oʻchirishni tasdiqlaysizmi?
          </div>
          
          {editingLimit && (
            <div className={styles.limitToDelete}>
              <div className={styles.deleteLimitMarket}>
                <FaStore className={styles.deleteIcon} />
                Market: {getMarketName(editingLimit.marketId)}
              </div>
              <div className={styles.deleteLimitProduct}>
                <FaBox className={styles.deleteIcon} />
                Mahsulot: {getProductName(editingLimit.productId)}
              </div>
              <div className={styles.deleteLimitDetails}>
                {editingLimit.amount} {getUnitDisplayName(getProductUnit(editingLimit.productId))} / {editingLimit.days} kun
              </div>
            </div>
          )}

          <div className={styles.deleteNote}>
            ⚠️ Bu amalni ortga qaytarib boʻlmaydi!
          </div>
        </DialogContent>

        <DialogActions className={styles.deleteDialogActions}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className={styles.cancelDeleteButton}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={() => deleteProductLimit(editingLimit?._id)}
            variant="contained"
            color="error"
            disabled={loading.delete}
            className={styles.confirmDeleteButton}
          >
            {loading.delete ? (
              <>
                <FaSpinner className={styles.buttonSpinner} />
                Oʻchirilmoqda...
              </>
            ) : (
              'Oʻchirish'
            )}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ProductLimitD;