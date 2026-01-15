declare function scrolleo(): scrolleo.ScrolleoInstance;

export default scrolleo;

declare namespace scrolleo {
	export type ScrolleoOptions = {
		step: NodeList | HTMLElement[] | string;
		parent?: HTMLElement | string;
		offset?: number | string;
		threshold?: number;
		progress?: boolean;
		once?: boolean;
		debug?: boolean;
		container?: HTMLElement;
		root?: HTMLElement | null;
	};

	export type ScrolleoProgressCallbackResponse = {
		element: HTMLElement;
		index: number;
		progress: number;
		direction: 'up' | 'down';
	};

	export type ScrolleoCallbackResponse = {
		element: HTMLElement;
		index: number;
		direction: 'up' | 'down';
	};

	export type ScrolleoStepCallback = (
		response: ScrolleoCallbackResponse
	) => void;
	export type ScrolleoStepProgressCallback = (
		response: ScrolleoProgressCallbackResponse
	) => void;

	export type ScrolleoInstance = {
		setup: (options: ScrolleoOptions) => ScrolleoInstance;
		onStepEnter: (callback: ScrolleoStepCallback) => ScrolleoInstance;
		onStepExit: (callback: ScrolleoStepCallback) => ScrolleoInstance;
		onStepProgress: (
			callback: ScrolleoStepProgressCallback
		) => ScrolleoInstance;
		resize: () => ScrolleoInstance;
		enable: () => ScrolleoInstance;
		disable: () => ScrolleoInstance;
		destroy: () => ScrolleoInstance;
		offset: (value?: number | string | null) => ScrolleoInstance | number;
	};

	// Backward compatibility aliases
	export type ScrollamaOptions = ScrolleoOptions;
	export type ScrollamaInstance = ScrolleoInstance;
	export type ProgressCallbackResponse = ScrolleoProgressCallbackResponse;
	export type CallbackResponse = ScrolleoCallbackResponse;
	export type StepCallback = ScrolleoStepCallback;
	export type StepProgressCallback = ScrolleoStepProgressCallback;
}
