const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const callsRouter = require('./routes/calls');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL Database
const sequelize = new Sequelize('voip_system', 'user', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => console.log('Connected to MySQL Database'))
  .catch(err => console.error('Unable to connect to the database:', err));

app.use('/api/calls', callsRouter);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
