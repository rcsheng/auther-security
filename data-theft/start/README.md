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

---

# Injection

In this round of the workshop, attackers attempt to execute arbitrary JavaScript code on the server, and defenders protect against such code execution. See OWASP's [article on injection](https://www.owasp.org/index.php/Top_10_2013-A1-Injection) for more. Below are "solutions" for attack and defense scenarios.

## Attack

In the command line:

```bash
curl TARGET_IP_ADDRESS_HERE:8080 --request POST --data 'console.log("whoops")' --header 'Content-Type: application/json'
```

## Defend

This vulnerability ultimately extends from using `eval` to parse incoming body strings into a `body` object. A simple solution would be to replace `eval` with `JSON.parse`.

The solution here, though, replaces our custom body parsing with that of the `body-parser` library. Though not strictly necessary *simply* to avoid the injection, this approach has the advantage of abstracting out the body parsing logic altogether, thus making our application more modular and robust in general.

---

# Cross-site Scripting

In this round of the workshop, attackers attempt to execute arbitrary JavaScript code on *other clients*, and defenders protect against such code execution. See OWASP's [article on cross-site scripting](https://www.owasp.org/index.php/Top_10_2013-A3-Cross-Site_Scripting_(XSS)) for more. Below are "solutions" for attack and defense scenarios.

## Attack

Go to the website and head to the signup page. Enter your email as `<script>alert('whoops');</script>` and choose any password. If the attack succeeds, any client viewing that user's page, or all users, should receive that alert.

You can acheive a similar result for a story's title or body, though with slightly more trouble. Login or signup as some user and then create a story. Visit that story's state. Now open the console and do something like:

```js
var story = angular.element('[contenteditable]').scope().story;
story.paragraphs.push('<script>alert("oopsy");</script>');
story.save();
```

Again, if the attack succeeds, any client viewing that story should receive that alert.

For a reflected XSS attack, form a url like:

```
http://TARGET_IP_ADDRESS:8080/notavliadroute?x=%3Cscript%3Ealert%28%27dang,%20this%20is%20not%20good%27%29;%3C/script%3E
```

Anybody who visits that url using a browser that does not protect against reflected XSS (e.g. Firefox) should see that alert pop up.

## Defense

There are two vulnerabilities.

One stems from our `contenteditable` directive and its overly enthusiastic rendering of arbitrary html. One way to solve this is to "sanitize" our contenteditable stuff using `ngSanitize`. Go through installing it and setting it up (refer [here](https://docs.angularjs.org/api/ngSanitize) for more guidance). Now inject `$sanitize` into our `contenteditable` directive and then use it to sanitize whatever we throw into `element.html()`.

The other vulnerabiliy comes from the server sending parts of the request in error responses. Sometimes less is more—in this solution, we omit *any and all* response data in our error response html.
