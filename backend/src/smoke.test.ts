import test from 'node:test'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import app from './index'

let baseUrl = ''
let server: ReturnType<typeof app.listen>

test.before(async () => {
  server = app.listen(0)
  await new Promise<void>((resolve) => server.once('listening', () => resolve()))
  const addr = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${addr.port}`
})

test.after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
})

test('health endpoint responds', async () => {
  const res = await fetch(`${baseUrl}/health`)
  assert.equal(res.status, 200)
})

test('auth login and profile flow works', async () => {
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'usera@test.com',
      password: 'password123',
    }),
  })

  assert.equal(loginRes.status, 200)
  const loginJson: any = await loginRes.json()
  const token = loginJson?.data?.token
  assert.ok(token, 'token should be returned by login')

  const profileRes = await fetch(`${baseUrl}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  assert.equal(profileRes.status, 200)
})

test('gigs list endpoint responds with data envelope', async () => {
  const res = await fetch(`${baseUrl}/gigs/list`)
  assert.equal(res.status, 200)
  const json: any = await res.json()
  assert.ok(Array.isArray(json?.data?.gigs))
})

test('payments create-order fails gracefully without key config', async () => {
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'usera@test.com',
      password: 'password123',
    }),
  })
  const loginJson: any = await loginRes.json()
  const token = loginJson?.data?.token

  const res = await fetch(`${baseUrl}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: 1000 }),
  })

  assert.equal(res.status, 503)
})
