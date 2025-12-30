let direction = "down";

// WeakMap allows the container to be garbage collected if removed from DOM
// The state contains: scroll listener, previous scrollY, and reference count
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

	if (scrollY > state.previousScrollY) direction = "down";
	else if (scrollY < state.previousScrollY) direction = "up";
	state.previousScrollY = scrollY;
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

export { addScrollListener, removeScrollListener, direction };
