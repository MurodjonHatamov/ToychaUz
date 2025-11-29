// pages/deliver/Deliver.jsx
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
  IconButton
} from '@mui/material';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaSpinner,
  FaSearch,
  FaSync
} from 'react-icons/fa';
import styles from './Deliver.module.css';

function Deliver() {
  // ==================== STATE DEFINITIONS ====================
  
  const [delivers, setDelivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDelivers, setFilteredDelivers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDeliver, setEditingDeliver] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    return_password: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [loading, setLoading] = useState({
    delivers: true,
    submit: false,
    delete: false
  });

  // ==================== API FUNCTIONS ====================

  /**
   * Barcha deliverlarni serverdan yuklash
   */
  const fetchDelivers = async () => {
    try {
      setLoading(prev => ({ ...prev, delivers: true }));
      
      const response = await fetch('http://localhost:2277/deliver/all-delivers', {
        method: 'GET',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const deliversData = await response.json();
        setDelivers(deliversData);
        setFilteredDelivers(deliversData);
        console.log('Deliverlar:', deliversData);
        
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Deliverlarni yuklab boʻlmadi:', error);
      showSnackbar('Deliverlarni yuklab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, delivers: false }));
    }
  };

  /**
   * Yangi deliver qo'shish
   */
  const createDeliver = async (deliverData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      // Parollarni tekshirish
      if (deliverData.password !== deliverData.return_password) {
        throw new Error('Parollar mos kelmadi');
      }

      const response = await fetch('http://localhost:2277/deliver', {
        method: 'POST',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: deliverData.name,
          phone: deliverData.phone,
          password: deliverData.password,
          return_password: deliverData.return_password
        })
      });
      
      if (response.ok) {
        showSnackbar('Deliver muvaffaqiyatli qoʻshildi', 'success');
        fetchDelivers();
        resetForm();
        setDialogOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Deliver qoʻshib boʻlmadi:', error);
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  /**
   * Deliver ma'lumotlarini yangilash
   */
  const updateDeliver = async (deliverId, deliverData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      // Agar parol o'zgartirilayotgan bo'lsa, tekshirish
      if (deliverData.password && deliverData.password !== deliverData.return_password) {
        throw new Error('Parollar mos kelmadi');
      }

      // Yangilash uchun tayyor ma'lumotlar
      const updateData = {
        name: deliverData.name,
        phone: deliverData.phone
      };

      // Agar parol berilgan bo'lsa, qo'shamiz
      if (deliverData.password) {
        updateData.password = deliverData.password;
        updateData.return_password = deliverData.return_password;
      }

      const response = await fetch(`http://localhost:2277/deliver/${deliverId}`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        showSnackbar('Deliver maʼlumotlari muvaffaqiyatli yangilandi', 'success');
        fetchDelivers();
        resetForm();
        setDialogOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Deliver maʼlumotlarini yangilab boʻlmadi:', error);
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  /**
   * Deliver ni o'chirish
   */
  const deleteDeliver = async (deliverId) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      
      const response = await fetch(`http://localhost:2277/deliver/${deliverId}`, {
        method: 'DELETE',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        showSnackbar('Deliver muvaffaqiyatli oʻchirildi', 'success');
        fetchDelivers();
        setDeleteDialogOpen(false);
        setEditingDeliver(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Deliverni oʻchirib boʻlmadi:', error);
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

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      password: '',
      return_password: ''
    });
    setEditingDeliver(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Majburiy maydonlarni tekshirish
    if (!formData.name || !formData.phone || !formData.password) {
      showSnackbar('Iltimos, barcha majburiy maydonlarni toʻldiring', 'warning');
      return;
    }

    // Parollarni tekshirish
    if (formData.password !== formData.return_password) {
      showSnackbar('Parollar mos kelmadi', 'warning');
      return;
    }

    if (editingDeliver) {
      updateDeliver(editingDeliver._id, formData);
    } else {
      createDeliver(formData);
    }
  };

  const handleEdit = (deliver) => {
    setEditingDeliver(deliver);
    setFormData({
      name: deliver.name,
      phone: deliver.phone,
      password: '', // Parolni ko'rsatmaymiz
      return_password: ''
    });
    setDialogOpen(true);
  };

  const handleDelete = (deliver) => {
    setEditingDeliver(deliver);
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
      setFilteredDelivers(delivers);
    } else {
      const filtered = delivers.filter(deliver =>
        deliver.name.toLowerCase().includes(term) ||
        deliver.phone.includes(term) ||
        (deliver.role && deliver.role.toLowerCase().includes(term))
      );
      setFilteredDelivers(filtered);
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
    if (!dateString) return 'Noma\'lum';
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // ==================== USE EFFECT HOOKS ====================

  useEffect(() => {
    fetchDelivers();
  }, []);

  // ==================== RENDER ====================

  return (
    <div className={styles.deliversPage}>
      {/* SARLAVHA VA AKTsiYALAR */}
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <div className={styles.title}>
            <FaUser className={styles.titleIcon} />
            <h1>Deliverlar Boshqaruvi</h1>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="outlined"
              startIcon={<FaSync />}
              onClick={fetchDelivers}
              className={styles.refreshButton}
              disabled={loading.delivers}
            >
              {loading.delivers ? 'Yuklanmoqda...' : 'Yangilash'}
            </Button>
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={handleAddNew}
              className={styles.addButton}
            >
              Yangi Deliver
            </Button>
          </div>
        </div>

        {/* QIDIRUV */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Deliver ismi, telefon yoki roli boʻyicha qidirish..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.deliverCount}>
            Jami: {filteredDelivers.length} ta deliver
          </div>
        </div>
      </div>

      {/* DELIVERLAR JADVALI */}
      <div className={styles.tableSection}>
        {loading.delivers ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Deliverlar yuklanmoqda...</span>
          </div>
        ) : filteredDelivers.length > 0 ? (
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table className={styles.table}>
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell className={styles.tableHeaderCell}>Deliver Ismi</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Telefon</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Rol</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Qoʻshilgan Sana</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Harakatlar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDelivers.map((deliver) => (
                  <TableRow key={deliver._id} className={styles.tableRow}>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.deliverNameCell}>
                        <FaUser className={styles.deliverIcon} />
                        <span className={styles.deliverName}>{deliver.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.phoneText}>{deliver.phone}</span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.roleBadge}>
                        {deliver.role || 'deliver'}
                      </span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.dateText}>
                        {formatDate(deliver.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <IconButton
                          onClick={() => handleEdit(deliver)}
                          className={styles.editButton}
                          title="Tahrirlash"
                          size="small"
                        >
                          <FaEdit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(deliver)}
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
            <FaUser className={styles.noDataIcon} />
            <div className={styles.noDataText}>
              {searchTerm ? 'Qidiruv boʻyicha deliverlar topilmadi' : 'Hech qanday deliver topilmadi'}
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

      {/* DELIVER QO'SHISH/TAHRIRLASH MODALI */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          <FaUser className={styles.dialogIcon} />
          {editingDeliver ? 'Deliverni Tahrirlash' : 'Yangi Deliver Qoʻshish'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent className={styles.dialogContent}>
            <div className={styles.formGrid}>
              <TextField
                fullWidth
                label="Deliver Ismi"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={styles.formField}
                placeholder="Masalan: Ali Valiyev"
              />

              <TextField
                fullWidth
                label="Telefon Raqami"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={styles.formField}
                placeholder="Masalan: 901234567"
                inputProps={{ 
                  maxLength: 9,
                  pattern: "[0-9]*"
                }}
              />

              <TextField
                fullWidth
                label={editingDeliver ? "Yangi Parol (ixtiyoriy)" : "Parol"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingDeliver}
                className={styles.formField}
                placeholder={editingDeliver ? "Faqat o'zgartirmoqchi bo'lsangiz" : "Deliver uchun parol"}
                helperText={editingDeliver ? "Agar parolni o'zgartirmasangiz, bo'sh qoldiring" : ""}
              />

              <TextField
                fullWidth
                label="Parolni Takrorlang"
                name="return_password"
                type="password"
                value={formData.return_password}
                onChange={handleInputChange}
                required={!editingDeliver}
                className={styles.formField}
                placeholder="Parolni qayta kiriting"
              />
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
                  {editingDeliver ? 'Saqlanmoqda...' : 'Qoʻshilmoqda...'}
                </>
              ) : (
                editingDeliver ? 'Saqlash' : 'Qoʻshish'
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
          Deliverni Oʻchirish
        </DialogTitle>
        
        <DialogContent className={styles.deleteDialogContent}>
          <div className={styles.deleteWarning}>
            Quyidagi deliverni oʻchirishni tasdiqlaysizmi?
          </div>
          
          {editingDeliver && (
            <div className={styles.deliverToDelete}>
              <div className={styles.deleteDeliverName}>{editingDeliver.name}</div>
              <div className={styles.deleteDeliverPhone}>{editingDeliver.phone}</div>
              <div className={styles.deleteDeliverRole}>
                Rol: {editingDeliver.role || 'deliver'}
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
            onClick={() => deleteDeliver(editingDeliver?._id)}
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

export default Deliver;