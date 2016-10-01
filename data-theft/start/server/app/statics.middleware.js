'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');

var rootPath = path.join(__dirname, '..', '..');

var publicPath = path.join(rootPath, 'public');
var nodePath = path.join(rootPath, 'node_modules');
var browserPath = path.join(rootPath, 'browser');

router.use(express.static(publicPath));

router.use('/node_modules', express.static(nodePath));
router.use('/browser', express.static(browserPath));

module.exports = router;
