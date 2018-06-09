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

  // The request handler must be the first middleware on the app
  app.use(Raven.requestHandler());
  app.use(Raven.errorHandler());
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

if (ravenUrl) {
  // The error handler must be before any other error middleware
  app.use(Raven.errorHandler());

  // Optional fallthrough error handler
  app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.send(
      `Sorry! Something went wrong 💥. The maintainers have been notified, but if you'd like, you can <a href="https://github.com/jpnelson/fastjs/issues/new?title=Error%20in%20production&body=error_id=%22${
        res.sentry
      }%22">raise an issue on github</a> to give more details\n`
    );
    res.end();
  });
}

app.listen(8080, () => console.log("App listening on port 8080"));
