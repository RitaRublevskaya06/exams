// express_static_download.js - Express сервер для работы со статическими файлами и скачиванием
// Импорт необходимых модулей
const express = require('express');
const path = require('path');  // Модуль для работы с путями файлов
const fs = require('fs');      // Модуль для работы с файловой системой
const app = express();        // Создание экземпляра Express приложения

// Middleware: Обслуживание статических файлов из разных директорий
// 1. Файлы из папки 'public' доступны по корневому пути (/file.txt → public/file.txt)
app.use(express.static('public'));
// 2. Файлы из папки 'static' доступны по пути /static (коткая ссылка)
app.use('/static', express.static(path.join(__dirname, 'static')));
// 3. Файлы из папки 'uploads' доступны по пути /uploads
app.use('/uploads', express.static('uploads'));

// Определение путей к директориям
const publicDir = path.join(__dirname, 'public');    // Абсолютный путь к public
const staticDir = path.join(__dirname, 'static');    // Абсолютный путь к static
const uploadsDir = path.join(__dirname, 'uploads');  // Абсолютный путь к uploads

// Создание директорий, если они не существуют
[publicDir, staticDir, uploadsDir].forEach(dir => {
    // fs.existsSync() проверяет существование директории
    if (!fs.existsSync(dir)) {
        // fs.mkdirSync() создает директорию, { recursive: true } создает все вложенные директории
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Определение тестовых файлов, которые будут созданы в public директории
const testFiles = [
    { name: 'style.css', content: 'body { font-family: Arial; } h1 { color: blue; }' },
    { name: 'script.js', content: 'console.log("Hello from static file");' },
    { name: 'image.jpg', content: 'fake image content', isBinary: false }
];

// Создание тестовых файлов
testFiles.forEach(file => {
    const filePath = path.join(publicDir, file.name);  // Полный путь к файлу
    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
        // Создаем файл с указанным содержимым
        fs.writeFileSync(filePath, file.content);
    }
});

// Маршрут для скачивания файлов
// :filename - route параметр, содержащий имя файла
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;  // Получаем имя файла из URL
    const filePath = path.join(__dirname, 'public', filename);  // Полный путь к файлу
    
    // Проверяем существование файла
    if (fs.existsSync(filePath)) {
        // Метод res.download() отправляет файл как вложение для скачивания
        res.download(filePath, filename, (err) => {
            // Обработка ошибок скачивания
            if (err) {
                console.error('Download error:', err);
                res.status(500).send('Error downloading file');
            }
        });
    } else {
        // Если файл не найден - 404
        res.status(404).send('File not found');
    }
});

// Маршрут для скачивания с явным указанием Content-Disposition как attachment
app.get('/download-attachment/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', filename);
    
    if (fs.existsSync(filePath)) {
        // res.attachment() устанавливает заголовок Content-Disposition: attachment
        // Это заставляет браузер скачивать файл, а не отображать его
        res.attachment(filename);
        // Отправляем файл
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Маршрут для просмотра файлов в браузере (inline)
app.get('/view/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', filename);
    
    if (fs.existsSync(filePath)) {
        // res.sendFile() отправляет файл с Content-Type на основе расширения
        // Браузер попытается отобразить файл, если может
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Маршрут для получения списка файлов в public директории
app.get('/files', (req, res) => {
    // Асинхронное чтение директории
    fs.readdir(publicDir, (err, files) => {
        if (err) {
            // Если ошибка чтения директории
            res.status(500).json({ error: err.message });
        } else {
            // Создаем массив с информацией о файлах
            const fileList = files.map(file => ({
                name: file,
                // fs.statSync() возвращает информацию о файле
                size: fs.statSync(path.join(publicDir, file)).size,      // Размер в байтах
                modified: fs.statSync(path.join(publicDir, file)).mtime  // Время последнего изменения
            }));
            res.json({ files: fileList });
        }
    });
});

// POST маршрут для создания нового файла
app.post('/create-file', express.json(), (req, res) => {
    const { filename, content } = req.body;
    // Формируем путь к файлу, используя переданное имя или имя по умолчанию
    const filePath = path.join(publicDir, filename || 'generated.txt');
    
    // Асинхронная запись файла
    fs.writeFile(filePath, content || 'Generated content', (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({
                message: 'File created',
                filename: path.basename(filePath),  // Только имя файла без пути
                downloadUrl: `/download/${path.basename(filePath)}`  // URL для скачивания
            });
        }
    });
});

// Главная страница с демонстрацией возможностей
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>...HTML код с демонстрацией статических файлов и скачивания...</html>`);
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('Static files from /public directory');
    console.log('Download via /download/:filename');
});