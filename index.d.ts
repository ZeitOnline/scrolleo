export = scrollama;
declare function scrollama(): scrollama.ScrollamaInstance;

declare namespace scrollama {

  export type ScrollamaOptions = {
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

  export type ProgressCallbackResponse = {
    element: HTMLElement;
    index: number;
    progress: number;
    direction: "up" | "down";
  };

  export type CallbackResponse = {
    element: HTMLElement;
    index: number;
    direction: "up" | "down";
  };

  export type StepCallback = (response: CallbackResponse) => void;
  export type StepProgressCallback = (
    response: ProgressCallbackResponse
  ) => void;

  export type ScrollamaInstance = {
    setup: (options: ScrollamaOptions) => ScrollamaInstance;
    onStepEnter: (callback: StepCallback) => ScrollamaInstance;
    onStepExit: (callback: StepCallback) => ScrollamaInstance;
    onStepProgress: (callback: StepProgressCallback) => ScrollamaInstance;
    resize: () => ScrollamaInstance;
    enable: () => ScrollamaInstance;
    disable: () => ScrollamaInstance;
    destroy: () => ScrollamaInstance;
    offset: (value?: number | string | null) => ScrollamaInstance | number;
  }
}
