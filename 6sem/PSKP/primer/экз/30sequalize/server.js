const http = require('http');
const fs = require('fs');
const {
    sequelize,
    Faculty,
    Pulpit,
    Subject,
    Teacher,
    AuditoriumType,
    Auditorium
} = require('./db');

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
        Faculty.findAll({
            include: [
                { model: Pulpit }  
            ]
        })
            .then(records => res.end(JSON.stringify(records)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    if (method === 'GET' && url === '/api/pulpits') {
        Pulpit.findAll({
            include: [
                { model: Teacher },  
                { model: Subject } 
            ]
        })
            .then(records => res.end(JSON.stringify(records)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    if (method === 'GET' && url === '/api/subjects') {
        Subject.findAll()
            .then(records => res.end(JSON.stringify(records)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    if (method === 'GET' && url === '/api/auditoriumstypes') {
        AuditoriumType.findAll({
            include: [
                { model: Auditorium }
            ]
        })
            .then(records => res.end(JSON.stringify(records)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    if (method === 'GET' && url === '/api/auditoriums') {
        Auditorium.findAll()
            .then(records => res.end(JSON.stringify(records)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    if (method === 'POST' && url === '/api/faculties') {
        getBody(req, body => {
            const data = JSON.parse(body);
            Faculty.create({
                FACULTY: data.FACULTY,
                FACULTY_NAME: data.FACULTY_NAME
            })
                .then(record => res.end(JSON.stringify([record])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'POST' && url === '/api/pulpits') {
        getBody(req, body => {
            const data = JSON.parse(body);
            Pulpit.create({
                PULPIT: data.PULPIT,
                PULPIT_NAME: data.PULPIT_NAME,
                FACULTY: data.FACULTY
            })
                .then(record => res.end(JSON.stringify([record])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'POST' && url === '/api/subjects') {
        getBody(req, body => {
            const data = JSON.parse(body);
            Subject.create({
                SUBJECT: data.SUBJECT,
                SUBJECT_NAME: data.SUBJECT_NAME,
                PULPIT: data.PULPIT
            })
                .then(record => res.end(JSON.stringify([record])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'POST' && url === '/api/auditoriumstypes') {
        getBody(req, body => {
            const data = JSON.parse(body);
            AuditoriumType.create({
                AUDITORIUM_TYPE: data.AUDITORIUM_TYPE,
                AUDITORIUM_TYPENAME: data.AUDITORIUM_TYPENAME
            })
                .then(record => res.end(JSON.stringify([record])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'POST' && url === '/api/auditoriums') {
        getBody(req, body => {
            const data = JSON.parse(body);
            Auditorium.create({
                AUDITORIUM: data.AUDITORIUM,
                AUDITORIUM_NAME: data.AUDITORIUM_NAME,
                AUDITORIUM_CAPACITY: data.AUDITORIUM_CAPACITY,
                AUDITORIUM_TYPE: data.AUDITORIUM_TYPE
            })
                .then(record => res.end(JSON.stringify([record])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/faculties') {
        getBody(req, body => {
            const data = JSON.parse(body);
            Faculty.update(
                { FACULTY_NAME: data.FACULTY_NAME },
                { where: { FACULTY: data.FACULTY } }
            )
                .then(() => Faculty.findOne({ where: { FACULTY: data.FACULTY } }))
                .then(record => res.end(JSON.stringify(record ? [record] : [])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/pulpits') {
        getBody(req, body => {
            const data = JSON.parse(body);
            Pulpit.update(
                {
                    PULPIT_NAME: data.PULPIT_NAME,
                    FACULTY: data.FACULTY
                },
                { where: { PULPIT: data.PULPIT } }
            )
                .then(() => Pulpit.findOne({ where: { PULPIT: data.PULPIT } }))
                .then(record => res.end(JSON.stringify(record ? [record] : [])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/subjects') {
        getBody(req, body => {
            const data = JSON.parse(body);
            Subject.update(
                {
                    SUBJECT_NAME: data.SUBJECT_NAME,
                    PULPIT: data.PULPIT
                },
                { where: { SUBJECT: data.SUBJECT } }
            )
                .then(() => Subject.findOne({ where: { SUBJECT: data.SUBJECT } }))
                .then(record => res.end(JSON.stringify(record ? [record] : [])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/auditoriumstypes') {
        getBody(req, body => {
            const data = JSON.parse(body);
            AuditoriumType.update(
                { AUDITORIUM_TYPENAME: data.AUDITORIUM_TYPENAME },
                { where: { AUDITORIUM_TYPE: data.AUDITORIUM_TYPE } }
            )
                .then(() => AuditoriumType.findOne({ where: { AUDITORIUM_TYPE: data.AUDITORIUM_TYPE } }))
                .then(record => res.end(JSON.stringify(record ? [record] : [])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'PUT' && url === '/api/auditoriums') {
        getBody(req, body => {
            const data = JSON.parse(body);
            Auditorium.update(
                {
                    AUDITORIUM_NAME: data.AUDITORIUM_NAME,
                    AUDITORIUM_CAPACITY: data.AUDITORIUM_CAPACITY,
                    AUDITORIUM_TYPE: data.AUDITORIUM_TYPE
                },
                { where: { AUDITORIUM: data.AUDITORIUM } }
            )
                .then(() => Auditorium.findOne({ where: { AUDITORIUM: data.AUDITORIUM } }))
                .then(record => res.end(JSON.stringify(record ? [record] : [])))
                .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/faculties/')) {
        const id = decodeURIComponent(url.split('/')[3]).trim();
        Faculty.findOne({ where: { FACULTY: id } })
            .then(record => {
                if (!record) return [];
                return Faculty.destroy({ where: { FACULTY: id } })
                    .then(() => [record]);
            })
            .then(result => res.end(JSON.stringify(result)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/pulpits/')) {
        const id = decodeURIComponent(url.split('/')[3]).trim();
        Pulpit.findOne({ where: { PULPIT: id } })
            .then(record => {
                if (!record) return [];
                return Pulpit.destroy({ where: { PULPIT: id } })
                    .then(() => [record]);
            })
            .then(result => res.end(JSON.stringify(result)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/subjects/')) {
        const id = decodeURIComponent(url.split('/')[3]).trim();
        Subject.findOne({ where: { SUBJECT: id } })
            .then(record => {
                if (!record) return [];
                return Subject.destroy({ where: { SUBJECT: id } })
                    .then(() => [record]);
            })
            .then(result => res.end(JSON.stringify(result)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/auditoriumtypes/')) {
        const id = decodeURIComponent(url.split('/')[3]).trim();
        AuditoriumType.findOne({ where: { AUDITORIUM_TYPE: id } })
            .then(record => {
                if (!record) return [];
                return AuditoriumType.destroy({ where: { AUDITORIUM_TYPE: id } })
                    .then(() => [record]);
            })
            .then(result => res.end(JSON.stringify(result)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    if (method === 'DELETE' && url.startsWith('/api/auditoriums/')) {
        const id = decodeURIComponent(url.split('/')[3]).trim();
        Auditorium.findOne({ where: { AUDITORIUM: id } })
            .then(record => {
                if (!record) return [];
                return Auditorium.destroy({ where: { AUDITORIUM: id } })
                    .then(() => [record]);
            })
            .then(result => res.end(JSON.stringify(result)))
            .catch(err => { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })); });
        return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
});

sequelize.authenticate()
    .then(() => {
        console.log('Соединение с БД установлено (Sequelize)');
        server.listen(3000, () => {
            console.log('Server running on http://localhost:3000');
        });
    })
    .catch(err => {
        console.log('Ошибка соединения с БД:', err.message);
    });

