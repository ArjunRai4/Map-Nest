const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const connectDB = require('./config/db.connection');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
