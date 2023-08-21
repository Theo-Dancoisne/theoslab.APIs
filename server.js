const express = require("express");
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

app.get("/gitpull", (req, res) => {
    // res.send('Hello World!')
    console.log(req);
});