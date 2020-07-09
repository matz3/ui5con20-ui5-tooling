const express = require("express");
const middleware = require("./lib/middleware");
const path = require("path");
const app = express();
const port = 3001;

const appDir = path.dirname(require.resolve("@ui5con20/app/dist/index.html"));

app.use(express.static(appDir));
app.use("/data", middleware());

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
