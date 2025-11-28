// pages/deliver/Deliver.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Snackbar,
  CircularProgress,
  AppBar,
  Toolbar,
  Tabs,
  Tab
} from '@mui/material';
import { 
  FaSearch, 
  FaUserEdit,
  FaUserPlus,
  FaSync,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import styled from './Deliver.module.css';

function Deliver() {
  const [delivers, setDelivers] = useState([]);
  const [selectedDeliver, setSelectedDeliver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    return_password: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    password: '',
    return_password: ''
  });

  const API_BASE = 'http://localhost:2277';

  const fetchDelivers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/deliver/all-delivers`, {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDelivers(data);
      } else {
        throw new Error('Deliverlarni olishda xatolik');
      }
    } catch (err) {
      setError('Xatolik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDeliver = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.password !== formData.return_password) {
      setError('Parollar mos kelmadi');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/deliver`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess('Deliver muvaffaqiyatli qo\'shildi');
        setFormData({ name: '', phone: '', password: '', return_password: '' });
        setCreateDialogOpen(false);
        fetchDelivers();
      } else {
        throw new Error('Deliver qo\'shishda xatolik');
      }
    } catch (err) {
      setError('Xatolik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliver = async () => {
    setLoading(true);
    setError('');
    
    if (!selectedDeliver) return;
    
    if (editFormData.password !== editFormData.return_password) {
      setError('Parollar mos kelmadi');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/deliver/${selectedDeliver._id}`, {
        method: 'PATCH',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      
      if (response.ok) {
        setSuccess('Deliver muvaffaqiyatli yangilandi');
        setEditDialogOpen(false);
        fetchDelivers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Deliverni yangilashda xatolik');
      }
    } catch (err) {
      setError('Xatolik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliverById = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/deliver/${id}/deliver`, {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedDeliver(data);
        setEditFormData({
          name: data.name,
          phone: data.phone,
          password: '',
          return_password: ''
        });
        setEditDialogOpen(true);
      } else {
        throw new Error('Deliverni olishda xatolik');
      }
    } catch (err) {
      setError('Xatolik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (deliver) => {
    fetchDeliverById(deliver._id);
  };

  useEffect(() => {
    fetchDelivers();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredDelivers = delivers.filter(deliver =>
    deliver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deliver.phone.includes(searchTerm)
  );

  return (
    <Box className={styled.container}>
      <AppBar position="static" className={styled.appBar}>
        <Toolbar>
          <Typography variant="h6" className={styled.title}>
            Deliver Boshqaruvi
          </Typography>
          <Button
            color="inherit"
            startIcon={<FaSync className={styled.buttonIcon} />}
            onClick={fetchDelivers}
            className={styled.refreshButton}
          >
            Yangilash
          </Button>
        </Toolbar>
      </AppBar>

      <Paper className={styled.tabsPaper}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          className={styled.tabs}
        >
          <Tab label="Barcha Deliverlar" />
          <Tab label="Yangi Deliver" />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" className={styled.alert}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box className={styled.loading}>
          <CircularProgress />
          <Typography>Yuklanmoqda...</Typography>
        </Box>
      )}

      {/* Deliver List Tab */}
      {activeTab === 0 && (
        <Box className={styled.tabContent}>
          <Box className={styled.tableHeader}>
            <Box className={styled.searchContainer}>
              <FaSearch className={styled.searchIcon} />
              <TextField
                placeholder="Ism yoki telefon bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styled.searchField}
                InputProps={{
                  disableUnderline: true
                }}
                variant="standard"
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<FaUserPlus className={styled.buttonIcon} />}
              onClick={() => setCreateDialogOpen(true)}
              className={styled.addButton}
            >
              Yangi Deliver
            </Button>
          </Box>

          <TableContainer component={Paper} className={styled.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ism</TableCell>
                  <TableCell>Telefon</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Ro'l</TableCell>
                  <TableCell>Amallar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDelivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className={styled.noData}>
                      Hech qanday deliver topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDelivers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((deliver) => (
                      <TableRow key={deliver._id} className={styled.tableRow}>
                        <TableCell>
                          <Typography className={styled.nameText}>
                            {deliver.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{deliver.phone}</TableCell>
                        <TableCell className={styled.idCell}>
                          {deliver._id}
                        </TableCell>
                        <TableCell>
                          <Box className={styled.roleBadge}>
                            {deliver.role}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleEditClick(deliver)}
                            className={styled.editButton}
                            startIcon={<FaUserEdit className={styled.buttonIcon} />}
                          >
                            Tahrirlash
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDelivers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sahifadagi qatorlar:"
              className={styled.pagination}
            />
          </TableContainer>
        </Box>
      )}

      {/* Create Deliver Tab */}
      {activeTab === 1 && (
        <Box className={styled.tabContent}>
          <Card className={styled.formCard}>
            <CardContent>
              <Typography variant="h6" className={styled.formTitle}>
                <FaUserPlus className={styled.titleIcon} />
                Yangi Deliver Qo'shish
              </Typography>
              <form onSubmit={createDeliver} className={styled.form}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Ism"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      fullWidth
                      className={styled.textField}
                      placeholder="To'liq ism"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Telefon"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      fullWidth
                      className={styled.textField}
                      placeholder="901234567"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Parol"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      fullWidth
                      className={styled.textField}
                      placeholder="Kamida 4 ta belgi"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Parolni Takrorlang"
                      type="password"
                      value={formData.return_password}
                      onChange={(e) => setFormData({...formData, return_password: e.target.value})}
                      required
                      fullWidth
                      className={styled.textField}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  className={styled.submitButton}
                  disabled={loading}
                  fullWidth
                >
                  <FaCheck className={styled.buttonIcon} />
                  {loading ? 'Qo\'shilmoqda...' : 'Deliverni Qo\'shish'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Create Deliver Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        className={styled.dialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className={styled.dialogTitle}>
          <FaUserPlus className={styled.dialogTitleIcon} />
          Yangi Deliver Qo'shish
        </DialogTitle>
        <DialogContent>
          <form onSubmit={createDeliver} className={styled.dialogForm}>
            <TextField
              label="Ism"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              fullWidth
              margin="normal"
              className={styled.dialogField}
            />
            <TextField
              label="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
              fullWidth
              margin="normal"
              className={styled.dialogField}
            />
            <TextField
              label="Parol"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              fullWidth
              margin="normal"
              className={styled.dialogField}
            />
            <TextField
              label="Parolni Takrorlang"
              type="password"
              value={formData.return_password}
              onChange={(e) => setFormData({...formData, return_password: e.target.value})}
              required
              fullWidth
              margin="normal"
              className={styled.dialogField}
            />
          </form>
        </DialogContent>
        <DialogActions className={styled.dialogActions}>
          <Button 
            onClick={() => setCreateDialogOpen(false)}
            className={styled.cancelButton}
            startIcon={<FaTimes className={styled.buttonIcon} />}
          >
            Bekor Qilish
          </Button>
          <Button
            onClick={createDeliver}
            variant="contained"
            disabled={loading}
            className={styled.confirmButton}
            startIcon={<FaCheck className={styled.buttonIcon} />}
          >
            {loading ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Deliver Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        className={styled.dialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className={styled.dialogTitle}>
          <FaUserEdit className={styled.dialogTitleIcon} />
          Deliverni Tahrirlash
        </DialogTitle>
        <DialogContent>
          <form className={styled.dialogForm}>
            <TextField
              label="Ism"
              value={editFormData.name}
              onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              required
              fullWidth
              margin="normal"
              className={styled.dialogField}
            />
            <TextField
              label="Telefon"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
              required
              fullWidth
              margin="normal"
              className={styled.dialogField}
            />
            <TextField
              label="Yangi Parol"
              type="password"
              value={editFormData.password}
              onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
              fullWidth
              margin="normal"
              className={styled.dialogField}
              placeholder="Agar o'zgartirmoqchi bo'lsangiz"
              helperText="Agar parolni o'zgartirmasangiz, bo'sh qoldiring"
            />
            <TextField
              label="Yangi Parolni Takrorlang"
              type="password"
              value={editFormData.return_password}
              onChange={(e) => setEditFormData({...editFormData, return_password: e.target.value})}
              fullWidth
              margin="normal"
              className={styled.dialogField}
            />
          </form>
        </DialogContent>
        <DialogActions className={styled.dialogActions}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            className={styled.cancelButton}
            startIcon={<FaTimes className={styled.buttonIcon} />}
          >
            Bekor Qilish
          </Button>
          <Button
            onClick={updateDeliver}
            variant="contained"
            disabled={loading}
            className={styled.confirmButton}
            startIcon={<FaCheck className={styled.buttonIcon} />}
          >
            {loading ? 'Yangilanmoqda...' : 'Yangilash'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Deliver;