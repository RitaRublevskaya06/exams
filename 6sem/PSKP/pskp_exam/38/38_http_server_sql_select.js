const http = require('http');
const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'StrongPass_2026!',
    server: '127.0.0.1',
    port: 1433,
    database: 'testdb',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool = null;

async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return true;
    } catch (error) {
        console.error('Connection error:', error.message);
        return false;
    }
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (req.method === 'GET' && url.pathname === '/users') {
        try {
            const result = await pool.request().query('SELECT * FROM users ORDER BY id');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.recordset));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    else if (req.method === 'GET' && /^\/users\/\d+$/.test(url.pathname)) {
        const id = parseInt(url.pathname.split('/')[2]);
        try {
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM users WHERE id = @id');
            
            if (result.recordset.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.recordset[0]));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    else if (req.method === 'GET' && url.pathname === '/users/search') {
        const name = url.searchParams.get('name');
        if (!name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Name parameter required' }));
            return;
        }
        try {
            const result = await pool.request()
                .input('name', sql.VarChar, `%${name}%`)
                .query('SELECT * FROM users WHERE name LIKE @name');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.recordset));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>SQL SELECT Demo</title></head>
            <body>
                <h1>SQL Server SELECT Demo</h1>
                <h2>Endpoints:</h2>
                <ul>
                    <li>GET /users - all users</li>
                    <li>GET /users/1 - user by ID</li>
                    <li>GET /users/search?name=alice - search by name</li>
                </ul>
                <div id="users">Loading...</div>
                <script>
                    fetch('/users')
                        .then(res => res.json())
                        .then(data => {
                            document.getElementById('users').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                        });
                </script>
            </body>
            </html>
        `);
    }
});

connectDB().then(success => {
    if (success) {
        server.listen(3000, () => {
            console.log('Server on http://localhost:3000');
            console.log('GET /users - all users');
            console.log('GET /users/1 - user by ID');
            console.log('GET /users/search?name= - search by name');
        });
    }
});