/**
 * Debug Toggle Utility
 * Provides functionality to toggle scrollama debug overlay via URL param or UI button
 */

function createDebugToggle(scroller, setupOptions, eventHandlers) {
	// Check URL for debug parameter
	const urlParams = new URLSearchParams(window.location.search);
	const debugFromUrl = urlParams.has('debug');

	// Create toggle button
	const toggleButton = document.createElement('button');
	toggleButton.className = 'debug-toggle';
	toggleButton.textContent = 'Debug: OFF';
	toggleButton.setAttribute('aria-label', 'Toggle debug overlay');
	document.body.appendChild(toggleButton);

	let isDebugEnabled = debugFromUrl;

	// Update button state
	function updateButtonState() {
		if (isDebugEnabled) {
			toggleButton.textContent = 'Debug: ON';
			toggleButton.classList.add('active');
		} else {
			toggleButton.textContent = 'Debug: OFF';
			toggleButton.classList.remove('active');
		}
	}

	// Re-setup scrollama with current handlers
	function reSetupWithHandlers(debugValue) {
		const newOptions = { ...setupOptions, debug: debugValue };
		scroller.setup(newOptions);
		
		// Re-attach event handlers if they were provided
		if (eventHandlers) {
			if (eventHandlers.onStepEnter) {
				scroller.onStepEnter(eventHandlers.onStepEnter);
			}
			if (eventHandlers.onStepExit) {
				scroller.onStepExit(eventHandlers.onStepExit);
			}
			if (eventHandlers.onStepProgress) {
				scroller.onStepProgress(eventHandlers.onStepProgress);
			}
		}
		
		// Re-initialize observers to apply debug changes
		scroller.resize();
	}

	// Toggle debug mode
	function toggleDebug() {
		isDebugEnabled = !isDebugEnabled;

		// Update URL
		const newUrl = new URL(window.location.href);
		if (isDebugEnabled) {
			newUrl.searchParams.set('debug', '');
		} else {
			newUrl.searchParams.delete('debug');
		}
		window.history.pushState({}, '', newUrl);

		// Re-setup with handlers preserved
		reSetupWithHandlers(isDebugEnabled);

		updateButtonState();
	}

	// Initialize with URL param state
	if (debugFromUrl) {
		reSetupWithHandlers(true);
	}

	updateButtonState();

	// Add click handler
	toggleButton.addEventListener('click', toggleDebug);

	return {
		toggle: toggleDebug,
		isEnabled: () => isDebugEnabled,
		button: toggleButton
	};
}
