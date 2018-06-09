const express = require("express");
const app = express();

const request = require("request");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 });
const fs = require("fs");
const Raven = require("raven");

let ravenUrl = process.env.RAVEN_URL;
if (ravenUrl) {
  Raven.config(process.env.RAVEN_URL).install();
}

const html = fs.readFileSync("./index.html", "utf8");

app.get("/", (req, res) => {
  const subdomains = req.subdomains;
  if (subdomains.length === 0) {
    res.send(html);
    return;
  }
  if (subdomains.length === 1) {
    const package = subdomains[0];

    cache.get(package, (cacheErr, cacheData) => {
      if (!cacheErr && cacheData) {
        res.redirect(cacheData);
        return;
      }
      request(
        `https://registry.npmjs.org/${package}/latest`,
        (err, response, body) => {
          if (err) {
            res.send(500);
            return;
          }

          let homepage;
          try {
            const json = JSON.parse(body);
            homepage =
              json.homepage || `https://www.npmjs.com/package/${package}`;
          } catch (e) {
            console.error(`Error: ${e}`);
            homepage = `https://www.npmjs.com/package/${package}`;
          }

          cache.set(package, homepage, () => {
            res.redirect(homepage);
            return;
          });
        }
      );
    });
  } else {
    res.sendStatus(404);
    return;
  }
});

app.listen(8080, () => console.log("App listening on port 8080"));
