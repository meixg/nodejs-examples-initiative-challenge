const server = require('./src')

async function start() {
    const PORT = 3000
    server.listen(PORT)
    console.log(`server started at http://localhost:${PORT}`);
}

start()