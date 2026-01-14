(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.scrollama = factory());
}(this, (function () { 'use strict';

  // DOM helper functions

  // public
  function selectAll(selector, parent = document) {
    if (typeof selector === 'string') {
      return Array.from(parent.querySelectorAll(selector));
    } else if (selector instanceof Element) {
      return [selector];
    } else if (selector instanceof NodeList) {
      return Array.from(selector);
    } else if (selector instanceof Array) {
      return selector;
    }
    return [];
  }

  // Module-level overlay element - single reusable overlay for all steps
  let overlayElement = null;

  // SETUP
  function create() {
  	const el = document.createElement("div");
  	el.className = "scrollama__debug-step";
  	el.style.position = "fixed";
  	el.style.left = "0";
  	el.style.width = "100%";
  	el.style.zIndex = "9999";
  	el.style.borderTop = "2px solid black";
  	el.style.borderBottom = "2px solid black";

  	const p = document.createElement("p");
  	p.style.position = "absolute";
  	p.style.left = "0";
  	p.style.height = "1px";
  	p.style.width = "100%";
  	p.style.borderTop = "1px dashed black";

  	el.appendChild(p);
  	document.body.appendChild(el);
  	return el;
  }

  // UPDATE
  function update({ id, step, marginTop }) {
  	const { height } = step;
  	
  	// Create overlay if it doesn't exist
  	if (!overlayElement) {
  		overlayElement = create();
  	}

  	// Update position and size for current step
  	overlayElement.style.top = `${marginTop * -1}px`;
  	overlayElement.style.height = `${height}px`;
  	overlayElement.querySelector("p").style.top = `${height / 2}px`;
  }

  // CLEANUP
  function cleanup() {
  	if (overlayElement) {
  		overlayElement.remove();
  		overlayElement = null;
  	}
  }

  function generateId() {
      const alphabet = "abcdefghijklmnopqrstuvwxyz";
      const date = Date.now();
      const result = [];
      for (let i = 0; i < 6; i += 1) {
        const char = alphabet[Math.floor(Math.random() * alphabet.length)];
        result.push(char);
      }
      return `${result.join("")}${date}`;
    }

  function err$1(msg) {
  	console.error(`scrollama error: ${msg}`);
  }

  // WeakMap for fast index lookups without DOM attribute reads
  const stepIndexMap = new WeakMap();

  function setIndex(node, index) {
  	stepIndexMap.set(node, index);
  }

  function getIndex(node) {
  	return stepIndexMap.get(node);
  }

  function createProgressThreshold(height, threshold) {
      const count = Math.ceil(height / threshold);
      const t = [];
      const ratio = 1 / count;
      for (let i = 0; i < count + 1; i += 1) {
        t.push(i * ratio);
      }
      return t;
    }

  function parseOffset(x) {
  	if (typeof x === "string" && x.indexOf("px") > 0) {
  		const v = +x.replace("px", "");
  		if (!isNaN(v)) return { format: "pixels", value: v };
  		else {
  			err("offset value must be in 'px' format. Fallback to 0.5.");
  			return { format: "percent", value: 0.5 };
  		}
  	} else if (typeof x === "number" || !isNaN(+x)) {
  		if (x > 1) err("offset value is greater than 1. Fallback to 1.");
  		if (x < 0) err("offset value is lower than 0. Fallback to 0.");
  		return { format: "percent", value: Math.min(Math.max(0, x), 1) };
  	}
  	return null;
  }

  function indexSteps(steps) {
  	steps.forEach((step) => setIndex(step.node, step.index));
  }

  function getOffsetTop(node) {
    const { top } = node.getBoundingClientRect();
    const scrollTop = window.pageYOffset;
    const clientTop = document.body.clientTop || 0;
    return top + scrollTop - clientTop;
  }

  // WeakMap allows the container to be garbage collected if removed from DOM
  // The state contains: scroll listener, previous scrollY, direction, and reference count
  const scrollState = new WeakMap();

  function getScrollY(container) {
  	if (container === window) return window.scrollY;
  	return container.scrollTop;
  }

  function updateScrollDirection(container) {
  	const state = scrollState.get(container);
  	if (!state) return;

  	const scrollY = getScrollY(container);
  	if (state.previousScrollY === scrollY) return;

  	if (scrollY > state.previousScrollY) state.direction = "down";
  	else if (scrollY < state.previousScrollY) state.direction = "up";
  	state.previousScrollY = scrollY;
  }

  function getDirection(container) {
  	const target = container || window;
  	const state = scrollState.get(target);
  	return state ? state.direction : "down";
  }

  function addScrollListener(container) {
  	const target = container || window;

  	if (scrollState.has(target)) {
  		const state = scrollState.get(target);
  		// reference count to manage multiple listeners on the same container
  		state.count += 1;
  		return;
  	}

  	const listener = () => updateScrollDirection(target);
  	scrollState.set(target, {
  		listener,
  		previousScrollY: getScrollY(target),
  		direction: "down",
  		count: 1,
  	});

  	target.addEventListener("scroll", listener, { passive: true });
  }

  function removeScrollListener(container) {
  	const target = container || window;

  	if (scrollState.has(target)) {
  		const state = scrollState.get(target);
  		state.count -= 1;

  		// only remove listener if no more references
  		if (state.count === 0) {
  			target.removeEventListener("scroll", state.listener);
  			scrollState.delete(target);
  		}
  	}
  }

  function scrollama() {
  	let cb = {};

  	let id = generateId();
  	let steps = [];
  	let globalOffset;
  	let containerElement;
  	let rootElement;
  	
  	let resizeObserver;
  	let progressThreshold = 0;

  	let isEnabled = false;
  	let isProgress = false;
  	let isDebug = false;
  	let isTriggerOnce = false;

  	let exclude = [];

  	// Batch progress callbacks with requestAnimationFrame
  	let pendingProgressCallbacks = new Map();
  	let rafScheduled = false;

  	// Batch resize observer updates with requestAnimationFrame
  	let resizeBatch = new Set();
  	let resizeRafScheduled = false;

  	/* HELPERS */
  	function reset() {
  		cb = {
  			stepEnter: () => { },
  			stepExit: () => { },
  			stepProgress: () => { },
  		};
  		exclude = [];
  		pendingProgressCallbacks.clear();
  		rafScheduled = false;
  		resizeBatch.clear();
  		resizeRafScheduled = false;
  	}

  	function handleEnable(shouldEnable) {
  		if (shouldEnable && !isEnabled) initializeObservers();
  		if (!shouldEnable && isEnabled) disconnectAllObservers();
  		isEnabled = shouldEnable;
  	}

  	function flushProgressCallbacks() {
  		rafScheduled = false;
  		pendingProgressCallbacks.forEach(({ element, index, progress, direction, step }) => {
  			// Update step progress value
  			step.progress = progress;
  			// Execute callback if step is in enter state
  			if (step.state === "enter") {
  				const response = { element, index, progress, direction };
  				cb.stepProgress(response);
  			}
  		});
  		pendingProgressCallbacks.clear();
  	}

  	function scheduleProgressCallback(element, progress) {
  		const index = getIndex(element);
  		const step = steps[index];
  		const currentDirection = getDirection(containerElement);
  		
  		// Store the latest progress update for this step
  		pendingProgressCallbacks.set(index, {
  			element,
  			index,
  			progress,
  			direction: currentDirection,
  			step
  		});

  		// Schedule requestAnimationFrame if not already scheduled
  		if (!rafScheduled) {
  			rafScheduled = true;
  			requestAnimationFrame(flushProgressCallbacks);
  		}
  	}

  	/* NOTIFY CALLBACKS */
  	function notifyProgress(element, progress) {
  		if (progress === undefined) return;
  		scheduleProgressCallback(element, progress);
  	}

  	function notifyStepEnter(element) {
  		const index = getIndex(element);
  		const step = steps[index];
  		const currentDirection = getDirection(containerElement);
  		const response = { element, index, direction: currentDirection };

  		step.direction = currentDirection;
  		step.state = "enter";

  		if (!exclude[index]) cb.stepEnter(response);
  		if (isTriggerOnce) exclude[index] = true;
  	}

  	function notifyStepExit(element, check = true) {
  		const index = getIndex(element);
  		const step = steps[index];

  		if (!step.state) return false;

  		const currentDirection = getDirection(containerElement);
  		const response = { element, index, direction: currentDirection };

  		if (isProgress) {
  			if (currentDirection === "down" && step.progress < 1) notifyProgress(element, 1);
  			else if (currentDirection === "up" && step.progress > 0)
  				notifyProgress(element, 0);
  		}

  		step.direction = currentDirection;
  		step.state = "exit";

  		cb.stepExit(response);
  	}

  	/* OBSERVERS - HANDLING */
  	function processResizeBatch() {
  		resizeRafScheduled = false;
  		resizeBatch.forEach((step) => {
  			disconnectStepObservers(step);
  			addStepObservers(step, isProgress);
  		});
  		resizeBatch.clear();
  	}

  	function resizeStep(entries) {
  		entries.forEach((entry) => {
  			const index = getIndex(entry.target);
  			const step = steps[index];
  			const h = entry.target.offsetHeight;
  			if (h !== step.height) {
  				step.height = h;
  				resizeBatch.add(step);
  			}
  		});

  		// Schedule batch processing if not already scheduled
  		if (resizeBatch.size > 0 && !resizeRafScheduled) {
  			resizeRafScheduled = true;
  			requestAnimationFrame(processResizeBatch);
  		}
  	}

  	function intersectStep([entry]) {		
  		const { isIntersecting, target } = entry;
  		if (isIntersecting) notifyStepEnter(target);
  		else notifyStepExit(target);
  	}

  	function intersectProgress([entry]) {
  		const index = getIndex(entry.target);
  		const step = steps[index];
  		const { isIntersecting, intersectionRatio, target } = entry;
  		if (isIntersecting && step.state === "enter")
  			notifyProgress(target, intersectionRatio);
  	}

  	/*  OBSERVERS - CREATION */
  	function disconnectStepObservers({ observers }) {
  		Object.keys(observers).map((name) => {
  			observers[name].disconnect();
  		});
  	}

  	function disconnectAllObservers() {
  		steps.forEach(disconnectStepObservers);
  		if (resizeObserver) resizeObserver.disconnect();
  	}

  	function addResizeObserver() {
  		resizeObserver = new ResizeObserver(resizeStep);
  		steps.forEach((step) => resizeObserver.observe(step.node));
  	}

  	function addStepObservers(step, isProgress) {
  		addStepIntersectionObserver(step);
  		if (isProgress) addProgressIntersectionObserver(step);
  	}

  	function addStepIntersectionObserver(step) {
  		const h = window.innerHeight;
  		const off = step.offset || globalOffset;
  		const factor = off.format === "pixels" ? 1 : h;
  		const offset = off.value * factor;
  		const marginTop = step.height / 2 - offset;
  		const marginBottom = step.height / 2 - (h - offset);
  		const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;
  		const root = rootElement;

  		const threshold = 0.5;
  		const options = { rootMargin, threshold, root };
  		const observer = new IntersectionObserver(intersectStep, options);

  		observer.observe(step.node);
  		step.observers.step = observer;

  		if (isDebug) update({ id, step, marginTop, marginBottom });
  	}

  	function addProgressIntersectionObserver(step) {
  		const h = window.innerHeight;
  		const off = step.offset || globalOffset;
  		const factor = off.format === "pixels" ? 1 : h;
  		const offset = off.value * factor;
  		const marginTop = -offset + step.height;
  		const marginBottom = offset - h;
  		const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;

  		const threshold = createProgressThreshold(step.height, progressThreshold);
  		const options = { rootMargin, threshold };
  		const observer = new IntersectionObserver(intersectProgress, options);

  		observer.observe(step.node);
  		step.observers.progress = observer;
  	}

  	function initializeObservers() {
  		disconnectAllObservers();
  		addResizeObserver();
  		steps.forEach((step) => addStepObservers(step, isProgress));
  	}

  	/* SETUP */
  	const S = {};

  	S.setup = ({
  		step,
  		parent,
  		offset = 0.5,
  		threshold = 4,
  		progress = false,
  		once = false,
  		debug = false,
  		container = undefined,
  		root = null
  	}) => {
  		addScrollListener(container);

  		// Batch layout reads to reduce layout thrashing
  		const nodes = selectAll(step, parent);
  		const layoutData = nodes.map((node) => ({
  			height: node.offsetHeight,
  			top: getOffsetTop(node),
  		}));

  		steps = nodes.map((node, index) => ({
  			index,
  			direction: undefined,
  			height: layoutData[index].height,
  			node,
  			observers: {},
  			offset: parseOffset(node.dataset.offset),
  			top: layoutData[index].top,
  			progress: 0,
  			state: undefined,
  		}));

  		if (!steps.length) {
  			err$1("no step elements");
  			return S;
  		}

  		isProgress = progress;
  		isTriggerOnce = once;
  		// Cleanup debug overlay if debug is being disabled
  		if (isDebug && !debug) {
  			cleanup();
  		}
  		isDebug = debug;
  		progressThreshold = Math.max(1, +threshold);
  		globalOffset = parseOffset(offset);
  		containerElement = container;
  		rootElement = root;

  		reset();
  		indexSteps(steps);
  		handleEnable(true);
  		return S;
  	};

  	S.enable = () => {
  		handleEnable(true);
  		return S;
  	};

  	S.disable = () => {
  		handleEnable(false);
  		return S;
  	};

  	S.destroy = () => {
  		handleEnable(false);
  		reset();
  		removeScrollListener(containerElement);
  		if (isDebug) {
  			cleanup();
  		}
  		steps = [];
  		return S;
  	};

  	S.resize = () => {
  		initializeObservers();
  		return S;
  	};

  	S.offset = (x) => {
  		if (x === null || x === undefined) return globalOffset.value;
  		globalOffset = parseOffset(x);
  		initializeObservers();
  		return S;
  	};

  	S.onStepEnter = (f) => {
  		if (typeof f === "function") cb.stepEnter = f;
  		else err$1("onStepEnter requires a function");
  		return S;
  	};

  	S.onStepExit = (f) => {
  		if (typeof f === "function") cb.stepExit = f;
  		else err$1("onStepExit requires a function");
  		return S;
  	};

  	S.onStepProgress = (f) => {
  		if (typeof f === "function") cb.stepProgress = f;
  		else err$1("onStepProgress requires a function");
  		return S;
  	};
  	return S;
  }

  return scrollama;

})));
