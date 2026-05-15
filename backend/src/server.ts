import express from "express";

const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Test Route')
})

const server = app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))