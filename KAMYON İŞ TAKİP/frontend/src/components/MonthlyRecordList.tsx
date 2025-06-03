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
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import SearchBar from './SearchBar';

interface MonthlyRecord {
  _id: string;
  kamyon_plaka: string;
  ay: string;
  mazot_litre: number;
  mazot_maliyet: number;
  sefer_sayisi: number;
  lastik_tamir_sayisi: number;
  lastik_tamir_maliyet: number;
}

interface Truck {
  _id: string;
  plaka: string;
  isActive: boolean;
}

const MonthlyRecordList: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    fetchRecords();
    fetchTrucks();
  }, [selectedTruck, selectedMonth]);

  const fetchRecords = async () => {
    try {
      let url = 'http://localhost:5000/api/monthly-records';
      
      // Ay ve kamyon seçili ise o ayın kayıtlarını getir ve frontend'de filtrele
      if (selectedMonth) {
        url = `http://localhost:5000/api/monthly-records/by-month/${selectedMonth}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Kayıtlar getirilemedi');
      }
      
      const data = await response.json();
      let records = Array.isArray(data) ? data : data ? [data] : [];

      // Eğer kamyon seçili ise, kayıtları kamyona göre filtrele
      if (selectedTruck) {
        records = records.filter(record => record?.kamyon_plaka === selectedTruck);
      }

      setRecords(records);
    } catch (error) {
      console.error('Kayıtlar yüklenirken hata:', error);
      setRecords([]);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trucks');
      if (!response.ok) {
        throw new Error('Kamyonlar getirilemedi');
      }
      const data = await response.json();
      setTrucks(data.filter((t: Truck) => t.isActive));
    } catch (error) {
      console.error('Kamyonlar yüklenirken hata:', error);
      setTrucks([]);
    }
  };

  const handleEdit = (plaka: string, ay: string) => {
    navigate(`/monthly-record/edit/${plaka}/${ay}`);
  };

  const handleDelete = async (plaka: string, ay: string) => {
    if (window.confirm(`${plaka} plakalı kamyonun ${ay} ayına ait kaydını silmek istediğinize emin misiniz?`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/monthly-records/${plaka}/${ay}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Kayıt silinemedi');
        }
        fetchRecords();
      } catch (error) {
        console.error('Silme işlemi sırasında hata:', error);
      }
    }
  };

  const filteredRecords = records.filter(record => {
    if (!record?.kamyon_plaka) return false;
    return record.kamyon_plaka.toLowerCase().includes((searchTerm || '').toLowerCase());
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Aylık Kayıtlar
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate('/monthly-record/new')}
        >
          Yeni Kayıt Ekle
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <SearchBar
            placeholder="Plakaya göre ara..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </Grid>
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6}>
          <TextField
            type="month"
            fullWidth
            label="Ay Filtrele"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plaka</TableCell>
              <TableCell>Ay</TableCell>
              <TableCell align="right">Mazot (Lt)</TableCell>
              <TableCell align="right">Mazot Maliyet (TL)</TableCell>
              <TableCell align="right">Sefer Sayısı</TableCell>
              <TableCell align="right">Lastik Tamir</TableCell>
              <TableCell align="right">Lastik Maliyet (TL)</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{record.kamyon_plaka}</TableCell>
                <TableCell>{format(new Date(record.ay + '-01'), 'MMMM yyyy', { locale: tr })}</TableCell>
                <TableCell align="right">{record.mazot_litre?.toLocaleString('tr-TR') || '0'}</TableCell>
                <TableCell align="right">{record.mazot_maliyet?.toLocaleString('tr-TR') || '0'}</TableCell>
                <TableCell align="right">{record.sefer_sayisi || '0'}</TableCell>
                <TableCell align="right">{record.lastik_tamir_sayisi || '0'}</TableCell>
                <TableCell align="right">{record.lastik_tamir_maliyet?.toLocaleString('tr-TR') || '0'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(record.kamyon_plaka, record.ay)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(record.kamyon_plaka, record.ay)}>
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

export default MonthlyRecordList; 