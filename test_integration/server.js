const express = require('express');
const { expressMiddleware } = require('sqlguard-ml');

const app = express();
app.use(express.json());

app.use(expressMiddleware({
  threshold: 0.5,
  mlEndpoint: 'http://127.0.0.1:8000/api/v1/detect'
}));

app.post('/login', (req, res) => {
  res.json({ success: true, message: "Logged in successfully!" });
});

app.listen(3000, () => console.log('Test Express Server running on port 3000'));
