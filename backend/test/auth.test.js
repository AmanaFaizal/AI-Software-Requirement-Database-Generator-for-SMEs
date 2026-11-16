const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const auth = require('../src/middleware/auth');

test('direct and gateway credentials remain separate', () => {
  const oldSecret = process.env.JWT_SECRET;
  const oldMode = process.env.BIZGUIDE_AUTH_MODE;
  process.env.JWT_SECRET = 'test-only-secret';
  const good = jwt.sign({ user_id: 7 }, process.env.JWT_SECRET);
  const expired = jwt.sign({ user_id: 7 }, process.env.JWT_SECRET, { expiresIn: -1 });
  const foreign = jwt.sign({ user_id: 7 }, 'other-secret');
  function check(mode, headers, expected, rawHeaders = []) {
    process.env.BIZGUIDE_AUTH_MODE = mode;
    const req = { headers, rawHeaders };
    let status = 200;
    let continued = false;
    const res = { status(code) { status = code; return this; }, json() {} };
    auth(req, res, () => { continued = true; });
    assert.equal(status, expected);
    assert.equal(continued, expected === 200);
    if (continued) assert.equal(req.user.user_id, 7);
  }
  try {
    check('direct', { authorization: `Bearer ${good}` }, 200);
    check('direct', { authorization: `Bearer ${good}`, 'x-bizguide-token': `Bearer ${good}` }, 401);
    check('gateway', { authorization: 'Bearer gateway-oauth', 'x-bizguide-token': `Bearer ${good}` }, 200);
    check('gateway', { authorization: `Bearer ${good}` }, 401);
    for (const mode of ['direct', 'gateway']) {
      const key = mode === 'direct' ? 'authorization' : 'x-bizguide-token';
      check(mode, {}, 401);
      for (const value of [expired, foreign, 'invalid']) check(mode, { [key]: `Bearer ${value}` }, 401);
      check(mode, { [key]: `Bearer ${good}, Bearer ${good}` }, 401);
      check(mode, { [key]: `Bearer ${good}` }, 401, [key, `Bearer ${good}`, key, `Bearer ${good}`]);
      check(mode, { [key]: `Bearer ${jwt.sign({ email: 'no-user-id' }, process.env.JWT_SECRET)}` }, 401);
    }
    check('invalid-mode', {}, 500);
  } finally {
    if (oldSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldSecret;
    if (oldMode === undefined) delete process.env.BIZGUIDE_AUTH_MODE; else process.env.BIZGUIDE_AUTH_MODE = oldMode;
  }
});
