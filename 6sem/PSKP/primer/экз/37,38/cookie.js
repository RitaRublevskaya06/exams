const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

app.use(cookieParser('мой_секретный_ключ'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client_cookie.html'));
});
app.get('/set', (req, res) => {
  res.cookie('normal', encodeURIComponent('normal cookie'));                  
  res.cookie('signed', encodeURIComponent('signed cookieW'), { signed: true }); 
  res.send('Cookies установлены');
});

app.get('/get', (req, res) => {
  const normal = req.cookies.normal ? decodeURIComponent(req.cookies.normal) : null;
  const signed = req.signedCookies.signed ? decodeURIComponent(req.signedCookies.signed) : null;
  
  res.json({ normal, signed });
});

app.listen(3000, () => console.log('http://localhost:3000'));