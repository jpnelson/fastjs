const express = require("express");
const app = express();

var request = require("request");

app.get("/", (req, res) => {
  const subdomains = req.subdomains;
  console.log("Headers", JSON.stringify(req.headers));
  console.log("Subdomains", subdomains);
  if (subdomains.length === 0) {
    res.sendStatus(404);
    return;
  }
  if (subdomains.length === 1) {
    const package = subdomains[0];
    request(
      `https://registry.npmjs.org/${package}/latest`,
      (err, response, body) => {
        if (err) {
          res.send(500);
          return;
        }

        const json = JSON.parse(body);

        const homepage =
          json.homepage || `https://www.npmjs.com/package/${package}`;

        res.redirect(json.homepage);
        return;
      }
    );
  } else {
    res.sendStatus(404);
    return;
  }
});

app.listen(8080, () => console.log("App listening on port 8080"));
