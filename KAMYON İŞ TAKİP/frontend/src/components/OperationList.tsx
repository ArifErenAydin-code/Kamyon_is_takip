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
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

interface Operation {
  _id: string;
  dukkan_id: {
    _id: string;
    dukkan_adi: string;
  };
  kamyon_plaka: string;
  maliyet: number;
  yapilan_is: string;
  tarih: string;
}

interface Workshop {
  _id: string;
  dukkan_adi: string;
  isActive: boolean;
}

interface Truck {
  _id: string;
  plaka: string;
  isActive: boolean;
}

const OperationList: React.FC = () => {
  const navigate = useNavigate();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchOperations();
    fetchWorkshops();
    fetchTrucks();
  }, []);

  const fetchOperations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/operations');
      const data = await response.json();
      setOperations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('İşlemler yüklenirken hata:', error);
      setOperations([]);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/workshops');
      const data = await response.json();
      setWorkshops(Array.isArray(data) ? data.filter((w: Workshop) => w.isActive) : []);
    } catch (error) {
      console.error('Dükkanlar yüklenirken hata:', error);
      setWorkshops([]);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trucks');
      const data = await response.json();
      setTrucks(Array.isArray(data) ? data.filter((t: Truck) => t.isActive) : []);
    } catch (error) {
      console.error('Kamyonlar yüklenirken hata:', error);
      setTrucks([]);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/operation/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/operations/${id}`, {
        method: 'DELETE',
      });
      fetchOperations(); // Listeyi yenile
    } catch (error) {
      console.error('Silme işlemi sırasında hata:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
  };

  const filteredOperations = operations.filter(operation => {
    const matchesSearch = operation.yapilan_is.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkshop = !selectedWorkshop || operation.dukkan_id._id === selectedWorkshop;
    const matchesTruck = !selectedTruck || operation.kamyon_plaka === selectedTruck;
    const operationDate = new Date(operation.tarih);
    const matchesDateRange = (!dateRange.start || operationDate >= new Date(dateRange.start)) &&
                           (!dateRange.end || operationDate <= new Date(dateRange.end));

    return matchesSearch && matchesWorkshop && matchesTruck && matchesDateRange;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          İşlem Listesi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate('/operation/new')}
        >
          Yeni İşlem Ekle
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <SearchBar
            placeholder="Yapılan işe göre ara..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            label="Dükkan Filtrele"
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
          >
            <MenuItem value="">Tümü</MenuItem>
            {workshops.map((workshop) => (
              <MenuItem key={workshop._id} value={workshop._id}>
                {workshop.dukkan_adi}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            label="Kamyon Filtrele"
            value={selectedTruck}
            onChange={(e) => setSelectedTruck(e.target.value)}
          >
            <MenuItem value="">Tümü</MenuItem>
            {trucks.map((truck) => (
              <MenuItem key={truck._id} value={truck.plaka}>
                {truck.plaka}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            type="date"
            fullWidth
            label="Başlangıç Tarihi"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            type="date"
            fullWidth
            label="Bitiş Tarihi"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Dükkan</TableCell>
              <TableCell>Plaka</TableCell>
              <TableCell>Yapılan İş</TableCell>
              <TableCell>Maliyet</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOperations.map((operation) => (
              <TableRow key={operation._id}>
                <TableCell>{formatDate(operation.tarih)}</TableCell>
                <TableCell>{operation.dukkan_id.dukkan_adi}</TableCell>
                <TableCell>{operation.kamyon_plaka}</TableCell>
                <TableCell>{operation.yapilan_is}</TableCell>
                <TableCell>{operation.maliyet} TL</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(operation._id)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(operation._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OperationList; 