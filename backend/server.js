require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/db');
require('./src/models'); // register associations

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database.');

    // Creates tables if they don't exist yet, matching the models.
    // Use { alter: true } while iterating on the schema in development.
    await sequelize.sync();
    console.log('✅ Database synced.');

    app.listen(PORT, () => {
      console.log(`🚀 BizGuide AI backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to start server:', err.message);
    process.exit(1);
  }
}

start();
