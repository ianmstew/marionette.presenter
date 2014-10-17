Marionette.Presenter
====================

## Region-aware container for presentation logic

The nuclear presentation unit of a Marionette component (composition of views backed by data) is simple: a model wired to a view that is subsequently rendered into a region.  This unit is the basic building block for each component of an Marionette application.

As soon as the data needs for a component expand beyond a single model or its view architecture requires multiple levels of nesting, traditional methods for coordinating presentation units are challenged to maintain the Single Responsibility Principle.

An ideal component is both decoupled and reusable, so its dependencies should be resolved over a messaging bus or injected from without, including the desination region.  The key to a reusable, encapsulated Marionette component is the ability to pass in options and render into any region.

Marionette.Presenter is a lightweight, automatically-disposed container for presentation logic that facilitates view-model orchestration.  In addition, it offers an absolutely essential feature to manage complex view hierarchies: the ability to compose (nest) view logic alongside the corresponding views, thereby protecting the Single Responsibility Principle.

By encasulating model, view, and presentation logic, Marionette.Presenter becomes itself a decopuled, reusable, nestable component.  By binding its lifecycle to its primary view, there is no need for cleanup; all memory is freed the instant its view is removed from the DOM.

In this example, a view with two levels of nesting depends on two different models.  The first approach to managing this is to use a single "controller".

```javascript

```