import React, { useState, useEffect } from 'react';
import {
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
  TextField
} from '@mui/material';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFolder,
  FaSpinner,
  FaSearch,
  FaCalendarAlt,
  FaTags
} from 'react-icons/fa';
import styles from './Categories.module.css';
import { logaut } from '../../pages/logaut';
import { baseURL } from '../../pages/config';

function Categories() {
  // ==================== STATE DEFINITIONS ====================
  
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [loading, setLoading] = useState({
    categories: true,
    submit: false,
    delete: false
  });

  const [formErrors, setFormErrors] = useState({
    name: ''
  });

  // ==================== API FUNCTIONS ====================

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      
      const response = await fetch(`${baseURL}/product-category`, {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      logaut(response);
      
      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      showSnackbar('Kategoriyalarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const createCategory = async (categoryData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const response = await fetch(`${baseURL}/product-category`, {
        method: 'POST',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(categoryData)
      });

      logaut(response);

      if (response.ok) {
        const newCategory = await response.json();
        showSnackbar('✅ Kategoriya muvaffaqiyatli qoʻshildi', 'success');
        setCategories(prev => [...prev, newCategory]);
        setFilteredCategories(prev => [...prev, newCategory]);
        resetForm();
        setDialogOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Create category error:', error);
      showSnackbar(`❌ ${error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const response = await fetch(`${baseURL}/product-category/${categoryId}`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(categoryData)
      });

      logaut(response);

      if (response.ok) {
        const updatedCategory = await response.json();
        showSnackbar('✅ Kategoriya muvaffaqiyatli yangilandi', 'success');
        setCategories(prev => prev.map(cat => 
          cat._id === updatedCategory._id ? updatedCategory : cat
        ));
        setFilteredCategories(prev => prev.map(cat => 
          cat._id === updatedCategory._id ? updatedCategory : cat
        ));
        resetForm();
        setDialogOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Update category error:', error);
      showSnackbar(`❌ ${error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      
      const response = await fetch(`${baseURL}/product-category/${categoryId}`, {
        method: 'DELETE',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      logaut(response);

      if (response.ok) {
        showSnackbar('✅ Kategoriya muvaffaqiyatli oʻchirildi', 'success');
        setCategories(prev => prev.filter(cat => cat._id !== categoryId));
        setFilteredCategories(prev => prev.filter(cat => cat._id !== categoryId));
        setDeleteDialogOpen(false);
        setEditingCategory(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Delete category error:', error);
      showSnackbar(`❌ ${error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // ==================== FORM VALIDATION ====================

  const validateForm = () => {
    const errors = {
      name: ''
    };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Kategoriya nomi majburiy';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Kategoriya nomi kamida 2 ta belgidan iborat boʻlishi kerak';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // ==================== FORM HANDLERS ====================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: ''
    });
    setFormErrors({
      name: ''
    });
    setEditingCategory(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showSnackbar('Iltimos, barcha maydonlarni toʻgʻri toʻldiring', 'warning');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory._id, formData);
    } else {
      createCategory(formData);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name
    });
    setDialogOpen(true);
  };

  const handleDelete = (category) => {
    setEditingCategory(category);
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
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(term)
      );
      setFilteredCategories(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredCategories(categories);
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
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==================== USE EFFECT HOOKS ====================

  useEffect(() => {
    fetchCategories();
  }, []);

  // ==================== RENDER ====================

  return (
    <div className={styles.categoriesPage}>
      {/* SARLAVHA VA AKTsiYALAR */}
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <div className={styles.title}>
            <FaFolder className={styles.titleIcon} />
            <div>
              <h1>Mahsulot Kategoriyalari</h1>
         
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={handleAddNew}
            className={styles.addButton}
            disableElevation
          >
            Yangi Kategoriya
          </Button>
        </div>

        {/* QIDIRUV */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <TextField
              variant="outlined"
              placeholder="Kategoriya nomi boʻyicha qidirish..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
              size="small"
              fullWidth
              InputProps={{
                className: styles.searchInputField
              }}
            />
    
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Jami:</span>
              <span className={styles.statValue}>{filteredCategories.length} ta</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Koʻrsatilmoqda:</span>
              <span className={styles.statValue}>{filteredCategories.length}/{categories.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KATEGORIYALAR JADVALI */}
      <div className={styles.tableSection}>
        {loading.categories ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Kategoriyalar yuklanmoqda...</span>
          </div>
        ) : filteredCategories.length > 0 ? (
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table className={styles.table}>
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell className={styles.tableHeaderCell}>Kategoriya Nomi</TableCell>
                  <TableCell className={styles.tableHeaderCell}>
                    <div className={styles.dateHeader}>
                      <FaCalendarAlt className={styles.dateIcon} />
                      Yaratilgan Sana
                    </div>
                  </TableCell>
                
                  <TableCell className={styles.tableHeaderCell}>Harakatlar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category._id} className={styles.tableRow}>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.categoryNameCell}>
                        <FaTags className={styles.categoryIcon} />
                        <span className={styles.categoryName}>{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.dateText}>
                        {formatDate(category.createdAt)}
                      </span>
                    </TableCell>
                  
                    <TableCell className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <IconButton
                          onClick={() => handleEdit(category)}
                          className={styles.editButton}
                          title="Tahrirlash"
                          size="small"
                        >
                          <FaEdit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(category)}
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
            <FaFolder className={styles.noDataIcon} />
            <div className={styles.noDataText}>
              {searchTerm ? 'Qidiruv boʻyicha kategoriyalar topilmadi' : 'Hech qanday kategoriya topilmadi'}
            </div>
            {searchTerm && (
              <Button
                variant="outlined"
                onClick={clearSearch}
                className={styles.clearSearchButton}
              >
                Qidiruvni tozalash
              </Button>
            )}
            {!searchTerm && (
              <Button
                variant="contained"
                onClick={handleAddNew}
                className={styles.addFirstButton}
                startIcon={<FaPlus />}
              >
                Birinchi Kategoriyani Qoʻshish
              </Button>
            )}
          </div>
        )}
      </div>

      {/* KATEGORIYA QO'SHISH/TAHRIRLASH MODALI */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          <FaFolder className={styles.dialogIcon} />
          {editingCategory ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Qoʻshish'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent className={styles.dialogContent}>
            <div className={styles.formGrid}>
              <TextField
                fullWidth
                label="Kategoriya Nomi"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={styles.formField}
                placeholder="Masalan: Sabzavotlar"
                error={!!formErrors.name}
                helperText={formErrors.name}
                autoFocus
              />
            </div>
          </DialogContent>

          <DialogActions className={styles.dialogActions}>
            <Button
              onClick={() => setDialogOpen(false)}
              className={styles.cancelButton}
              disabled={loading.submit}
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
                  {editingCategory ? 'Saqlanmoqda...' : 'Qoʻshilmoqda...'}
                </>
              ) : (
                editingCategory ? 'Saqlash' : 'Qoʻshish'
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
          Kategoriyani Oʻchirish
        </DialogTitle>
        
        <DialogContent className={styles.deleteDialogContent}>
          <div className={styles.deleteWarning}>
            Quyidagi kategoriyani oʻchirishni tasdiqlaysizmi?
          </div>
          
          {editingCategory && (
            <div className={styles.categoryToDelete}>
              <div className={styles.deleteCategoryIcon}>
                <FaFolder />
              </div>
              <div className={styles.deleteCategoryName}>{editingCategory.name}</div>
            
            </div>
          )}

          <div className={styles.deleteNote}>
            ⚠️ Kategoriyani o‘chirsangiz, unga tegishli barcha mahsulotlar kategoriyasiz qoladi.
            Bu amalni ortga qaytarib bo‘lmaydi.
          </div>
        </DialogContent>

        <DialogActions className={styles.deleteDialogActions}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className={styles.cancelDeleteButton}
            disabled={loading.delete}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={() => deleteCategory(editingCategory?._id)}
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
        autoHideDuration={4000}
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

export default Categories;