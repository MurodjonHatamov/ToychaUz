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
  FaStore, 
  FaSpinner,
  FaSearch
} from 'react-icons/fa';
import styles from './MarketsD.module.css';

function MarketsD() {
  // ==================== STATE DEFINITIONS ====================
  
  const [markets, setMarkets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    password: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [loading, setLoading] = useState({
    markets: true,
    submit: false,
    delete: false
  });

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
        setFilteredMarkets(marketsData);
        console.log(marketsData);
        
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

  const createMarket = async (marketData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const response = await fetch('http://localhost:2277/markets', {
        method: 'POST',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(marketData)
      });
      
      if (response.ok) {
        showSnackbar('Market muvaffaqiyatli qoʻshildi', 'success');
        fetchMarkets();
        resetForm();
        setDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Market qoʻshib boʻlmadi:', error);
      showSnackbar('Market qoʻshib boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const updateMarket = async (marketId, marketData) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const response = await fetch(`http://localhost:2277/markets/${marketId}`, {
        method: 'PATCH',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(marketData)
      });
      
      if (response.ok) {
        showSnackbar('Market maʼlumotlari muvaffaqiyatli yangilandi', 'success');
        fetchMarkets();
        resetForm();
        setDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Market maʼlumotlarini yangilab boʻlmadi:', error);
      showSnackbar('Market maʼlumotlarini yangilab boʻlmadi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const deleteMarket = async (marketId) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      
      const response = await fetch(`http://localhost:2277/markets/${marketId}`, {
        method: 'DELETE',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        showSnackbar('Market muvaffaqiyatli oʻchirildi', 'success');
        fetchMarkets();
        setDeleteDialogOpen(false);
        setEditingMarket(null);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error('Marketni oʻchirib boʻlmadi:', error);
      showSnackbar('Marketni oʻchirib boʻlmadi', 'error');
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
      address: '',
      password: ''
    });
    setEditingMarket(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.password) {
      showSnackbar('Iltimos, barcha majburiy maydonlarni toʻldiring', 'warning');
      return;
    }

    if (editingMarket) {
      updateMarket(editingMarket._id, formData);
    } else {
      createMarket(formData);
    }
  };

  const handleEdit = (market) => {
    setEditingMarket(market);
    setFormData({
      name: market.name,
      phone: market.phone,
      address: market.address || '',
      password: market.password
    });
    setDialogOpen(true);
  };

  const handleDelete = (market) => {
    setEditingMarket(market);
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
      setFilteredMarkets(markets);
    } else {
      const filtered = markets.filter(market =>
        market.name.toLowerCase().includes(term) ||
        market.phone.includes(term) ||
        (market.address && market.address.toLowerCase().includes(term))
      );
      setFilteredMarkets(filtered);
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

  // ==================== USE EFFECT HOOKS ====================

  useEffect(() => {
    fetchMarkets();
  }, []);

  // ==================== RENDER ====================

  return (
    <div className={styles.marketsPage}>
      {/* SARLAVHA VA AKTsiYALAR */}
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <div className={styles.title}>
            <FaStore className={styles.titleIcon} />
            <h1>Marketlar Boshqaruvi</h1>
          </div>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={handleAddNew}
            className={styles.addButton}
          >
            Yangi Market
          </Button>
        </div>

        {/* QIDIRUV */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Market nomi, telefon yoki manzil boʻyicha qidirish..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.marketCount}>
            Jami: {filteredMarkets.length} ta market
          </div>
        </div>
      </div>

      {/* MARKETLAR JADVALI */}
      <div className={styles.tableSection}>
        {loading.markets ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Marketlar yuklanmoqda...</span>
          </div>
        ) : filteredMarkets.length > 0 ? (
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table className={styles.table}>
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell className={styles.tableHeaderCell}>Market Nomi</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Telefon</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Manzil</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Qoʻshilgan Sana</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Harakatlar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMarkets.map((market) => (
                  <TableRow key={market._id} className={styles.tableRow}>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.marketNameCell}>
                        <FaStore className={styles.marketIcon} />
                        <span className={styles.marketName}>{market.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.phoneText}>{market.phone}</span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.addressText}>
                        {market.address || 'Manzil kiritilmagan'}
                      </span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.dateText}>
                        {formatDate(market.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <IconButton
                          onClick={() => handleEdit(market)}
                          className={styles.editButton}
                          title="Tahrirlash"
                          size="small"
                        >
                          <FaEdit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(market)}
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
            <FaStore className={styles.noDataIcon} />
            <div className={styles.noDataText}>
              {searchTerm ? 'Qidiruv boʻyicha marketlar topilmadi' : 'Hech qanday market topilmadi'}
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

      {/* MARKET QO'SHISH/TAHRIRLASH MODALI */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          <FaStore className={styles.dialogIcon} />
          {editingMarket ? 'Marketni Tahrirlash' : 'Yangi Market Qoʻshish'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent className={styles.dialogContent}>
            <div className={styles.formGrid}>
              <TextField
                fullWidth
                label="Market Nomi"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={styles.formField}
                placeholder="Masalan: Korzinka-7"
              />

              <TextField
                fullWidth
                label="Telefon Raqami"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={styles.formField}
                placeholder="Masalan: 999999999"
                inputProps={{ maxLength: 9 }}
              />

              <TextField
                fullWidth
                label="Manzil"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={styles.formField}
                placeholder="Masalan: A.Navoiy koʻchasi 34-A uy"
                multiline
                rows={2}
              />

              <TextField
                fullWidth
                label="Parol"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={styles.formField}
                placeholder="Market uchun parol"
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
                  {editingMarket ? 'Saqlanmoqda...' : 'Qoʻshilmoqda...'}
                </>
              ) : (
                editingMarket ? 'Saqlash' : 'Qoʻshish'
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
          Marketni Oʻchirish
        </DialogTitle>
        
        <DialogContent className={styles.deleteDialogContent}>
          <div className={styles.deleteWarning}>
            Quyidagi marketni oʻchirishni tasdiqlaysizmi?
          </div>
          
          {editingMarket && (
            <div className={styles.marketToDelete}>
              <div className={styles.deleteMarketName}>{editingMarket.name}</div>
              <div className={styles.deleteMarketPhone}>{editingMarket.phone}</div>
              {editingMarket.address && (
                <div className={styles.deleteMarketAddress}>{editingMarket.address}</div>
              )}
            </div>
          )}

          <div className={styles.deleteNote}>
            ⚠️ Marketni o‘chirsangiz, unga tegishli barcha buyurtmalar ham birgalikda o‘chirilib ketadi.
            Bu amalni ortga qaytarib bo‘lmaydi.
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
            onClick={() => deleteMarket(editingMarket?._id)}
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

export default MarketsD;