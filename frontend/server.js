const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// when user submits the form
app.post("/submit", async (req, res) => {
    try {
        // calling backend
        const backendUrl = process.env.BACKEND_URL || "http://localhost:9000";
        const response = await axios.post(`${backendUrl}/process`, req.body);

        if (response.data.success) {
            return res.redirect("/success.html");
        } else {
            throw new Error(response.data.message || "Failed");
        }

    } catch (err) {
        let msg = "Something went wrong";

        if (err.code === "ECONNREFUSED") {
            msg = "Backend is not running";
        } else if (err.response && err.response.data && err.response.data.message) {
            msg = err.response.data.message;
        } else if (err.message) {
            msg = err.message;
        }

        // load the form page again and show error
        let page = fs.readFileSync(path.join(__dirname, "public", "index.html"), "utf8");
        page = page.replace("<!-- ERROR_MESSAGE -->", `<div class="error-alert">${msg}</div>`);

        return res.status(500).send(page);
    }
});

app.listen(8000, () => {
    console.log("Frontend running on port 8000");
});