// WeakMap for fast index lookups without DOM attribute reads
const stepIndexMap = new WeakMap();

export function setIndex(node, index) {
	stepIndexMap.set(node, index);
}

export default function getIndex(node) {
	return stepIndexMap.get(node);
}
