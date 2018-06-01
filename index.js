const express = require("express");
const app = express();

const request = require("request");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 });

app.get("/", (req, res) => {
  const subdomains = req.subdomains;
  if (subdomains.length === 0) {
    res.send(
      `Welcome to fastjs.link. To get started, try your-npm-package-name.fastjs.link (eg <a href="https://react.fastjs.link">react.fastjs.link</a>) . Add a homepage field to your package.json to customize!`
    );
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

          const json = JSON.parse(body);

          const homepage =
            json.homepage || `https://www.npmjs.com/package/${package}`;

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
