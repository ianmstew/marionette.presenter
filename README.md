Marionette.Presenter
====================

Commonly within Backbone applications, view state is stored within data models side by side
persisted data.  This data is commonly managed from views themselves.  For simple applications
this approach works well; however, as complexity increases, models and views can become difficult
to maintain.  In these situations, keeping view state out of both data models and views can
enhance separate of concerns and improve maintainability.

Marionette.Presenter is a smart, nestable presentation manager.  It extends from Marionette.
StateService, which can be used on its own for greater flexibility in dealing with view state.
Presenter is abstract enough for use as a route controller or as a nestable component manager.
StateService is useful for whenever view state management with scalable complexity is required,
but view management isn't a requirement.

These principles loosely follow the ideas set forth in Victor Savkin's blog post, [Supervising
Presenters](http://victorsavkin.com/post/49767352960/supervising-presenters).

## Examples

### Simple Presenter

```javascript

```

### Presenter with State

```javascript

```

### Presenter with State Service

```javascript

```

### Existing View with State Service

```javascript

```

## Inspiration

- http://victorsavkin.com/post/49767352960/supervising-presenters
- http://www.backbonerails.com/screencasts/loading-views
- https://github.com/JideOsan