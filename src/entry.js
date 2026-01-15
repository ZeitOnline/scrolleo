import { selectAll } from './dom';
import * as bug from './debug';
import generateId from './generateId';
import err from './err';
import getIndex, { setIndex } from './getIndex';
import createProgressThreshold from './createProgressThreshold';
import parseOffset from './parseOffset';
import indexSteps from './indexSteps';
import getOffsetTop from './getOffsetTop';
import {
	addScrollListener,
	getDirection,
	removeScrollListener,
} from './scroll';

function scrolleo() {
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
			stepEnter: () => {},
			stepExit: () => {},
			stepProgress: () => {},
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
		pendingProgressCallbacks.forEach(
			({ element, index, progress, direction, step }) => {
				// Update step progress value
				step.progress = progress;
				// Execute callback if step is in enter state
				if (step.state === 'enter') {
					const response = { element, index, progress, direction };
					cb.stepProgress(response);
				}
			}
		);
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
			step,
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
		step.state = 'enter';

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
			if (currentDirection === 'down' && step.progress < 1)
				notifyProgress(element, 1);
			else if (currentDirection === 'up' && step.progress > 0)
				notifyProgress(element, 0);
		}

		step.direction = currentDirection;
		step.state = 'exit';

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
		if (isIntersecting && step.state === 'enter')
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
		const factor = off.format === 'pixels' ? 1 : h;
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

		if (isDebug) bug.update({ id, step, marginTop, marginBottom });
	}

	function addProgressIntersectionObserver(step) {
		const h = window.innerHeight;
		const off = step.offset || globalOffset;
		const factor = off.format === 'pixels' ? 1 : h;
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
		root = null,
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
			err('no step elements');
			return S;
		}

		isProgress = progress;
		isTriggerOnce = once;
		// Cleanup debug overlay if debug is being disabled
		if (isDebug && !debug) {
			bug.cleanup();
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
			bug.cleanup();
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
		if (typeof f === 'function') cb.stepEnter = f;
		else err('onStepEnter requires a function');
		return S;
	};

	S.onStepExit = (f) => {
		if (typeof f === 'function') cb.stepExit = f;
		else err('onStepExit requires a function');
		return S;
	};

	S.onStepProgress = (f) => {
		if (typeof f === 'function') cb.stepProgress = f;
		else err('onStepProgress requires a function');
		return S;
	};
	return S;
}

export default scrolleo;
