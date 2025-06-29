const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const connectDB = require('./config/db.connection');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const userRoutes=require('./routes/user.route');
// const safetyReportRoutes = require('../archive/routes/safetyReport.route');
const mapRoutes = require('./routes/map.routes');

const app = express();
const PORT = process.env.PORT || 4000;

//middlewares
app.use(cors({
    origin:true,
    credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/user',userRoutes);
// app.use('/api/report', safetyReportRoutes);
app.use('/api/map', mapRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to MapNest API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
