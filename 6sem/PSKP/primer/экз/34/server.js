const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
    console.log('req.body:', req.body);
    
    const { name, email, age, message } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({
            error: 'Имя и email обязательны для заполнения'
        });
    }
    
    res.json({
        status: 'success',
        message: 'Данные получены',
        data: {
            name: name,
            email: email,
            age: age || 'не указан',
            message: message || 'без сообщения'
        }
    });
});

app.post('/register', (req, res) => {
    const { username, password, confirmPassword, email } = req.body;
    
    if (!username || !password || !confirmPassword || !email) {
        return res.status(400).send('Все поля обязательны для заполнения');
    }
    
    if (password !== confirmPassword) {
        return res.status(400).send('Пароли не совпадают');
    }
    
    if (password.length < 6) {
        return res.status(400).send('Пароль должен быть не менее 6 символов');
    }
    
    res.send(`Пользователь ${username} успешно зарегистрирован!`);
});

app.listen(5000, () => {
    console.log('Сервер запущен на http://localhost:5000');
});