/* global Marionette, _, HasState */

/*
 * A Presenter's purpose is to provide nestable presentation and data logic for views with built
 * in support for loading views and view state.
 *
 * Inspiration:
 *   - http://victorsavkin.com/post/49767352960/supervising-presenters.
 *   - http://www.backbonerails.com/screencasts/loading-views
 */
var Presenter = Marionette.Object.extend({

  region: undefined,
  view: undefined,
  loadingView: undefined,

  constructor: function (options) {
    options = options || {};

    // Bind to a region
    if (options.region) {
      this.region = options.region;
      this.bindTo(this.region);
    }

    // Bind to a view
    if (options.view) {
      this.view = options.view;
      this.bindTo(this.view);
    }

    Presenter.__super__.constructor.apply(this, arguments);
    this.initializeState();

    // Present immediately initialize unless told otherwise
    if (options.present !== false) this.present(options);
  },

  // Hooks for presentation logic
  present: function (options) {
    this.triggerMethod('before:present', options);
    this.triggerMethod('present', options);
  },

  // options: {
  //   loading:     {Promise|array of Promise}
  //                  - If array, loading view will render until all entities are synced.
  //                  - Otherwise if truthy, loading view will render until view's
  //                    entity/entities are synced.
  //   loadingView: {Marionette.View} A view to render while loading
  //   bindToView:  {boolean} Whether to bind lifecycle to view (default true)
  // }
  show: function (view, options) {      
    options = options || {};
    if (!this.region) throw new Error('No region defined');

    if (options.bindToView !== false) this.bindTo(view);

    if (options.loading) {
      this._showLoading(view, options);
    } else {
      // Show into region directly
      this.triggerMethod('before:show', view, options);
      this.region.show(view, options);
      this.triggerMethod('show', view, options);
    }
  },

  // Bind lifetime to another Marionette object
  bindTo: function (obj) {
    this.listenTo(obj, 'destroy', this.destroy);
  },

  getRegion: function () {
    return this.region;
  },

  getView: function () {
    return this.view;
  },

  _showLoading: function (view, options) {
    options = options || {};
    var LoadingView = options.loadingView || this.loadingView;
    var loadingView = new LoadingView();
    var promises = _.isArray(options.loading) ? options.loading : [options.loading];
    var loaded = false;

    // When entities are ready, show original view
    var onLoaded = this._loaded.bind(this, loadingView, options);

    Promise.all(promises)
      .then(function () {
        loaded = true;
        onLoaded();
      })
      .catch(function onError(error) {
        onLoaded();
        setTimeout(function () {
          throw error;
        }, 0);
        throw error;
      });

    // Show loading view if not already loaded. This works because resolved promises trigger their
    // handlers immediately, per spec, to prevent race conditions.
    if (!loaded) {
      this.triggerMethod('before:show:loading', loadingView, options);
      this.region.show(loadingView, options);
      this.triggerMethod('show:loading', loadingView, options);
    }
  },

  _loaded: function (loadingView, options) {
    var showOpts;
    if (this.region.currentView !== loadingView || this.getRegion().isDestroyed) {
      // The region contains an external view shown during loading, superceding the bound view;
      // destroy the bound view and, by side effect, this Presenter. This is usually caused
      // when the user navigates to a different view during loading.
      this.view.destroy();
    } else {
      // The loading view still showing and the entities are synced is back; swap out the
      // loading view for the bound view. bindToView is false because if view was bound,
      // it was bound on the initial call to show().
      showOpts = _.extend({}, options, {
        loading: false,
        bindToView: false
      });
      this.show(this.view, showOpts);
    }
  }
});

_.extend(Presenter.prototype, HasState);

Marionette.Presenter = Presenter;
