const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'Budapest.jpg');
    
    res.setHeader('Content-Type', 'image/jpg');
    res.setHeader('Content-Disposition', 'attachment; filename="Budapest.jpg"');
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Ошибка при отправке файла:', err);
            res.status(404).send('Файл не найден');
        } else {
            console.log('Файл успешно отправлен');
        }
    });
});

app.listen(5000, () => {
    console.log('Express сервер запущен на http://localhost:5000');
});