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

interface Workshop {
  _id: string;
  dukkan_adi: string;
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

const WorkshopList: React.FC = () => {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
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
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/workshops');
      const data = await response.json();
      setWorkshops(data);
    } catch (error) {
      showAlert('Dükkanlar yüklenirken bir hata oluştu', 'error');
      console.error('Dükkanlar yüklenirken hata:', error);
    }
  };

  const handleDelete = async (id: string, isim: string) => {
    const deleteAction = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/workshops/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showAlert(`${isim} isimli dükkan başarıyla silindi`, 'success');
          fetchWorkshops();
        }
      } catch (error) {
        showAlert('Silme işlemi sırasında bir hata oluştu', 'error');
        console.error('Silme işlemi sırasında hata:', error);
      }
      handleCloseConfirmDialog();
    };

    showConfirmDialog(
      'Dükkanı Sil',
      `${isim} isimli dükkanı silmek istediğinize emin misiniz?`,
      deleteAction,
      'delete'
    );
  };

  const handleRestore = async (id: string, isim: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/workshops/${id}/restore`, {
        method: 'PUT',
      });

      if (response.ok) {
        showAlert(`${isim} isimli dükkan başarıyla geri yüklendi`, 'success');
        fetchWorkshops();
      }
    } catch (error) {
      showAlert('Geri yükleme işlemi sırasında bir hata oluştu', 'error');
      console.error('Geri yükleme işlemi sırasında hata:', error);
    }
  };

  const handlePermanentDelete = async (id: string, isim: string) => {
    const permanentDeleteAction = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/workshops/${id}/permanent`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showAlert(`${isim} isimli dükkan kalıcı olarak silindi`, 'success');
          fetchWorkshops();
        }
      } catch (error) {
        showAlert('Kalıcı silme işlemi sırasında bir hata oluştu', 'error');
        console.error('Kalıcı silme işlemi sırasında hata:', error);
      }
      handleCloseConfirmDialog();
    };

    showConfirmDialog(
      'Kalıcı Olarak Sil',
      `${isim} isimli dükkanı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`,
      permanentDeleteAction,
      'permanentDelete'
    );
  };

  const filteredWorkshops = workshops.filter(workshop =>
    workshop.dukkan_adi.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (showDeleted ? !workshop.isActive : workshop.isActive)
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
          Dükkan Listesi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            const dukkan_adi = prompt('Dükkan adını giriniz:');
            if (dukkan_adi) {
              fetch('http://localhost:5000/api/workshops', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dukkan_adi }),
              })
                .then(response => {
                  if (response.ok) {
                    showAlert('Dükkan başarıyla eklendi', 'success');
                    fetchWorkshops();
                  }
                })
                .catch(error => {
                  showAlert('Dükkan eklenirken bir hata oluştu', 'error');
                  console.error('Dükkan ekleme hatası:', error);
                });
            }
          }}
        >
          Yeni Dükkan Ekle
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SearchBar
          placeholder="Dükkan adına göre ara..."
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
          label="Silinen Dükkanları Göster"
          sx={{ ml: 2 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dükkan Adı</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkshops.map((workshop) => (
              <TableRow key={workshop._id}>
                <TableCell>{workshop.dukkan_adi}</TableCell>
                <TableCell>
                  {workshop.isActive ? 'Aktif' : 'Silinmiş'}
                </TableCell>
                <TableCell align="right">
                  {workshop.isActive ? (
                    <>
                      <IconButton onClick={() => {
                        const yeniDukkanAdi = prompt('Yeni dükkan adını giriniz:', workshop.dukkan_adi);
                        if (yeniDukkanAdi) {
                          fetch(`http://localhost:5000/api/workshops/${workshop._id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ dukkan_adi: yeniDukkanAdi }),
                          })
                            .then(response => {
                              if (response.ok) {
                                showAlert('Dükkan adı başarıyla güncellendi', 'success');
                                fetchWorkshops();
                              }
                            })
                            .catch(error => {
                              showAlert('Dükkan adı güncellenirken bir hata oluştu', 'error');
                              console.error('Güncelleme hatası:', error);
                            });
                        }
                      }}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(workshop._id, workshop.dukkan_adi)}>
                        <Delete />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Geri Yükle">
                        <IconButton 
                          onClick={() => handleRestore(workshop._id, workshop.dukkan_adi)}
                          color="primary"
                        >
                          <Restore />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Kalıcı Olarak Sil">
                        <IconButton 
                          onClick={() => handlePermanentDelete(workshop._id, workshop.dukkan_adi)}
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

export default WorkshopList; 