Marionette.Presenter
====================
A top-level container for view and model instantiation logic, such as the delegate for an application route or controller for a complex view component.

## Reasoning

Commonly within Backbone applications, view state is stored within data models side by side
persisted data.  For simple applications this approach works well; however, as complexity increases,
models and views can become difficult to maintain.  In these situations, keeping view state out of
both data models and views can enhance separate of concerns and improve maintainability.

`Marionette.Presenter` is a nestable presentation manager with state awareness.  It extends from
`Marionette.StateService`, which can be used on its own for greater flexibility in dealing with
view state.  Presenter is abstract enough for use as a route controller or as a nestable component
manager.  StateService is useful for whenever view state management with scalable complexity is
required, but view management isn't a requirement.

## Examples

### Simple Presenter

A basic building block of a Marionette application is a route handler, or some kind of "controller"
that performs model instantiation and view rendering.  A Presenter satisfies this use case with
presentation hooks `onBeforePresent` and `onPresent`.  A further advantage is that a Presenter is
region aware, allowing it to become the top level manager for a component.

```javascript
var FooModel = require('foo-model');
var FooView = require('foo-view');

var FooPresenter = Marionette.Presenter.extend({

  onPresent: function () {
    var foo = new FooModel();
    var view = new FooView({ model: foo });
    this.show(view);
  }
});

var fooPresenter = new FooPresenter({
  region: app.getRegion('content'),
  present: true
});
```

### Presenter with Loading View

Any application dealing with asynchronous data has to make a decision on how to deal with latency
from a user experience perspective.  A common solution is to render a "loading view" until the data
is ready.  The Presenter includes native support for such a view.

```javascript
var FooModel = require('foo-model');
var FooView = require('foo-view');
var LoadingView = require('loading-view');

var FooPresenter = Marionette.Presenter.extend({

  loadingView: LoadingView,

  onPresent: function () {
    var foo = new FooModel();
    var view = new FooView({ model: foo });
    var loading = foo.fetch();
    this.show(view, { loading: loading });
  }
});
```

### Presenter with State

When building a complex view, sometimes view state can take on a life of its own, and it is not
desirable to mix view state with data.  A Presenter provides native state management tools to
assist.

```javascript
var FooModel = require('foo-model');

var FooView = Marionette.ItemView.extend({
  
  stateEvents: {
    'change:barActive': 'onChangeBarActive'
  },

  initialize: function (options) {
    options = options || {};
    this.state = options.state;
    this.bindEntityEvents(options.state, stateEvents);
  },

  onChangeBarActive: function (state, barActive) {
    if (barActive) this.$el.addClass('bar-active');
    else this.$el.removeClass('bar-active');
  }
});

var FooPresenter = Marionette.Presenter.extend({

  defaultState: {
    barActive: false
  },

  initialize: function () {
    Backbone.Radio.once('foo-channel', 'bar:active', this.onBarActive, this);
  },

  onBarActive: function () {
    this.stateSet('barActive', true);
  },

  onPresent: function () {
    var foo = new FooModel();
    var state = this.getState();
    var view = new FooView({
      model: foo,
      state: state
    });
    this.show(view);
  }
});
```

### Presenter with State Service

If state logic within a Presenter is expanding, combining the state logic with view management
could potentially become unwieldy.  Externalizing state management into a dedicated state service
allows for greater separation of concerns.

```javascript
var FooModel = require('foo-model');
var FooView = require('foo-view');

var FooStateService = Marionette.StateService.extend({

  initialize: function () {
    Backbone.Radio.once('foo-channel', 'bar:active', this.onBarActive, this);
  },

  onBarActive: function () {
    this.stateSet('barActive', true);
  }
});

var FooPresenter = Marionette.Presenter.extend({

  defaultState: {
    barActive: false
  },

  initialize: function () {
    var stateService = new FooStateService({ bindTo: this });
    this.setState(stateService.getState());
  },

  onPresent: function () {
    var foo = new FooModel();
    var state = this.getState();
    var view = new FooView({
      model: foo,
      state: state
    });
    this.show(view);
  }
});
```

### Existing View with State Service

Often the case with a nested view inside a Layout or CollectionView, the model is already set and
the view already rendered.  If the nested view is handling or responding to enough state, it can
be handy to externalize the state logic to a service.  With state logic handled outside the view,
the view only need repond to simple state change events.

```javascript
var FooStateService = Marionette.StateService.extend({

  initialize: function () {
    Backbone.Radio.once('foo-channel', 'bar:active', this.onBarActive, this);
  },

  onBarActive: function () {
    this.stateSet('barActive', true);
  }
});

var FooView = Marionette.ItemView.extend({

  stateEvents: {
    'change:barActive': 'onChangeBarActive'
  },

  initialize: function (options) {
    var stateService = new FooStateService({ bindTo: this });
    this.state = stateService.getState();
    this.bindEntityEvents(options.state, stateEvents);
  },

  onChangeBarActive: function (state, barActive) {
    if (barActive) this.$el.addClass('bar-active');
    else this.$el.removeClass('bar-active');
  }
});
```

## Inspiration

- http://victorsavkin.com/post/49767352960/supervising-presenters
- http://www.backbonerails.com/screencasts/loading-views
- https://github.com/JideOsan
