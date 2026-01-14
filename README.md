# Scrolleo

**Scrolleo** is a modern & lightweight JavaScript library for scrollytelling
using IntersectionObserver.

## About

Scrolleo is a modernization of [scrollama](https://github.com/russellsamora/scrollama) by [Russell Samora](https://github.com/russellsamora) with:
- Several performance improvements
- Modern ESM-only build using Vite
- Improved TypeScript definitions
- Updated build tooling and development workflow

## Why?

Scrollytelling can be complicated to implement and difficult to make performant. The goal of this library is to provide a simple interface for creating scroll-driven interactives. Scrolleo is focused on performance by using
[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
to handle element position detection.

## Examples

TODO


## Installation

```sh
npm install @zeitonline/scrolleo
```

And then import it:

```js
import scrolleo from '@zeitonline/scrolleo';
```

## How to use

#### Basic

TODO

```html
<div class="step"></div>
<div class="step"></div>
<div class="step"></div>
```

```js
// instantiate scrolleo
import scrolleo from '@zeitonline/scrolleo';

const scroller = scrolleo();

// setup the instance, pass callback functions
scroller
	.setup({
		step: '.step',
	})
	.onStepEnter((response) => {
		// const { element, index, direction } = response;
	})
	.onStepExit((response) => {
		// const { element, index, direction } = response;
	});
```

## API

#### scrolleo.setup([options])

_options:_

| Option    | Type                                | Description                                                                                                                                                                                                                                                                                                                                           | Default   |
| --------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --- |
| step      | string or HTMLElement[]             | **required** Selector (or array of elements) for the step elements that will trigger changes.                                                                                                                                                                                                                                                         |
| offset    | number (0 - 1, or string with "px") | How far from the top of the viewport to trigger a step.                                                                                                                                                                                                                                                                                               | 0.5       |
| progress  | boolean                             | Whether to fire incremental step progress updates or not.                                                                                                                                                                                                                                                                                             | false     |
| threshold | number (1 or higher)                | The granularity of the progress interval in pixels (smaller = more granular).                                                                                                                                                                                                                                                                         | 4         |
| once      | boolean                             | Only trigger the step to enter once then remove listener.                                                                                                                                                                                                                                                                                             | false     |     |
| debug     | boolean                             | Whether to show visual debugging tools or not.                                                                                                                                                                                                                                                                                                        | false     |
| parent    | HTMLElement[]                       | Parent element for step selector (use if you steps are in shadow DOM).                                                                                                                                                                                                                                                                                | undefined |
| container | HTMLElement                         | Parent element for the scroll story (use if scrollama is nested in a HTML element with overflow set to `scroll` or `auto`)                                                                                                                                                                                                                            | undefined |
| root      | HTMLElement                         | The element that is used as the viewport for checking visibility of the target. Must be the ancestor of the target. Defaults to the browser viewport if not specified or if null. See more details about usage of root on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#intersection_observer_concepts_and_usage). | undefined |

#### scrolleo.onStepEnter(callback)

Callback that fires when the top or bottom edge of a step element enters the
offset threshold.

The argument of the callback is an object: `{ element: DOMElement, index: number, direction: string }`

`element`: The step element that triggered

`index`: The index of the step of all steps

`direction`: 'up' or 'down'

#### scrolleo.onStepExit(callback)

Callback that fires when the top or bottom edge of a step element exits the
offset threshold.

The argument of the callback is an object: `{ element: DOMElement, index: number, direction: string }`

`element`: The step element that triggered

`index`: The index of the step of all steps

`direction`: 'up' or 'down'

#### scrolleo.onStepProgress(callback)

Callback that fires the progress (0 - 1) a step has made through the threshold.

The argument of the callback is an object: `{ element: DOMElement, index: number, progress: number }`

`element`: The step element that triggered

`index`: The index of the step of all steps

`progress`: The percent of completion of the step (0 - 1)

`direction`: 'up' or 'down'

#### scrolleo.offset([number or string])

Get or set the offset percentage. Value must be between 0-1 (where 0 = top of viewport, 1 = bottom), or a string that includes "px" (e.g., "200px"). If set, returns the scrolleo instance.

#### scrolleo.resize()

**This is no longer necessary with the addition of a built-in resize observer**. Tell scrolleo to get latest dimensions the browser/DOM. It is best practice to
throttle resize in your code, update the DOM elements, then call this function
at the end.

#### scrolleo.enable()

Tell scrolleo to resume observing for trigger changes. Only necessary to call
if you have previously disabled.

#### scrolleo.disable()

Tell scrolleo to stop observing for trigger changes.

#### scrolleo.destroy()

Removes all observers and callback functions.

#### custom offset

To override the offset passed in the options, set a custom offset for an individual element using data attributes. For example: `<div class="step" data-offset="0.25">` or `data-offset="100px"`.



## Alternatives

- [scrollama](https://github.com/russellsamora/scrollama) (the original library)
- [Scroll Trigger](https://greensock.com/scrolltrigger/)
- [Waypoints](http://imakewebthings.com/waypoints/)
- [ScrollMagic](http://scrollmagic.io/)
- [graph-scroll.js](https://1wheel.github.io/graph-scroll/)
- [ScrollStory](https://sjwilliams.github.io/scrollstory/)
- [enter-view](https://github.com/russellsamora/enter-view)

## Credits

This project is a modernization and rebrand of [scrollama](https://github.com/russellsamora/scrollama) by [Russell Samora](https://github.com/russellsamora). 

Original scrollama is licensed under the MIT License. This version maintains the same license and includes the original copyright notice. Scrolleo is maintained by [DIE ZEIT / ZeitOnline](https://github.com/ZeitOnline).

## License

MIT License - see [LICENSE](LICENSE) file for details.
