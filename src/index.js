const express = require('express')
const packages = require('../package.json')
const bent = require('bent')
const semver = require('semver');

const app = express()
const getJSON = bent('json')
const NODE_VERSION_API = 'https://nodejs.org/dist/index.json'

app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

app.get('/dependencies', (req, res) => {
    res.render('packages', {
        packages: Object.keys(packages.dependencies).map(name => {
            return {
                name,
                version: packages.dependencies[name]
            };
        })
    })
})

app.get('/minimum-secure', async (req, res) => {
    const result = {};
    const versions = await getJSON(NODE_VERSION_API);
    versions.forEach(item => {
        if (!item.security) {
            return;
        }
        
        const version = item.version;
        const major = version.split('.')[0];
        if (!result[major]) {
            item.files = [];
            result[major] = item;
        }
        else if (semver.lt(version, result[major].version)) {
            result[major] = item;
        }
    });
    res.json(result)
})

app.get('/latest-releases', async (req, res) => {
    const result = {};
    const versions = await getJSON(NODE_VERSION_API);
    versions.forEach(item => {
        const version = item.version;
        const major = version.split('.')[0];
        if (!result[major]) {
            item.files = [];
            result[major] = item;
        }
        else if (semver.gt(version, result[major].version)) {
            result[major] = item;
        }
    });
    res.json(result)
})

module.exports = app
