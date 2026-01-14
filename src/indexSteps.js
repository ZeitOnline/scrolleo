import { setIndex } from './getIndex';

export default function indexSteps(steps) {
	steps.forEach((step) => setIndex(step.node, step.index));
}
