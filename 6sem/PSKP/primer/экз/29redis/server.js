const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = redis.createClient({ 
    url: 'redis://default:Xngu1457z0Lp0CpMgzcVb1R4T199wP8m@redis-16169.c13.us-east-1-3.ec2.cloud.redislabs.com:16169'
});


client.on('connect', () => console.log('Redis подключен'));
client.on('error', (err) => console.error(' Redis ошибка:', err));

async function startServer() {
    try {
        await client.connect();
        
        app.post('/data/:key', async (req, res) => {
            try {
                const { key } = req.params;
                const { value } = req.body;
                
                if (!value) {
                    return res.status(400).json({ error: 'Поле value обязательно' });
                }
                
                await client.set(key, JSON.stringify(value));
                res.json({ 
                    success: true, 
                    message: `Данные записаны по ключу: ${key}`,
                    data: { key, value }
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.get('/data/:key', async (req, res) => {
            try {
                const { key } = req.params;
                const value = await client.get(key);
                
                if (!value) {
                    return res.status(404).json({ error: `Ключ ${key} не найден` });
                }
                
                res.json({ 
                    success: true, 
                    key, 
                    value: JSON.parse(value) 
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.put('/data/:key', async (req, res) => {
            try {
                const { key } = req.params;
                const { value } = req.body;
                
                if (!value) {
                    return res.status(400).json({ error: 'Поле value обязательно' });
                }
                
                const exists = await client.exists(key);
                if (!exists) {
                    return res.status(404).json({ error: `Ключ ${key} не найден для обновления` });
                }
                
                await client.set(key, JSON.stringify(value));
                res.json({ 
                    success: true, 
                    message: `Данные обновлены по ключу: ${key}`,
                    data: { key, value }
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.delete('/data/:key', async (req, res) => {
            try {
                const { key } = req.params;
                const deleted = await client.del(key);
                
                if (deleted === 0) {
                    return res.status(404).json({ error: `Ключ ${key} не найден` });
                }
                
                res.json({ 
                    success: true, 
                    message: `Данные удалены по ключу: ${key}` 
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.get('/keys', async (req, res) => {
            try {
                const keys = await client.keys('*');
                res.json({ success: true, keys });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.post('/hash/:key', async (req, res) => {
            try {
                const { key } = req.params;
                const fields = req.body;
                
                if (!fields || Object.keys(fields).length === 0) {
                    return res.status(400).json({ error: 'Поля для хеша обязательны' });
                }
                
                const hashFields = {};
                for (const [field, value] of Object.entries(fields)) {
                    hashFields[field] = JSON.stringify(value);
                }
                
                await client.hSet(key, hashFields);
                res.json({ 
                    success: true, 
                    message: `Хеш ${key} сохранен`,
                    data: fields
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.get('/hash/:key', async (req, res) => {
            try {
                const { key } = req.params;
                const hash = await client.hGetAll(key);
                
                if (!hash || Object.keys(hash).length === 0) {
                    return res.status(404).json({ error: `Хеш ${key} не найден` });
                }
                
                const parsedHash = {};
                for (const [field, value] of Object.entries(hash)) {
                    try {
                        parsedHash[field] = JSON.parse(value);
                    } catch {
                        parsedHash[field] = value;
                    }
                }
                
                res.json({ 
                    success: true, 
                    key,
                    data: parsedHash
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.get('/hash/:key/:field', async (req, res) => {
            try {
                const { key, field } = req.params;
                const value = await client.hGet(key, field);
                
                if (!value) {
                    return res.status(404).json({ error: `Поле ${field} не найдено в хеше ${key}` });
                }
                
                try {
                    const parsedValue = JSON.parse(value);
                    res.json({ 
                        success: true, 
                        key,
                        field,
                        value: parsedValue
                    });
                } catch {
                    res.json({ 
                        success: true, 
                        key,
                        field,
                        value: value
                    });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.put('/hash/:key/:field', async (req, res) => {
            try {
                const { key, field } = req.params;
                const { value } = req.body;
                
                if (value === undefined) {
                    return res.status(400).json({ error: 'Поле value обязательно' });
                }
                
                const exists = await client.hExists(key, field);
                if (!exists) {
                    return res.status(404).json({ error: `Поле ${field} не найдено в хеше ${key}` });
                }
                
                await client.hSet(key, field, JSON.stringify(value));
                res.json({ 
                    success: true, 
                    message: `Поле ${field} обновлено в хеше ${key}`,
                    data: { field, value }
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.delete('/hash/:key/:field', async (req, res) => {
            try {
                const { key, field } = req.params;
                const deleted = await client.hDel(key, field);
                
                if (deleted === 0) {
                    return res.status(404).json({ error: `Поле ${field} не найдено в хеше ${key}` });
                }
                
                res.json({ 
                    success: true, 
                    message: `Поле ${field} удалено из хеша ${key}`
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.listen(PORT, () => {
            console.log(` Сервер запущен на http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error(' Ошибка подключения к Redis:', error);
        process.exit(1);
    }
}

startServer();