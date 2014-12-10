/* exported HasState */
/* global Backbone, _ */

// Mixes in state awareness to a Marionette object.
// State model is instantiated lazily to permit optional usage without performance penality of
// unused models.
var HasState = {

  // Optional Model class to instantiate
  stateModel: undefined,

  // Default state attributes hash overridable by constructor 'state' option
  defaultState: undefined,

  // State model instance
  _state: undefined,

  // Initial state attributes hash after defaults and constructor 'state' option are applied
  _initialState: undefined,

  // options {
  //   state:      {Model|attrs} Initial state
  //   stateModel: {Model class} Model class to represent state
  // }
  initializeState: function (options) {
    options = options || {};
    this.stateModel = options.stateModel || this.stateModel || Backbone.Model;
    this.setState(options.state);
    if (this.stateEvents) this.bindEntityEvents(this._state, this.stateEvents);
    this.on('destroy', this._onDestroy, this);
  },

  setState: function (state) {
    // Capture initial state, if any.  If state model instance is passed, save it.
    if (state && state instanceof Backbone.Model) {
      this._state = state;
      this._initialState = _.clone(this._state.attributes);
    } else {
      this._initialState = _.defaults({}, state, this.defaultState);
    }
    if (this.state) this.resetState();
  },

  getState: function () {
    this._ensureState();
    return this._state;
  },

  stateSet: function () {
    this._ensureState();
    return this._state.set.apply(this._state, arguments);
  },

  stateGet: function () {
    this._ensureState();
    return this._state.get.apply(this._state, arguments);
  },

  resetState: function () {
    this._ensureState();
    this._state.set(this._initialState, { unset: true });
  },

  _ensureState: function () {
    this._state = new this.stateModel(this._initialState);
  },

  _onDestroy: function () {
    if (this.stateEvents) this.unbindEntityEvents(this._state, this.stateEvents);
    this._state.stopListening();
  }
};
