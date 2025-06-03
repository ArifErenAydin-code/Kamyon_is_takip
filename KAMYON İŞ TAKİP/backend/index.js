const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const trucksRouter = require('./routes/trucks');
const workshopsRouter = require('./routes/workshops');
const operationsRouter = require('./routes/operations');
const monthlyRecordsRouter = require('./routes/monthlyRecords');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://admin:admin@cluster0.wqau3dn.mongodb.net/truckDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB bağlantısı başarılı');
}).catch((err) => {
  console.error('MongoDB bağlantı hatası:', err);
});

// Route'ları kullan
app.use('/api/trucks', trucksRouter);
app.use('/api/workshops', workshopsRouter);
app.use('/api/operations', operationsRouter);
app.use('/api/monthly-records', monthlyRecordsRouter);

// Ana route
app.get('/', (req, res) => {
  res.json({ message: 'Kamyon İş Takip API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 