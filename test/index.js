const tape = require('tape')
const bent = require('bent')
const getPort = require('get-port')
const nock = require('nock')
const fs = require('fs')
const server = require('../src')

const getJSON = bent('json')
const getBuffer = bent('buffer')

// Use `nock` to prevent live calls to remote services
const mockRes = require('./mock.json')
nock('https://nodejs.org')
    .get('/dist/index.json')
    .reply(200, mockRes)
    .persist()

const context = {}

tape('setup', async function (t) {
    const port = await getPort()
    context.server = server.listen(port)
    context.origin = `http://localhost:${port}`

    t.end()
})

tape('should get dependencies', async function (t) {
    const html = (await getBuffer(`${context.origin}/dependencies`)).toString()
    t.match(html, /bent/, 'should contain bent');
    t.match(html, /express/, 'should contain express');
    t.match(html, /hbs/, 'should contain hbs');
})

tape('should get minimum secure versions', async function (t) {
    const versions = await getJSON(`${context.origin}/minimum-secure`)
    t.match(versions.v0.version, /v0.10.46/, 'v0 version should match')
    t.match(versions.v4.version, /v4.6.0/, 'v4 version should match')
})

tape('should get latest-releases', async function (t) {
    const versions = await getJSON(`${context.origin}/latest-releases`)
    t.match(versions.v14.version, /v14.10.1/, 'v14 version should match')
    t.match(versions.v13.version, /v13.14.0/, 'v13 version should match')
})

tape('teardown', function (t) {
    context.server.close()
    t.end()
})
