const http = require('http');
const fs = require('fs');
const sql = require('mssql');

const config = {
   user: 'USER_LAB14', password: '1111', server: 'VIVO', database: 'Lab14PSKP',
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool;

pool = new sql.ConnectionPool(config, err => {
    if (err) console.log('Ошибка соединения с БД:', err.code);
    else {
        console.log('Соединение с БД установлено');
        server.listen(3000, () => {
            console.log('Server running on http://localhost:3000');
        });
    }
});

function getBody(req, cb) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => cb(body));
}

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (method === 'GET' && url === '/') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        fs.readFile('./index.html', 'utf-8', (err, html) => {
            if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
            else res.end(html);
        });
        return;
    }

    if (method === 'GET' && url === '/api/faculties') {
        pool.request().query('SELECT * FROM FACULTY', (err, result) => {
            if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
            else res.end(JSON.stringify(result.recordset));
        });
        return;
    }

    if (method === 'GET' && url === '/api/pulpits') {
        pool.request().query('SELECT * FROM PULPIT', (err, result) => {
            if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
            else res.end(JSON.stringify(result.recordset));
        });
        return;
    }

    if (method === 'GET' && url === '/api/subjects') {
        pool.request().query('SELECT * FROM SUBJECT', (err, result) => {
            if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
            else res.end(JSON.stringify(result.recordset));
        });
        return;
    }

    if (method === 'GET' && url === '/api/auditoriumstypes') {
        pool.request().query('SELECT * FROM AUDITORIUM_TYPE', (err, result) => {
            if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
            else res.end(JSON.stringify(result.recordset));
        });
        return;
    }

    if (method === 'GET' && url === '/api/auditoriums') {
        pool.request().query('SELECT * FROM AUDITORIUM', (err, result) => {
            if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
            else res.end(JSON.stringify(result.recordset));
        });
        return;
    }

    if (method === 'POST' && url === '/api/faculties') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('f', sql.VarChar(50), data.FACULTY)
                .input('fn', sql.NVarChar(50), data.FACULTY_NAME)
                .query('INSERT INTO FACULTY(FACULTY, FACULTY_NAME) VALUES(@f, @fn); SELECT * FROM FACULTY WHERE FACULTY=@f', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'POST' && url === '/api/pulpits') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('p', sql.VarChar(50), data.PULPIT)
                .input('pn', sql.NVarChar(100), data.PULPIT_NAME)
                .input('f', sql.VarChar(50), data.FACULTY)
                .query('INSERT INTO PULPIT(PULPIT, PULPIT_NAME, FACULTY) VALUES(@p, @pn, @f); SELECT * FROM PULPIT WHERE PULPIT=@p', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'POST' && url === '/api/subjects') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('s', sql.VarChar(50), data.SUBJECT)
                .input('sn', sql.NVarChar(50), data.SUBJECT_NAME)
                .input('p', sql.VarChar(50), data.PULPIT)
                .query('INSERT INTO SUBJECT(SUBJECT, SUBJECT_NAME, PULPIT) VALUES(@s, @sn, @p); SELECT * FROM SUBJECT WHERE SUBJECT=@s', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'POST' && url === '/api/auditoriumstypes') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('at', sql.VarChar(50), data.AUDITORIUM_TYPE)
                .input('atn', sql.NVarChar(30), data.AUDITORIUM_TYPENAME)
                .query('INSERT INTO AUDITORIUM_TYPE(AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES(@at, @atn); SELECT * FROM AUDITORIUM_TYPE WHERE AUDITORIUM_TYPE=@at', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'POST' && url === '/api/auditoriums') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('a', sql.VarChar(50), data.AUDITORIUM)
                .input('an', sql.NVarChar(200), data.AUDITORIUM_NAME)
                .input('ac', sql.Int, data.AUDITORIUM_CAPACITY)
                .input('at', sql.VarChar(50), data.AUDITORIUM_TYPE)
                .query('INSERT INTO AUDITORIUM(AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES(@a, @an, @ac, @at); SELECT * FROM AUDITORIUM WHERE AUDITORIUM=@a', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/faculties') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('f', sql.VarChar(50), data.FACULTY)
                .input('fn', sql.NVarChar(50), data.FACULTY_NAME)
                .query('UPDATE FACULTY SET FACULTY_NAME=@fn WHERE FACULTY=@f; SELECT * FROM FACULTY WHERE FACULTY=@f', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/pulpits') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('p', sql.VarChar(50), data.PULPIT)
                .input('pn', sql.NVarChar(100), data.PULPIT_NAME)
                .input('f', sql.VarChar(50), data.FACULTY)
                .query('UPDATE PULPIT SET PULPIT_NAME=@pn, FACULTY=@f WHERE PULPIT=@p; SELECT * FROM PULPIT WHERE PULPIT=@p', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/subjects') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('s', sql.VarChar(50), data.SUBJECT)
                .input('sn', sql.NVarChar(50), data.SUBJECT_NAME)
                .input('p', sql.VarChar(50), data.PULPIT)
                .query('UPDATE SUBJECT SET SUBJECT_NAME=@sn, PULPIT=@p WHERE SUBJECT=@s; SELECT * FROM SUBJECT WHERE SUBJECT=@s', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/auditoriumstypes') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('at', sql.VarChar(50), data.AUDITORIUM_TYPE)
                .input('atn', sql.NVarChar(30), data.AUDITORIUM_TYPENAME)
                .query('UPDATE AUDITORIUM_TYPE SET AUDITORIUM_TYPENAME=@atn WHERE AUDITORIUM_TYPE=@at; SELECT * FROM AUDITORIUM_TYPE WHERE AUDITORIUM_TYPE=@at', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/auditoriums') {
        getBody(req, body => {
            const data = JSON.parse(body);
            pool.request()
                .input('a', sql.VarChar(50), data.AUDITORIUM)
                .input('an', sql.NVarChar(200), data.AUDITORIUM_NAME)
                .input('ac', sql.Int, data.AUDITORIUM_CAPACITY)
                .input('at', sql.VarChar(50), data.AUDITORIUM_TYPE)
                .query('UPDATE AUDITORIUM SET AUDITORIUM_NAME=@an, AUDITORIUM_CAPACITY=@ac, AUDITORIUM_TYPE=@at WHERE AUDITORIUM=@a; SELECT * FROM AUDITORIUM WHERE AUDITORIUM=@a', (err, result) => {
                    if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                    else res.end(JSON.stringify(result.recordset));
                });
        });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/faculties/')) {
        const id = decodeURIComponent(url.split('/')[3]);
        pool.request()
            .input('f', sql.VarChar(50), id)
            .query('SELECT * FROM FACULTY WHERE RTRIM(FACULTY)=@f; DELETE FROM FACULTY WHERE RTRIM(FACULTY)=@f', (err, result) => {
                if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                else res.end(JSON.stringify(result.recordset));
            });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/pulpits/')) {
        const id = decodeURIComponent(url.split('/')[3]);
        pool.request()
            .input('p', sql.VarChar(50), id)
            .query('SELECT * FROM PULPIT WHERE RTRIM(PULPIT)=@p; DELETE FROM PULPIT WHERE RTRIM(PULPIT)=@p', (err, result) => {
                if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                else res.end(JSON.stringify(result.recordset));
            });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/subjects/')) {
        const id = decodeURIComponent(url.split('/')[3]);
        pool.request()
            .input('s', sql.VarChar(50), id)
            .query('SELECT * FROM SUBJECT WHERE RTRIM(SUBJECT)=@s; DELETE FROM SUBJECT WHERE RTRIM(SUBJECT)=@s', (err, result) => {
                if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                else res.end(JSON.stringify(result.recordset));
            });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/auditoriumtypes/')) {
        const id = decodeURIComponent(url.split('/')[3]);
        pool.request()
            .input('at', sql.VarChar(50), id)
            .query('SELECT * FROM AUDITORIUM_TYPE WHERE RTRIM(AUDITORIUM_TYPE)=@at; DELETE FROM AUDITORIUM_TYPE WHERE RTRIM(AUDITORIUM_TYPE)=@at', (err, result) => {
                if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                else res.end(JSON.stringify(result.recordset));
            });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/auditoriums/')) {
        const id = decodeURIComponent(url.split('/')[3]);
        pool.request()
            .input('a', sql.VarChar(50), id)
            .query('SELECT * FROM AUDITORIUM WHERE RTRIM(AUDITORIUM)=@a; DELETE FROM AUDITORIUM WHERE RTRIM(AUDITORIUM)=@a', (err, result) => {
                if (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); }
                else res.end(JSON.stringify(result.recordset));
            });
        return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
});


