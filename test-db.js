const { Client } = require('pg');
const client = new Client('postgresql://zenith_bot:zenith6Z%40@localhost:5433/zenith_data');
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL successfully!');
    client.end();
  })
  .catch(err => {
    console.error('Connection failed:', err);
    process.exit(1);
  });
