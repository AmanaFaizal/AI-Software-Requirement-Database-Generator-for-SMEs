// Live smoke checks: creates isolated test accounts and business records.
// Reports contain only method/path/status/check results, never credentials or bodies.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');
const crypto = require('node:crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const direct = process.argv.includes('--direct');
const base = new URL(direct ? 'http://localhost:5000' :
  (process.env.WSO2_GATEWAY_URL || 'https://localhost:8243/bizguide/1.0.0'));
const credential = process.env.WSO2_ACCESS_TOKEN;
const internalKey = process.env.WSO2_INTERNAL_KEY;
const report = { checkedAt: new Date().toISOString(), mode: direct ? 'direct-backend' : 'wso2-gateway',
  baseUrl: base.origin + base.pathname, gatewayAuthentication: direct ? null :
    (credential ? 'OAuth access token' : 'Publisher Internal-Key'), checks: [] };
const spec = require('../openapi/wso2-inventory.json');
const covered = new Set();
let userToken;
const suffix = crypto.randomUUID();
const password = crypto.randomBytes(24).toString('hex');
const account = { name: 'Integration Test', email: `integration-${suffix}@example.test`, password };

async function request(method, resource, body, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (!direct && !opts.noGateway) {
    if (credential) headers.Authorization = `Bearer ${credential}`;
    else if (internalKey) headers['Internal-Key'] = internalKey;
  }
  const token = opts.token === undefined ? userToken : opts.token;
  if (token) headers[direct ? 'Authorization' : 'X-BizGuide-Token'] = `Bearer ${token}`;
  const url = new URL(base.href.replace(/\/$/, '') + resource);
  // Allow self-signed TLS only for an explicitly opted-in loopback demo.
  const insecure = process.env.WSO2_ALLOW_SELF_SIGNED === 'true' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  return new Promise((resolve, reject) => {
    const req = (url.protocol === 'https:' ? https : http).request(url, {
      method, headers, rejectUnauthorized: !insecure,
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch { json = null; }
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('Request timed out')));
    req.end(body === undefined ? undefined : JSON.stringify(body));
  });
}

async function check(method, resource, expected, body, options = {}) {
  const response = await request(method, resource, body, options);
  const ok = expected.includes(response.status) && response.json !== null;
  report.checks.push({ name: options.name || `${method} ${resource}`, method, path: resource,
    expected, actual: response.status, passed: ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${method} ${resource}: ${response.status}`);
  if (!ok) throw new Error(`Unexpected status or non-JSON response for ${method} ${resource}`);
  if (!options.negative) {
    const template = Object.keys(spec.paths).find(p =>
      new RegExp('^' + p.replace(/\{\w+\}/g, '[^/]+') + '$').test(resource));
    if (template && spec.paths[template][method.toLowerCase()]) covered.add(`${method} ${template}`);
  }
  return response.json;
}

async function run() {
  if (!direct) await check('GET', '/api/health', [401], undefined,
    { noGateway: true, token: null, negative: true, name: 'Gateway rejects missing credentials' });
  if (!direct && !credential && !internalKey) {
    throw new Error('Set WSO2_ACCESS_TOKEN (or WSO2_INTERNAL_KEY for Publisher testing) in backend/.env.');
  }
  await check('GET', '/api/health', [200]);
  await check('POST', '/api/auth/register', [201], account);
  const login = await check('POST', '/api/auth/login', [200], account);
  if (!login.token) throw new Error('Login response did not include a JWT');
  userToken = login.token;
  const me = await check('GET', '/api/auth/me', [200]);
  if (me.user?.email !== account.email) throw new Error('Current user does not match login');
  await check('GET', '/api/auth/me', [401], undefined,
    { token: null, negative: true, name: 'Backend rejects missing user token' });
  await check('GET', '/api/auth/me', [401], undefined,
    { token: 'invalid-token', negative: true, name: 'Backend rejects invalid user token' });

  const business = await check('POST', '/api/businesses', [201],
    { business_name: `Integration ${suffix}`, business_type: 'Test retail' });
  const b = `/api/businesses/${business.business.business_id}`;
  await check('GET', '/api/businesses', [200]);
  await check('GET', b, [200]);
  await check('PUT', b, [200], { business_name: `Verified ${suffix}` });
  const category = await check('POST', b + '/categories', [201], { name: 'Test category' });
  const c = b + '/categories/' + category.category.category_id;
  await check('GET', b + '/categories', [200]);
  await check('PUT', c, [200], { name: 'Updated test category' });
  const dealer = await check('POST', b + '/dealers', [201], { supplier_name: 'Test dealer' });
  const d = b + '/dealers/' + dealer.dealer.supplier_id;
  await check('GET', b + '/dealers', [200]);
  await check('PUT', d, [200], { phone: '0770000000' });
  const product = await check('POST', b + '/products', [201], {
    product_name: 'Test coffee', category_id: category.category.category_id,
    quantity: 20, cost_price: 100, selling_price: 150,
  });
  const p = b + '/products/' + product.product.product_id;
  await check('GET', b + '/products', [200]);
  await check('GET', p, [200]);
  await check('PUT', p, [200], { selling_price: 175 });
  const purchase = await check('POST', b + '/purchases', [201], {
    supplier_id: dealer.dealer.supplier_id, total_amount: 1000, is_ordered: true,
  });
  await check('GET', b + '/purchases', [200]);
  await check('PUT', b + '/purchases/' + purchase.purchase.purchase_id + '/status', [200],
    { is_ordered: true, is_delivered: true, is_paid: true });
  await check('POST', b + '/sales', [201], { product_id: product.product.product_id, quantity: 2 });
  const stock = await check('GET', p, [200]);
  if (Number(stock.product?.quantity) !== 18) throw new Error('Sale did not deduct expected stock');
  await check('GET', b + '/sales', [200]);
  await check('GET', b + '/invoices', [200]);
  const expense = await check('POST', b + '/expenses', [201], { category: 'Test supplies', amount: 50 });
  await check('GET', b + '/expenses', [200]);
  const reminder = await check('POST', b + '/reminders', [201],
    { title: 'Test reminder', reminder_date: '2030-01-01' });
  const r = b + '/reminders/' + reminder.reminder.reminder_id;
  await check('GET', b + '/reminders', [200]);
  await check('PUT', r, [200], { status: 'Completed' });
  const totals = await check('GET', b + '/reports/sales', [200]);
  if (Number(totals.report?.totalSales) !== 350 || Number(totals.report?.profit) !== -700)
    throw new Error('Report totals do not match the test transactions');

  const other = await check('POST', '/api/auth/register', [201],
    { ...account, email: `other-${suffix}@example.test` });
  await check('GET', b + '/products', [404], undefined,
    { token: other.token, negative: true, name: 'Another user cannot read business inventory' });
  await check('DELETE', r, [200]);
  await check('DELETE', b + '/expenses/' + expense.expense.expense_id, [200]);
  await check('DELETE', p, [200]);
  await check('DELETE', c, [200]);
  await check('DELETE', d, [200]);
  // Business deletion is tested on a separate empty fixture, since financial
  // records have no individual delete endpoints and may prevent deletion.
  const empty = await check('POST', '/api/businesses', [201], { business_name: 'Empty cleanup fixture' });
  await check('DELETE', '/api/businesses/' + empty.business.business_id, [200]);
  report.retainedTestBusinessId = business.business.business_id;
  report.fixtureNote = 'Generated test accounts and business financial records remain; only disposable fixtures were deleted.';
  const count = Object.values(spec.paths).reduce((n, item) => n +
    Object.keys(item).filter(m => ['get','post','put','delete','patch'].includes(m)).length, 0);
  if (covered.size !== count) throw new Error(`Covered ${covered.size}/${count} operations`);
  report.passed = true;
}

run().catch(error => {
  report.passed = false;
  // Never serialize request configuration, response bodies or credential-bearing errors.
  report.failure = error.code || (error.message.startsWith('Set WSO2_') ? error.message :
    'Verification stopped; see last check and local server logs.');
  console.error(report.failure);
  process.exitCode = 1;
}).finally(() => {
  report.coveredOperations = covered.size;
  fs.mkdirSync(path.join(__dirname, '../../docs/evidence'), { recursive: true });
  const destination = path.join(__dirname, '../../docs/evidence', direct ? 'backend-live.json' : 'gateway-live.json');
  fs.writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
  console.log('Redacted report: ' + destination);
});
