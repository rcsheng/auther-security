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

---

# Improper Access

In this round of the workshop, attackers attempt to find a hole in the access control of the defenders' application. See OWASP's [article on missing access control](https://www.owasp.org/index.php/Top_10_2013-A7-Missing_Function_Level_Access_Control) for more. Below are "solutions" for attack and defense scenarios.

## Attack

The table below details every available API action, and also outlines which types of agents (guest, user, or admin) should be able to perform those actions. A successful attack would demonstrate either that access control is missing or overly restrictive.

|ACTION                 |guest |user |admin |
|-----------------------|------|-----|------|
|get one story          |o     |o    |o     |
|get all stories        |o     |o    |o     |
|get one user           |o     |o    |o     |
|get all users          |x     |o    |o     |
|create own story       |x     |o    |o     |
|update own story       |x     |o    |o     |
|delete own story       |x     |o    |o     |
|change story's author  |x     |x    |o     |
|create other's story   |x     |x    |o     |
|update other's story   |x     |x    |o     |
|delete other's story   |x     |x    |o     |
|create a user          |x     |x    |o     |
|update self            |x     |o    |o     |
|update other           |x     |x    |o     |
|delete self            |x     |o    |o     |
|delete other           |x     |x    |o     |
|set other's privileges |x     |x    |o     |
|set own privileges     |x     |x    |x     |

## Defense

The solution provided in this repo involves "gatekeeper" middleware. For example, `Auth.assertAdmin` is a middleware that will invoke `next()` if the requesting user is an admin, but otherwise will pass along a 403 (Forbidden) error.

We use this middleware to protect certain routes. For example, the following ensures that only admins can create users:

```
router.post('/', Auth.assertAdmin, function (req, res, next) {
  User.create(req.body)
  .then(function (user) {
    res.status(201).json(user);
  })
  .then(null, next);
});
```

Additionally, for cases where certain fields are not settable, we `delete` them from `req.body`.
