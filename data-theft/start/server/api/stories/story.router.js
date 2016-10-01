'use strict';

var router = require('express').Router();

var HttpError = require('../../utils/HttpError');
var Story = require('./story.model');
var User = require('../users/user.model')
var Auth = require('../../utils/auth.middleware');

router.param('id', function (req, res, next, id) {
  Story.findById(id)
  .then(function (story) {
    if (!story) throw HttpError(404);
    req.story = story;
    next();
  })
  .catch(next);
});

router.get('/', function (req, res, next) {
  Story.findAll({
    include: [{model: User, as: 'author'}],
    attributes: {exclude: ['paragraphs']}
  })
  .then(function (stories) {
    res.json(stories);
  })
  .catch(next);
});

router.post('/', Auth.assert(function (req) {
  return Auth.isAdmin(req) || (req.user && req.user.id == req.body.author_id);
}), function (req, res, next) {
  Story.create(req.body)
  .then(function (story) {
    return story.reload({include: [{model: User, as: 'author'}]});
  })
  .then(function (includingAuthor) {
    res.status(201).json(includingAuthor);
  })
  .catch(next);
});

router.get('/:id', function (req, res, next) {
  req.story.reload({include: [{model: User, as: 'author'}]})
  .then(function (story) {
    res.json(story);
  })
  .catch(next);
});

router.put('/:id', Auth.assertAdminOrAuthor, function (req, res, next) {
  if (!Auth.isAdmin(req)) delete req.body.author_id;
  req.story.update(req.body)
  .then(function (story) {
    res.json(story);
  })
  .catch(next);
});

router.delete('/:id', Auth.assertAdminOrAuthor, function (req, res, next) {
  req.story.destroy()
  .then(function () {
    res.status(204).end();
  })
  .catch(next);
});

module.exports = router;
