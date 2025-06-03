import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  MenuItem,
  Select,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

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

interface OperationFormData {
  islem_id?: string;
  dukkan_id: string;
  kamyon_plaka: string;
  maliyet: number | null;
  yapilan_is: string;
  tarih: string;
}

const OperationForm: React.FC = () => {
  const navigate = useNavigate();
  const { islem_id } = useParams();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  
  const [formData, setFormData] = useState<OperationFormData>({
    dukkan_id: '',
    kamyon_plaka: '',
    maliyet: islem_id ? 0 : null as any,
    yapilan_is: '',
    tarih: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchWorkshops();
    fetchTrucks();
    if (islem_id) {
      fetchOperation();
    }
  }, [islem_id]);

  const fetchWorkshops = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/workshops');
      const data = await response.json();
      setWorkshops(data.filter((workshop: Workshop) => workshop.isActive));
    } catch (error) {
      console.error('Dükkânlar yüklenirken hata:', error);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trucks');
      const data = await response.json();
      setTrucks(data.filter((truck: Truck) => truck.isActive));
    } catch (error) {
      console.error('Kamyonlar yüklenirken hata:', error);
    }
  };

  const fetchOperation = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/operations/${islem_id}`);
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('İşlem bilgileri yüklenirken hata:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = islem_id
        ? `http://localhost:5000/api/operations/${islem_id}`
        : 'http://localhost:5000/api/operations';
      const method = islem_id ? 'PUT' : 'POST';

      // Null değerleri 0'a çevir
      const submitData = {
        ...formData,
        maliyet: formData.maliyet ?? 0
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        navigate('/operations');
      }
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
    }
  };

  const handleChange = (field: keyof OperationFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {islem_id ? 'İşlem Düzenle' : 'Yeni İşlem Ekle'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dükkân</InputLabel>
                <Select
                  value={formData.dukkan_id}
                  onChange={(e) => handleChange('dukkan_id', e.target.value)}
                  label="Dükkân"
                >
                  {workshops.map((workshop) => (
                    <MenuItem key={workshop._id} value={workshop._id}>
                      {workshop.dukkan_adi}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kamyon</InputLabel>
                <Select
                  value={formData.kamyon_plaka}
                  onChange={(e) => handleChange('kamyon_plaka', e.target.value)}
                  label="Kamyon"
                >
                  {trucks.map((truck) => (
                    <MenuItem key={truck._id} value={truck.plaka}>
                      {truck.plaka}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Maliyet</InputLabel>
                <OutlinedInput
                  type="text"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    min: 0,
                    style: { textAlign: 'right' }
                  }}
                  value={formData.maliyet || ''}
                  onChange={(e) => handleChange('maliyet', e.target.value === '' ? null : Number(e.target.value))}
                  endAdornment={<InputAdornment position="end">TL</InputAdornment>}
                  label="Maliyet"
                  placeholder="0"
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Tarih"
                value={formData.tarih}
                onChange={(e) => handleChange('tarih', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Yapılan İş"
                value={formData.yapilan_is}
                onChange={(e) => handleChange('yapilan_is', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/operations')}>
                  İptal
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {islem_id ? 'Güncelle' : 'Kaydet'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default OperationForm; 