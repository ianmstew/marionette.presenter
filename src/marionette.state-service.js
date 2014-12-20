/* exported HasState */
/* global Backbone, Marionette, _ */

var StateService = Marionette.Object.extend({

  // Optional Model class to instantiate
  stateModel: undefined,

  // Default state attributes hash overridable by constructor 'state' option
  defaultState: undefined,

  // State model instance
  state: undefined,

  // Event hash for the state model
  stateEvents: undefined,

  // Initial state attributes hash after defaults and constructor 'state' option are applied
  _initialState: undefined,

  // Whether state model was spawned internally (and should be unbound internally)
  _myState: false,

  // options {
  //   state:      {Model|attrs|true} Initial state; true will use defaults
  //   stateModel: {Model class} Model class to represent state
  // }
  constructor: function (options) {
    options = options || {};
    if (options.bindTo) this.bindTo(options.bindTo);

    // State model class is either passed in, on the class, or a standard Backbone model
    this.stateModel = options.stateModel || this.stateModel || Backbone.Model;
    if (options.state) this.setState(options.state);
    this.once('destroy', this._cleanupEvents, this);
  },

  // state: {Model|attrs} Set current state and overwrite initial state
  setState: function (state) {
    var attrs;
    this._cleanupEvents();

    if (state instanceof Backbone.Model) {
      attrs = state.attributes;
    } else {
      attrs = state;
    }

    this._initialState = _.extend({}, this.defaultState, attrs);

    // If state model is set, reset it. Otherwise, create it.
    if (this.state) {
      this.resetState();
    } else {
      this._myState = true;
      this.state = new this.stateModel(this._initialState);
    }

    this._setupEvents();
  },

  // Return state model
  getState: function () {
    if (!this.state) this.setState();
    return this.state;
  },

  // Return state to its value at instantiation time
  resetState: function () {
    this.state.set(this._initialState, { unset: true });
  },

  // Proxy to state model set()
  stateSet: function () {
    if (!this.state) throw new Error('Initialize state first');
    this.state.set.apply(this.state, arguments);
  },

  // Proxy to state model get()
  stateGet: function () {
    if (!this.state) throw new Error('Initialize state first');
    return this.state.get.apply(this.state, arguments);
  },

  // Bind lifetime to another Marionette object
  bindTo: function (mnObj) {
    if (!mnObj.destroy) throw new Error('Must provide a Marionette object for binding');
    this.listenToOnce(mnObj, 'destroy', this.destroy);
  },

  // Initialize events
  _setupEvents: function () {
    if (this.stateEvents) this.bindEntityEvents(this.state, this.stateEvents);
  },

  // Unbind events
  _cleanupEvents: function () {
    if (this.stateEvents) this.unbindEntityEvents(this.state, this.stateEvents);
    if (this.state && this._myState) this.state.stopListening();
  }
});

Marionette.StateService = StateService;
