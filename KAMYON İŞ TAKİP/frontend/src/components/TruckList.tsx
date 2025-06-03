import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Button,
  Switch,
  FormControlLabel,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Edit, Delete, Restore, Add, DeleteForever, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

interface Truck {
  _id: string;
  plaka: string;
  isActive: boolean;
}

interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmAction: () => Promise<void>;
  type: 'delete' | 'permanentDelete';
}

const TruckList: React.FC = () => {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    confirmAction: async () => {},
    type: 'delete'
  });

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const showAlert = (message: string, severity: AlertState['severity']) => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const showConfirmDialog = (
    title: string,
    message: string,
    confirmAction: () => Promise<void>,
    type: 'delete' | 'permanentDelete'
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmAction,
      type
    });
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trucks');
      const data = await response.json();
      setTrucks(data);
    } catch (error) {
      showAlert('Kamyonlar yüklenirken bir hata oluştu', 'error');
      console.error('Kamyonlar yüklenirken hata:', error);
    }
  };

  const handleEdit = (plaka: string) => {
    navigate(`/truck/edit/${plaka}`);
  };

  const handleDelete = async (plaka: string) => {
    const deleteAction = async () => {
      try {
        // Kamyonu soft delete yap
        const truckResponse = await fetch(`http://localhost:5000/api/trucks/${plaka}`, {
          method: 'DELETE',
        });

        if (truckResponse.ok) {
          // İşlemleri soft delete yap
          await fetch(`http://localhost:5000/api/operations/by-truck/${plaka}`, {
            method: 'DELETE',
          });

          // Aylık kayıtları soft delete yap
          await fetch(`http://localhost:5000/api/monthly-records/by-truck/${plaka}`, {
            method: 'DELETE',
          });

          showAlert(`${plaka} plakalı kamyon başarıyla silindi`, 'success');
          fetchTrucks();
        }
      } catch (error) {
        showAlert('Silme işlemi sırasında bir hata oluştu', 'error');
        console.error('Silme işlemi sırasında hata:', error);
      }
      handleCloseConfirmDialog();
    };

    showConfirmDialog(
      'Kamyonu Sil',
      `${plaka} plakalı kamyonu ve ilgili tüm kayıtları silmek istediğinize emin misiniz?`,
      deleteAction,
      'delete'
    );
  };

  const handleRestore = async (plaka: string) => {
    try {
      // Kamyonu geri yükle
      const response = await fetch(`http://localhost:5000/api/trucks/${plaka}/restore`, {
        method: 'PUT',
      });

      if (response.ok) {
        // İşlemleri geri yükle
        await fetch(`http://localhost:5000/api/operations/by-truck/${plaka}/restore`, {
          method: 'PUT',
        });

        // Aylık kayıtları geri yükle
        await fetch(`http://localhost:5000/api/monthly-records/by-truck/${plaka}/restore`, {
          method: 'PUT',
        });

        showAlert(`${plaka} plakalı kamyon başarıyla geri yüklendi`, 'success');
        fetchTrucks();
      }
    } catch (error) {
      showAlert('Geri yükleme işlemi sırasında bir hata oluştu', 'error');
      console.error('Geri yükleme işlemi sırasında hata:', error);
    }
  };

  const handlePermanentDelete = async (plaka: string) => {
    const permanentDeleteAction = async () => {
      try {
        // İşlemleri kalıcı olarak sil
        await fetch(`http://localhost:5000/api/operations/by-truck/${plaka}/permanent`, {
          method: 'DELETE',
        });

        // Aylık kayıtları kalıcı olarak sil
        await fetch(`http://localhost:5000/api/monthly-records/by-truck/${plaka}/permanent`, {
          method: 'DELETE',
        });

        // Kamyonu kalıcı olarak sil
        const response = await fetch(`http://localhost:5000/api/trucks/${plaka}/permanent`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showAlert(`${plaka} plakalı kamyon kalıcı olarak silindi`, 'success');
          fetchTrucks();
        }
      } catch (error) {
        showAlert('Kalıcı silme işlemi sırasında bir hata oluştu', 'error');
        console.error('Kalıcı silme işlemi sırasında hata:', error);
      }
      handleCloseConfirmDialog();
    };

    showConfirmDialog(
      'Kalıcı Olarak Sil',
      `${plaka} plakalı kamyonu ve ilgili tüm kayıtları kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`,
      permanentDeleteAction,
      'permanentDelete'
    );
  };

  const filteredTrucks = trucks.filter(truck =>
    truck.plaka.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (showDeleted ? !truck.isActive : truck.isActive)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color={confirmDialog.type === 'permanentDelete' ? 'error' : 'warning'} />
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            İptal
          </Button>
          <Button
            onClick={() => confirmDialog.confirmAction()}
            color={confirmDialog.type === 'permanentDelete' ? 'error' : 'warning'}
            variant="contained"
            autoFocus
          >
            {confirmDialog.type === 'permanentDelete' ? 'Kalıcı Olarak Sil' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Kamyon Listesi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate('/truck/new')}
        >
          Yeni Kamyon Ekle
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SearchBar
          placeholder="Plakaya göre ara..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
          }
          label="Silinen Kamyonları Göster"
          sx={{ ml: 2 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plaka</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrucks.map((truck) => (
              <TableRow key={truck._id}>
                <TableCell>{truck.plaka}</TableCell>
                <TableCell>
                  {truck.isActive ? 'Aktif' : 'Silinmiş'}
                </TableCell>
                <TableCell align="right">
                  {truck.isActive ? (
                    <>
                      <IconButton onClick={() => handleEdit(truck.plaka)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(truck.plaka)}>
                        <Delete />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Geri Yükle">
                        <IconButton 
                          onClick={() => handleRestore(truck.plaka)}
                          color="primary"
                        >
                          <Restore />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Kalıcı Olarak Sil">
                        <IconButton 
                          onClick={() => handlePermanentDelete(truck.plaka)}
                          color="error"
                        >
                          <DeleteForever />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TruckList; 