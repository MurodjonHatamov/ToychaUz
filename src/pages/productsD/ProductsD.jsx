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
  MenuItem
} from '@mui/material';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBox, 
  FaSpinner,
  FaSearch,
  FaWeight,
  FaRuler,
  FaCube,
  FaWineBottle
} from 'react-icons/fa';
import styles from './ProductsD.module.css';

function ProductsD() {
  // ==================== STATE DEFINITIONS ====================
  
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    unit: 'piece'
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [loading, setLoading] = useState({
    products: true,
    submit: false,
    delete: false
  });

  // O'lchov birliklari
  const unitOptions = [
    { value: 'piece', label: 'Dona', icon: <FaCube /> },
    { value: 'liter', label: 'Litr', icon: <FaWineBottle /> },
    { value: 'kg', label: 'Kilogram', icon: <FaWeight /> },
    { value: 'm', label: 'Metr', icon: <FaRuler /> }
  ];

  // ==================== API FUNCTIONS ====================

  const fetchProducts = async () => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      
      const response = await fetch('http://localhost:2277/products', {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const productsData = await response.json();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Mahsulotlarni yuklab boʻlmadi:', error);
      showSnackbar('Mahsulotlarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const createProduct = async (productData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const response = await fetch('http://localhost:2277/products', {
        method: 'POST',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        showSnackbar('Mahsulot muvaffaqiyatli qoʻshildi', 'success');
        fetchProducts();
        resetForm();
        setDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Mahsulot qoʻshib boʻlmadi:', error);
      showSnackbar('Mahsulot qoʻshib boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const response = await fetch(`http://localhost:2277/products/${productId}`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        showSnackbar('Mahsulot maʼlumotlari muvaffaqiyatli yangilandi', 'success');
        fetchProducts();
        resetForm();
        setDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Mahsulot maʼlumotlarini yangilab boʻlmadi:', error);
      showSnackbar('Mahsulot maʼlumotlarini yangilab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const deleteProduct = async (productId) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      
      const response = await fetch(`http://localhost:2277/products/${productId}`, {
        method: 'DELETE',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        showSnackbar('Mahsulot muvaffaqiyatli oʻchirildi', 'success');
        fetchProducts();
        setDeleteDialogOpen(false);
        setEditingProduct(null);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Mahsulotni oʻchirib boʻlmadi:', error);
      showSnackbar('Mahsulotni oʻchirib boʻlmadi', 'error');
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

  const resetForm = () => {
    setFormData({
      name: '',
      unit: 'piece'
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.unit) {
      showSnackbar('Iltimos, barcha majburiy maydonlarni toʻldiring', 'warning');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct._id, formData);
    } else {
      createProduct(formData);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      unit: product.unit
    });
    setDialogOpen(true);
  };

  const handleDelete = (product) => {
    setEditingProduct(product);
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
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.unit.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    }
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
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getUnitIcon = (unit) => {
    const unitOption = unitOptions.find(opt => opt.value === unit);
    return unitOption ? unitOption.icon : <FaCube />;
  };

  const getUnitLabel = (unit) => {
    const unitOption = unitOptions.find(opt => opt.value === unit);
    return unitOption ? unitOption.label : unit;
  };

  // ==================== USE EFFECT HOOKS ====================

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==================== RENDER ====================

  return (
    <div className={styles.productsPage}>
      {/* SARLAVHA VA AKTsiYALAR */}
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <div className={styles.title}>
            <FaBox className={styles.titleIcon} />
            <h1>Mahsulotlar Boshqaruvi</h1>
          </div>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={handleAddNew}
            className={styles.addButton}
          >
            Yangi Mahsulot
          </Button>
        </div>

        {/* QIDIRUV */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Mahsulot nomi yoki o'lchov birligi boʻyicha qidirish..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.productCount}>
            Jami: {filteredProducts.length} ta mahsulot
          </div>
        </div>
      </div>

      {/* MAHSULOTLAR JADVALI */}
      <div className={styles.tableSection}>
        {loading.products ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Mahsulotlar yuklanmoqda...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table className={styles.table}>
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell className={styles.tableHeaderCell}>Mahsulot Nomi</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Oʻlchov Birligi</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Qoʻshilgan Sana</TableCell>
               
                  <TableCell className={styles.tableHeaderCell}>Harakatlar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id} className={styles.tableRow}>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.productNameCell}>
                        <FaBox className={styles.productIcon} />
                        <span className={styles.productName}>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.unitCell}>
                        {getUnitIcon(product.unit)}
                        <span className={styles.unitText}>
                          {getUnitLabel(product.unit)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.dateText}>
                        {formatDate(product.createdAt)}
                      </span>
                    </TableCell>
                  
                    <TableCell className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <IconButton
                          onClick={() => handleEdit(product)}
                          className={styles.editButton}
                          title="Tahrirlash"
                          size="small"
                        >
                          <FaEdit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(product)}
                          className={styles.deleteButton}
                          title="Oʻchirish"
                          size="small"
                        >
                          <FaTrash />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <div className={styles.noData}>
            <FaBox className={styles.noDataIcon} />
            <div className={styles.noDataText}>
              {searchTerm ? 'Qidiruv boʻyicha mahsulotlar topilmadi' : 'Hech qanday mahsulot topilmadi'}
            </div>
            {searchTerm && (
              <Button
                variant="outlined"
                onClick={() => setSearchTerm('')}
                className={styles.clearSearchButton}
              >
                Qidiruvni tozalash
              </Button>
            )}
          </div>
        )}
      </div>

      {/* MAHSULOT QO'SHISH/TAHRIRLASH MODALI */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          <FaBox className={styles.dialogIcon} />
          {editingProduct ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qoʻshish'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent className={styles.dialogContent}>
            <div className={styles.formGrid}>
              <TextField
                fullWidth
                label="Mahsulot Nomi"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={styles.formField}
                placeholder="Masalan: Coca-Cola 1.5L"
              />

              <TextField
                select
                fullWidth
                label="Oʻlchov Birligi"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                className={styles.formField}
              >
                {unitOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <div className={styles.unitMenuItem}>
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                  </MenuItem>
                ))}
              </TextField>
            </div>
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
                  {editingProduct ? 'Saqlanmoqda...' : 'Qoʻshilmoqda...'}
                </>
              ) : (
                editingProduct ? 'Saqlash' : 'Qoʻshish'
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
          Mahsulotni Oʻchirish
        </DialogTitle>
        
        <DialogContent className={styles.deleteDialogContent}>
          <div className={styles.deleteWarning}>
            Quyidagi mahsulotni oʻchirishni tasdiqlaysizmi?
          </div>
          
          {editingProduct && (
            <div className={styles.productToDelete}>
              <div className={styles.deleteProductName}>{editingProduct.name}</div>
              <div className={styles.deleteProductUnit}>
                Oʻlchov birligi: {getUnitLabel(editingProduct.unit)}
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
            onClick={() => deleteProduct(editingProduct?._id)}
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

export default ProductsD;