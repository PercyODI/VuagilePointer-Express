const express = require("express")
const app = express()
const port = process.env.PORT || 3000

app.use("/app", express.static("app/dist"));
app.get("/", (req, res) => res.redirect("/app/index.html"))

app.listen(port, () => console.log(`Listening on port ${port}\nLink: http://localhost:${port}`))