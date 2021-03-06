/* global define, Presenter */

(function(root, factory) {
  if (!root.Promise) {
    throw new Error('Marionette.Presenter depends on ES6 Promise at global/window.Promise');
  }

  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'marionette', 'underscore'], function(Backbone, _) {
      return factory(Backbone, Marionette, _);
    });
  }
  else if (typeof exports !== 'undefined') {
    var Backbone = require('backbone');
    var Marionette = Backbone.Marionette;
    var _ = require('underscore');
    module.exports = factory(Backbone, Marionette, _);
  }
  else {
    factory(root.Backbone, root.Backbone.Marionette, root._);
  }
}(this, function(Backbone, Marionette, _) {
  'use strict';

  // @include marionette.state-service.js
  // @include marionette.presenter.js

  return Presenter;
}));
