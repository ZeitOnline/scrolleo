let previousScrollY;
let direction;

function updateScrollDirection(container) {
	const scrollTop = container ? container.scrollTop : window.pageYOffset;
	if (previousScrollY === scrollTop) return;
	
	if (scrollTop > previousScrollY) direction = "down";
	else if (scrollTop < previousScrollY) direction = "up";
	previousScrollY = scrollTop;
}

function setupScrollListener(container) {
	previousScrollY = 0;
	document.addEventListener("scroll", () => updateScrollDirection(container), { passive: true });
}

export { setupScrollListener, updateScrollDirection, direction };
