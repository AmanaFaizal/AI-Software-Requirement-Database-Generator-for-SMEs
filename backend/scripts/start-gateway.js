require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
// Explicit launch mode takes precedence over an inherited direct-mode setting.
process.env.BIZGUIDE_AUTH_MODE = 'gateway';
require('../server');
