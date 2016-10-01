# auther

Ensure that `postgres` is running (e.g. by trying to start a `psql` shell).

Run `npm install`, then `npm run seed` to seed the database with fake data.

Finally, fire it up with `npm start` and go to http://127.0.0.1:8080/.

# Uncovering Application Secrets

In this round of the workshop, attackers attempt to uncover application secrets and defenders attempt to lock away those same secrets. It is inspired by OWASP's [security misconfiguration vulnerability](https://www.owasp.org/index.php/Top_10_2013-A5-Security_Misconfiguration). Below are "solutions" for attack and defense scenarios.

## Attack

The following are sensitive application secrets:

- session secret
- Google client secret
- GitHub client secret
- Twitter consumer secret
- postgres database URI

To discover them, you could attempt:

- Look through their current codebase for secrets.
- Look through their commit history for secrets.
- Make raw `GET` requests for static files, e.g. `GET /secrets.json`.

(If you're wondering what an attacker could do with application secrets, [follow this link](http://stackoverflow.com/a/7132392/1470694).)

## Defend

For the solution implemented here, we throw the secrets into a single configuration file, `/secrets.json`, and add that file to the gitignores. We should then change ALL of the secrets, so that the secrets that are *still in our git commit history* become invalid.

More importantly, we alter the static file serving so that it does not simply share all of the files in the project. Of course we must still serve up any files the client needs. So we replace something like:

```
router.use(express.static(rootPath));
```

With something like:

```
router.use('/node_modules', express.static(bowerPath));
router.use('/browser', express.static(browserPath));
```
