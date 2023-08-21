const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 3000;

app.listen(port, () => {
    console.log('Server listening on port ${port}');
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.post("/gitpull", (req, res) => {
    res.send("got it");
    console.log(JSON.stringify(req.head));
    console.log("");
    console.log(JSON.stringify(req.body));
});