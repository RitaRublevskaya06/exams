// express_static_download.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Статические файлы
app.use(express.static('public'));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/uploads', express.static('uploads'));

// Создание директорий
const publicDir = path.join(__dirname, 'public');
const staticDir = path.join(__dirname, 'static');
const uploadsDir = path.join(__dirname, 'uploads');

[publicDir, staticDir, uploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Создание тестовых файлов
const testFiles = [
    { name: 'style.css', content: 'body { font-family: Arial; } h1 { color: blue; }' },
    { name: 'script.js', content: 'console.log("Hello from static file");' },
    { name: 'image.jpg', content: 'fake image content', isBinary: false }
];

testFiles.forEach(file => {
    const filePath = path.join(publicDir, file.name);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, file.content);
    }
});

// Download файлов
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).send('Error downloading file');
            }
        });
    } else {
        res.status(404).send('File not found');
    }
});

// Download с установкой Content-Disposition
app.get('/download-attachment/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', filename);
    
    if (fs.existsSync(filePath)) {
        res.attachment(filename);
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Inline vs Attachment
app.get('/view/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', filename);
    
    if (fs.existsSync(filePath)) {
        // Для просмотра в браузере
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Список файлов
app.get('/files', (req, res) => {
    fs.readdir(publicDir, (err, files) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const fileList = files.map(file => ({
                name: file,
                size: fs.statSync(path.join(publicDir, file)).size,
                modified: fs.statSync(path.join(publicDir, file)).mtime
            }));
            res.json({ files: fileList });
        }
    });
});

// Создание файла для скачивания
app.post('/create-file', express.json(), (req, res) => {
    const { filename, content } = req.body;
    const filePath = path.join(publicDir, filename || 'generated.txt');
    
    fs.writeFile(filePath, content || 'Generated content', (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({
                message: 'File created',
                filename: path.basename(filePath),
                downloadUrl: `/download/${path.basename(filePath)}`
            });
        }
    });
});

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Static Files & Download</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <h1>Static Files Demo</h1>
            <p>This page uses static CSS file: <code>/style.css</code></p>
            
            <h2>Download Files</h2>
            <ul>
                <li><a href="/download/style.css">Download style.css</a></li>
                <li><a href="/download/script.js">Download script.js</a></li>
                <li><a href="/view/style.css">View style.css (inline)</a></li>
                <li><a href="/download-attachment/style.css">Download as attachment</a></li>
            </ul>
            
            <h2>Static Directories</h2>
            <ul>
                <li><a href="/style.css">/style.css</a> (from /public)</li>
                <li><a href="/static/">/static/</a> (custom static dir)</li>
            </ul>
            
            <h2>Available Files</h2>
            <div id="fileList"></div>
            
            <script src="/script.js"></script>
            <script>
                fetch('/files')
                    .then(res => res.json())
                    .then(data => {
                        const list = document.getElementById('fileList');
                        list.innerHTML = '<ul>' + data.files.map(f => 
                            \`<li>\${f.name} (\${f.size} bytes) - <a href="/download/\${f.name}">Download</a></li>\`
                        ).join('') + '</ul>';
                    });
            </script>
        </body>
        </html>
    `);
});

app.listen(3000, () => {
    console.log('Express сервер на http://localhost:3000');
    console.log('Static files from /public directory');
    console.log('Download via /download/:filename');
});