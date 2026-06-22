const express = require('express');
const app = express();

app.get('/', (req, res) => {
    const x = req.query.x;
    const y = req.query.y;
    
    res.status(200).send(`От сервера x: ${x}\ny: ${y}`);
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});