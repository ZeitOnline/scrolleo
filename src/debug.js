// Module-level overlay element - single reusable overlay for all steps
let overlayElement = null;

// SETUP
function create() {
	const el = document.createElement('div');
	el.className = 'scrollama__debug-step';
	el.style.position = 'fixed';
	el.style.left = '0';
	el.style.width = '100%';
	el.style.zIndex = '9999';
	el.style.borderTop = '2px solid black';
	el.style.borderBottom = '2px solid black';

	const p = document.createElement('p');
	p.style.position = 'absolute';
	p.style.left = '0';
	p.style.height = '1px';
	p.style.width = '100%';
	p.style.borderTop = '1px dashed black';

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
	overlayElement.querySelector('p').style.top = `${height / 2}px`;
}

// CLEANUP
function cleanup() {
	if (overlayElement) {
		overlayElement.remove();
		overlayElement = null;
	}
}

export { update, cleanup };
