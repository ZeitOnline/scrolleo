<div align="center">
  <img src="scrolleo-mascot.svg" alt="Scrolleo" width="400">
  
  # Scrolleo
  
  **A modern & lightweight Vanilla JS library for scrollytelling experiences**
  
  [![npm version](https://img.shields.io/npm/v/@zeitonline/scrolleo.svg)](https://www.npmjs.com/package/@zeitonline/scrolleo)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  
  No dependencies, no framework, pure ESM.
</div>

## About

Scrolleo is a modernization of [scrollama](https://github.com/russellsamora/scrollama) with:

- Performance improvements
- Improved TypeScript definitions
- A modern ESM-only build

## Why?

Scrollytelling can be complicated to implement and difficult to make performant. The goal of this library is to provide a simple interface for creating scroll-driven interactives. Scrolleo is focused on performance by using
[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
to handle element position detection.

## Examples

Check out the [demo gallery](demo/index.html) to see Scrolleo in action:

- **[Basic](demo/basic.html)** - Basic step enter/exit functionality
- **[Progress](demo/progress.html)** - Track scroll progress through steps with visual feedback
- **[Sticky Side](demo/sticky-side.html)** - Sticky graphic on the side with scrolling text
- **[Sticky Overlay](demo/sticky-overlay.html)** - Sticky graphic overlay pattern
- **[Percentage Offset](demo/percentage-offset.html)** - Per-step offset customization using percentages
- **[Pixel Offset](demo/pixel-offset.html)** - Fixed pixel-based offsets for mobile-friendly experiences
- **[Multiple Instances](demo/multiple.html)** - Multiple scrolleo instances on the same page
- **[Nested Scroll Container](demo/scroll-parent.html)** - Using a nested scroll container instead of window
- **[Performance Test](demo/performance-test.html)** - Performance monitoring with multiple instances

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

Create step elements in your HTML:

```html
<section id="scrolly">
	<article>
		<div class="step">
			<p>Step 1</p>
		</div>
		<div class="step">
			<p>Step 2</p>
		</div>
		<div class="step">
			<p>Step 3</p>
		</div>
	</article>
</section>
```

Then initialize Scrolleo and set up your callbacks:

```js
import scrolleo from '@zeitonline/scrolleo';

// Create a scrolleo instance
const scroller = scrolleo();

// Setup with options and attach callbacks
scroller
	.setup({
		step: '#scrolly article .step',
		offset: 0.5, // Trigger when step is 50% from top of viewport
		debug: false, // Set to true to see visual debugging
	})
	.onStepEnter((response) => {
		// Called when a step enters the offset threshold
		const { element, index, direction } = response;
		element.classList.add('is-active');
		console.log(`Step ${index} entered from ${direction}`);
	})
	.onStepExit((response) => {
		// Called when a step exits the offset threshold
		const { element, index, direction } = response;
		element.classList.remove('is-active');
		console.log(`Step ${index} exited to ${direction}`);
	});
```

The `response` object contains:
- `element`: The DOM element that triggered the callback
- `index`: The zero-based index of the step
- `direction`: Either `'up'` or `'down'` indicating scroll direction

## API

#### scrolleo.setup([options])

_options:_

| Option    | Type                                | Description                                                                                                                                                                                                                                                                                                                                           | Default   |
| --------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| step      | string or HTMLElement[]             | **required** Selector (or array of elements) for the step elements that will trigger changes.                                                                                                                                                                                                                                                         |           |
| offset    | number (0 - 1, or string with "px") | How far from the top of the viewport to trigger a step.                                                                                                                                                                                                                                                                                               | 0.5       |
| progress  | boolean                             | Whether to fire incremental step progress updates or not.                                                                                                                                                                                                                                                                                             | false     |
| threshold | number (1 or higher)                | The granularity of the progress interval in pixels (smaller = more granular).                                                                                                                                                                                                                                                                         | 4         |
| once      | boolean                             | Only trigger the step to enter once then remove listener.                                                                                                                                                                                                                                                                                             | false     |
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
