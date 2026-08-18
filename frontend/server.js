const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();

// parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// static files
app.use(express.static("public"));

app.post("/submit", async (req, res) => {
    try {
        // send data to backend
        const response = await axios.post(
            "http://localhost:9000/process",
            req.body
        );

        if (response.data.success) {
            return res.redirect("/success.html");
        }

        throw new Error(response.data.message || "Something went wrong");

    } catch (error) {
        let errorMsg = "Submission Failed";

        if (error.code === "ECONNREFUSED") {
            errorMsg = "Backend is not running";
        } else if (error.response && error.response.data && error.response.data.message) {
            errorMsg = error.response.data.message;
        } else if (error.message) {
            errorMsg = error.message;
        }

        // read form page
        let html = fs.readFileSync(
            path.join(__dirname, "public", "index.html"),
            "utf8"
        );

        // show error
        const errorHtml = `<div class="error-alert">${errorMsg}</div>`;
        html = html.replace("<!-- ERROR_MESSAGE -->", errorHtml);

        return res.status(500).send(html);
    }
});

app.listen(8000, () => {
    console.log("Frontend running on port 8000");
});