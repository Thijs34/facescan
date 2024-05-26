const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.post('/saveUserInfo', (req, res) => {
    const userInfo = req.body;

    fs.writeFile('userinfo.json', JSON.stringify(userInfo, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save user info' });
        }
        res.status(200).json({ message: 'User info saved successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
