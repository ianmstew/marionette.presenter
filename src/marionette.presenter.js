/* global Marionette, _ */

/*
 * A Presenter's purpose is to provide nestable presentation and data logic for views with built
 * in support for loading views and view state.
 */
var Presenter = Marionette.StateService.extend({

  // Default loading view class
  loadingView: undefined,

  // Region leveraged by show()
  region: undefined,

  // Bound view
  view: undefined,

  // options {
  //   region:  {Marionette.Region} The target region for show() (lifetime bound)
  //   view:    {Marionette.View} An already instantiated view (lifetime bound)
  //   bindTo:  {Marionette.Object} An arbitrary object for lifetime binding
  //   present: {boolean} Whether to present on initialize (default false)
  // }
  constructor: function (options) {
    options = options || {};
    // Bind to an injected region and/or view
    if (options.region) this.setRegion(options.region);
    if (options.view) this.setView(options.view);

    Presenter.__super__.constructor.apply(this, arguments);

    // Present immediately on initialize if specified
    if (options.present) this.present(options);
  },

  // Hooks for presentation logic
  // onPresent() should be idempotent, because this may be called more than once (not only at
  // initialization time).
  // options {
  //   region: {Region} The target region for show()
  //   view:   {View} An already instantiated view to bind to
  // }
  present: function (options) {
    options = options || {};
    if (this.isDestroyed) throw new Error('Presenter has already been destroyed');
    // Bind to an injected region and/or view
    if (options.region) this.setRegion(options.region);
    if (options.view) this.setView(options.view);
    this.triggerMethod('before:present', options);
    this.triggerMethod('present', options);
  },

  // options: {
  //   loading:     {Promise|array of Promise}
  //                  - If array, loading view will render until all entities are synced.
  //                  - Otherwise if truthy, loading view will render until view's
  //                    entity/entities are synced.
  //   loadingView: {Marionette.View} A view to render while loading
  //   bindToView:  {boolean} Whether to bind lifecycle to view (default true})
  // }
  show: function (view, options) {      
    options = options || {};
    if (this.isDestroyed) throw new Error('Presenter has already been destroyed');
    if (!this.region) throw new Error('No region defined');

    if (options.bindToView !== false) this.setView(view);

    if (options.loading) {
      this._showLoading(view, options);
    } else {
      // Show into region directly
      this.triggerMethod('before:show', view, options);
      this.region.show(view, options);
      this.triggerMethod('show', view, options);
    }
  },

  setRegion: function (region) {
    this.region = region;
    this.bindTo(region);
  },

  setView: function (view) {
    this.view = view;
    this.bindTo(view);
  },

  getRegion: function () {
    return this.region;
  },

  getView: function () {
    return this.view;
  },

  // Render loading view if loading is in progress, then swap out for the original view
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
        // Documented workaround ES6 promises to bubble error to window
        setTimeout(function () {
          throw error;
        }, 0);
        throw error;
      });

    // Show loading view if not already loaded.
    // This works because resolved promises trigger their handlers immediately, per spec,
    // to prevent race conditions.
    if (!loaded) {
      this.triggerMethod('before:show:loading', loadingView, options);
      this.region.show(loadingView, options);
      this.triggerMethod('show:loading', loadingView, options);
    }
  },

  // Show the original view, unless it has been superceded by another (usually caused by a user
  // navigating during loading).
  _loaded: function (loadingView, options) {
    var showOpts;
    if (this.region.currentView !== loadingView || this.getRegion().isDestroyed) {
      // The original view has been superceded; destroy it.
      this.view.destroy();
    } else {
      // Replace loading view with original view
      showOpts = _.extend({}, options, {
        loading: false,
        bindToView: false
      });
      this.show(this.view, showOpts);
    }
  }
});

Marionette.Presenter = Presenter;
