# To get started:

```
npm i
npm start
```

# To test locally

```
npm run start
```

It's easiest to test the subdomain feature by editing your hostfile.

The method for doing this will vary by operating system. On Mac OSX, add an entry to `/etc/hosts` like this:

```
127.0.0.1       fastjs.local
```

Then, you can test the subdomain redirects by visiting `react.fastjs.local`.

# Monitoring

Set the environment variable `RAVEN_URL` to use Raven for monitoring. 