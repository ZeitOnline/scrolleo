import { selectAll } from "./dom";
import * as bug from "./debug";
import err from "./err";
import getIndex from "./getIndex";
import parseOffset from "./parseOffset";
import indexSteps from "./indexSteps";
import getOffsetTop from "./getOffsetTop";
import generateId from "./generateId";

function scrollama() {
	let cb = {};

	let id = generateId();
	let steps = [];
	let globalOffset;
	let containerElement;
	let rootElement;

	let isEnabled = false;
	let isProgress = false;
	let isDebug = false;
	let isTriggerOnce = false;

	let exclude = [];

	// Track visible steps and local state
	let visibleIndex = [];
	let viewportObserver;
	let resizeObserver;
	let previousY = 0;
	let currentDirection = "down";

	/* HELPERS */
	function reset() {
		cb = {
			stepEnter: () => {},
			stepExit: () => {},
			stepProgress: () => {},
		};
		exclude = [];
		visibleIndex = [];
	}

	function getScrollTop() {
		return containerElement === window ? window.pageYOffset : containerElement.scrollTop
	}

	function handleEnable(shouldEnable) {
		if (shouldEnable && !isEnabled) {
			// Sync initial scroll position
			previousY = getScrollTop();
			initializeObservers();
		}
		if (!shouldEnable && isEnabled) {
			disconnectAllObservers();
			containerElement.removeEventListener("scroll", handleScroll);
		}
		isEnabled = shouldEnable;
	}

	/* NOTIFY CALLBACKS */
	function notifyProgress(element, progress) {
		const index = getIndex(element);
		const step = steps[index];
		if (progress !== undefined) step.progress = progress;
		const response = { element, index, progress, direction: currentDirection };
		if (step.state === "enter") cb.stepProgress(response);
	}

	function notifyStepEnter(element) {
		const index = getIndex(element);
		const step = steps[index];
		const response = { element, index, direction: currentDirection };

		step.state = "enter";

		if (!exclude[index]) cb.stepEnter(response);
		if (isTriggerOnce) exclude[index] = true;
	}

	function notifyStepExit(element) {
		const index = getIndex(element);
		const step = steps[index];

		if (!step.state) return false;

		const response = { element, index, direction: currentDirection };

		if (isProgress) {
			if (currentDirection === "down" && step.progress < 1)
				notifyProgress(element, 1);
			else if (currentDirection === "up" && step.progress > 0)
				notifyProgress(element, 0);
		}

		step.state = "exit";

		cb.stepExit(response);
	}

	/* OBSERVERS - HANDLING */
	function resizeStep(entries) {
		entries.forEach((entry) => {
			const index = getIndex(entry.target);
			const step = steps[index];
			const h = entry.target.offsetHeight;
			if (h !== step.height) {
				step.height = h;
			}
		});
	}

	function intersectViewport(entries) {
		const wasEmpty = visibleIndex.length === 0;
		entries.forEach((entry) => {
			const index = getIndex(entry.target);
			if (entry.isIntersecting) {
				if (!visibleIndex.includes(index)) visibleIndex.push(index);
			} else {
				visibleIndex = visibleIndex.filter((i) => i !== index);
				const step = steps[index];
				if (step.state === "enter") notifyStepExit(step.node);
			}
		});

		const isEmpty = visibleIndex.length === 0;
		if (isEnabled) {
			if (wasEmpty && !isEmpty) {
				// Steps entered the buffer: start listening to scroll
				previousY = getScrollTop();
				containerElement.addEventListener("scroll", handleScroll);
				if (isDebug) {
					console.log(`enabling scroll listener (steps in buffer: ${visibleIndex.length})`);
				}
			} else if (!wasEmpty && isEmpty) {
				// No steps in buffer: stop listening to scroll
				containerElement.removeEventListener("scroll", handleScroll);
				if (isDebug) {
					console.log(`disabling scroll listener`);
				}
			}
		}
	}

	function handleScroll() {
		if (!isEnabled) return;

		// Calculate direction locally
		const currentY = getScrollTop();
		if (currentY !== previousY) {
			currentDirection = currentY > previousY ? "down" : "up";
			previousY = currentY;
		}

		// Only check steps that are roughly in view
		visibleIndex.forEach((index) => {
			checkStep(steps[index]);
		});
	}

	function checkStep(step) {
		const { height, node, offset } = step;
		const rect = node.getBoundingClientRect();

		const h = window.innerHeight;
		const off = offset || globalOffset;
		const factor = off.format === "pixels" ? 1 : h;
		const thresholdPx = off.value * factor;

		// Check if the trigger point is within the element
		const isOver = rect.top <= thresholdPx && rect.bottom >= thresholdPx;

		if (isOver && step.state !== "enter") {
			notifyStepEnter(node);
		} else if (!isOver && step.state === "enter") {
			notifyStepExit(node);
		}

		if (isProgress && step.state === "enter") {
			const progress = Math.min(
				1,
				Math.max(0, (thresholdPx - rect.top) / height)
			);
			notifyProgress(node, progress);
		}
	}

	/*  OBSERVERS - CREATION */
	function disconnectAllObservers() {
		if (resizeObserver) resizeObserver.disconnect();
		if (viewportObserver) viewportObserver.disconnect();
	}

	function addResizeObserver() {
		resizeObserver = new ResizeObserver(resizeStep);
		steps.forEach((step) => resizeObserver.observe(step.node));
	}

	function addViewportObserver() {
		// add a buffer to ensure steps are detected before they hit the threshold
		const rootMargin = "50% 0px 50% 0px";
		const options = { rootMargin, threshold: 0, root: rootElement };
		viewportObserver = new IntersectionObserver(intersectViewport, options);

		steps.forEach((step) => viewportObserver.observe(step.node));
	}

	function initializeObservers() {
		disconnectAllObservers();
		addResizeObserver();
		addViewportObserver();
	}

	/* SETUP */
	const S = {};

	S.setup = ({
		step,
		parent,
		offset = 0.5,
		progress = false,
		once = false,
		debug = false,
		container = undefined,
		root = null,
	}) => {
		steps = selectAll(step, parent).map((node, index) => ({
			index,
			height: node.offsetHeight,
			node,
			offset: parseOffset(node.dataset.offset),
			top: getOffsetTop(node),
			progress: 0,
			state: undefined,
		}));

		if (!steps.length) {
			err("no step elements");
			return S;
		}

		isProgress = progress;
		isTriggerOnce = once;
		isDebug = debug;
		globalOffset = parseOffset(offset);
		containerElement = container || window;
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
		return S;
	};

	S.resize = () => {
		initializeObservers();
		return S;
	};

	S.offset = (x) => {
		if (x === null || x === undefined) return globalOffset.value;
		globalOffset = parseOffset(x);
		return S;
	};

	S.onStepEnter = (f) => {
		if (typeof f === "function") cb.stepEnter = f;
		else err("onStepEnter requires a function");
		return S;
	};

	S.onStepExit = (f) => {
		if (typeof f === "function") cb.stepExit = f;
		else err("onStepExit requires a function");
		return S;
	};

	S.onStepProgress = (f) => {
		if (typeof f === "function") cb.stepProgress = f;
		else err("onStepProgress requires a function");
		return S;
	};
	return S;
}

export default scrollama;
