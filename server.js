const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 3000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.post("/gitpull", (req, res) => {
    import("./private/GitHubWebhooks").then((module) => {
        if (module.AutoGitPull(req, res)) res.status(200).send("Ok");
        else res.status(401).send("Unauthorized");
    });
});