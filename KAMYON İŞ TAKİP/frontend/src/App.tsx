import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box
} from '@mui/material';
import TruckList from './components/TruckList';
import TruckForm from './components/TruckForm';
import WorkshopList from './components/WorkshopList';
import WorkshopForm from './components/WorkshopForm';
import OperationList from './components/OperationList';
import OperationForm from './components/OperationForm';
import MonthlyRecordForm from './components/MonthlyRecordForm';
import MonthlyRecordList from './components/MonthlyRecordList';
import Reports from './components/Reports';

const App: React.FC = () => {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Kamyon İş Takip
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Kamyonlar
          </Button>
          <Button color="inherit" component={Link} to="/workshops">
            Dükkanlar
          </Button>
          <Button color="inherit" component={Link} to="/operations">
            İşlemler
          </Button>
          <Button color="inherit" component={Link} to="/monthly-records">
            Aylık Kayıtlar
          </Button>
          <Button color="inherit" component={Link} to="/reports">
            Raporlar
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<TruckList />} />
          <Route path="/truck/new" element={<TruckForm />} />
          <Route path="/truck/edit/:plaka" element={<TruckForm />} />
          
          <Route path="/workshops" element={<WorkshopList />} />
          <Route path="/workshop/new" element={<WorkshopForm />} />
          <Route path="/workshop/edit/:id" element={<WorkshopForm />} />
          
          <Route path="/operations" element={<OperationList />} />
          <Route path="/operation/new" element={<OperationForm />} />
          <Route path="/operation/edit/:id" element={<OperationForm />} />

          <Route path="/monthly-records" element={<MonthlyRecordList />} />
          <Route path="/monthly-record/new" element={<MonthlyRecordForm />} />
          <Route path="/monthly-record/edit/:plaka/:ay" element={<MonthlyRecordForm />} />

          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
