require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/db');
require('./src/models'); // register associations

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const authMode = process.env.BIZGUIDE_AUTH_MODE || 'direct';
    if (!['direct', 'gateway'].includes(authMode)) {
      throw new Error('BIZGUIDE_AUTH_MODE must be direct or gateway.');
    }
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database.');

    // Creates tables if they don't exist yet, matching the models.
    // Use { alter: true } while iterating on the schema in development.
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced with alter: true.');

    app.listen(PORT, () => {
      console.log(`Authentication mode: ${authMode}`);
      console.log(`🚀 BizGuide AI backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to start server:', err.message);
    process.exit(1);
  }
}

start();
