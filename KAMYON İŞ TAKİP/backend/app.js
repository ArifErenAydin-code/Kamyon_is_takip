const operationsRouter = require('./routes/operations');
const monthlyRecordsRouter = require('./routes/monthlyRecords');
 
app.use('/api/operations', operationsRouter);
app.use('/api/monthly-records', monthlyRecordsRouter); 