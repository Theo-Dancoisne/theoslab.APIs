const express = require("express");
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log("Server listening on port ${port}");
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.post("/gitpull", (req, res) => {
    console.log(req);
    //
});