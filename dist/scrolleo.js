//#region src/dom.js
function e(e, t = document) {
	return typeof e == "string" ? Array.from(t.querySelectorAll(e)) : e instanceof Element ? [e] : e instanceof NodeList ? Array.from(e) : e instanceof Array ? e : [];
}
//#endregion
//#region src/debug.js
var t = null;
function n() {
	let e = document.createElement("div");
	e.className = "scrollama__debug-step", e.style.position = "fixed", e.style.left = "0", e.style.width = "100%", e.style.zIndex = "9999", e.style.borderTop = "2px solid black", e.style.borderBottom = "2px solid black";
	let t = document.createElement("p");
	return t.style.position = "absolute", t.style.left = "0", t.style.height = "1px", t.style.width = "100%", t.style.borderTop = "1px dashed black", e.appendChild(t), document.body.appendChild(e), e;
}
function r({ id: e, step: r, marginTop: i }) {
	let { height: a } = r;
	t ||= n(), t.style.top = `${i * -1}px`, t.style.height = `${a}px`, t.querySelector("p").style.top = `${a / 2}px`;
}
function i() {
	t &&= (t.remove(), null);
}
//#endregion
//#region src/generateId.js
function a() {
	let e = Date.now(), t = [];
	for (let e = 0; e < 6; e += 1) {
		let e = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
		t.push(e);
	}
	return `${t.join("")}${e}`;
}
//#endregion
//#region src/err.js
function o(e) {
	console.error(`scrollama error: ${e}`);
}
//#endregion
//#region src/getIndex.js
var s = /* @__PURE__ */ new WeakMap();
function c(e, t) {
	s.set(e, t);
}
function l(e) {
	return s.get(e);
}
//#endregion
//#region src/createProgressThreshold.js
function u(e, t) {
	let n = Math.ceil(e / t), r = [], i = 1 / n;
	for (let e = 0; e < n + 1; e += 1) r.push(e * i);
	return r;
}
//#endregion
//#region src/parseOffset.js
function d(e) {
	if (typeof e == "string" && e.indexOf("px") > 0) {
		let t = +e.replace("px", "");
		return isNaN(t) ? (err("offset value must be in 'px' format. Fallback to 0.5."), {
			format: "percent",
			value: .5
		}) : {
			format: "pixels",
			value: t
		};
	} else if (typeof e == "number" || !isNaN(+e)) return e > 1 && err("offset value is greater than 1. Fallback to 1."), e < 0 && err("offset value is lower than 0. Fallback to 0."), {
		format: "percent",
		value: Math.min(Math.max(0, e), 1)
	};
	return null;
}
//#endregion
//#region src/indexSteps.js
function f(e) {
	e.forEach((e) => c(e.node, e.index));
}
//#endregion
//#region src/scroll.js
var p = /* @__PURE__ */ new WeakMap();
function m(e) {
	return e === window ? window.scrollY : e.scrollTop;
}
function h(e) {
	let t = p.get(e);
	if (!t) return;
	let n = m(e);
	t.previousScrollY !== n && (n > t.previousScrollY ? t.direction = "down" : n < t.previousScrollY && (t.direction = "up"), t.previousScrollY = n);
}
function g(e) {
	let t = e || window, n = p.get(t);
	return n ? n.direction : "down";
}
function _(e) {
	let t = e || window;
	if (p.has(t)) {
		let e = p.get(t);
		e.count += 1;
		return;
	}
	let n = () => h(t);
	p.set(t, {
		listener: n,
		previousScrollY: m(t),
		direction: "down",
		count: 1
	}), t.addEventListener("scroll", n, { passive: !0 });
}
function v(e) {
	let t = e || window;
	if (p.has(t)) {
		let e = p.get(t);
		--e.count, e.count === 0 && (t.removeEventListener("scroll", e.listener), p.delete(t));
	}
}
//#endregion
//#region src/entry.js
function y() {
	let t = {}, n = a(), s = [], c, p, m, h, y = 0, b = !1, x = !1, S = !1, C = !1, w = [], T = /* @__PURE__ */ new Map(), E = !1, D = null, O = /* @__PURE__ */ new Set(), k = !1, A = null;
	function j() {
		t = {
			stepEnter: () => {},
			stepExit: () => {},
			stepProgress: () => {}
		}, w = [], T.clear(), E = !1, D = null, O.clear(), k = !1, A = null;
	}
	function M(e) {
		e && !b && J(), !e && b && U(), b = e;
	}
	function N() {
		E = !1, D = null, T.forEach(({ element: e, index: n, progress: r, direction: i, step: a }) => {
			if (a.progress = r, a.state === "enter") {
				let a = {
					element: e,
					index: n,
					progress: r,
					direction: i
				};
				t.stepProgress(a);
			}
		}), T.clear();
	}
	function P(e, t) {
		let n = l(e), r = s[n], i = g(p);
		T.set(n, {
			element: e,
			index: n,
			progress: t,
			direction: i,
			step: r
		}), E || (E = !0, D = requestAnimationFrame(N));
	}
	function F(e, t) {
		t !== void 0 && P(e, t);
	}
	function I(e) {
		let n = l(e), r = s[n], i = g(p), a = {
			element: e,
			index: n,
			direction: i
		};
		r.direction = i, r.state = "enter", w[n] || t.stepEnter(a), C && (w[n] = !0);
	}
	function L(e) {
		let n = l(e), r = s[n];
		if (!r.state) return !1;
		let i = g(p), a = {
			element: e,
			index: n,
			direction: i
		};
		x && (i === "down" && r.progress < 1 ? F(e, 1) : i === "up" && r.progress > 0 && F(e, 0)), r.direction = i, r.state = "exit", t.stepExit(a);
	}
	function R() {
		k = !1, A = null, O.forEach((e) => {
			H(e), G(e, x);
		}), O.clear();
	}
	function z(e) {
		e.forEach((e) => {
			let t = l(e.target), n = s[t], r = Math.round(e.borderBoxSize?.[0]?.blockSize ?? e.contentRect.height);
			r !== n.height && (n.height = r, O.add(n));
		}), O.size > 0 && !k && (k = !0, A = requestAnimationFrame(R));
	}
	function B([e]) {
		let { isIntersecting: t, target: n } = e;
		t ? I(n) : L(n);
	}
	function V([e]) {
		let t = l(e.target), n = s[t], { isIntersecting: r, intersectionRatio: i, target: a } = e;
		r && n.state === "enter" && F(a, i);
	}
	function H({ observers: e }) {
		Object.values(e).forEach((e) => e.disconnect());
	}
	function U() {
		s.forEach(H), h && h.disconnect();
	}
	function W() {
		h = new ResizeObserver(z), s.forEach((e) => h.observe(e.node));
	}
	function G(e, t) {
		K(e), t && q(e);
	}
	function K(e) {
		let t = window.innerHeight, i = e.offset || c, a = i.format === "pixels" ? 1 : t, o = i.value * a, s = e.height / 2 - o, l = e.height / 2 - (t - o), u = {
			rootMargin: `${s}px 0px ${l}px 0px`,
			threshold: .5,
			root: m
		}, d = new IntersectionObserver(B, u);
		d.observe(e.node), e.observers.step = d, S && r({
			id: n,
			step: e,
			marginTop: s,
			marginBottom: l
		});
	}
	function q(e) {
		let t = window.innerHeight, n = e.offset || c, r = n.format === "pixels" ? 1 : t, i = n.value * r, a = {
			rootMargin: `${-i + e.height}px 0px ${i - t}px 0px`,
			threshold: u(e.height, y)
		}, o = new IntersectionObserver(V, a);
		o.observe(e.node), e.observers.progress = o;
	}
	function J() {
		U(), W(), s.forEach((e) => G(e, x));
	}
	let Y = {};
	return Y.setup = ({ step: t, parent: n, offset: r = .5, threshold: a = 4, progress: l = !1, once: u = !1, debug: h = !1, container: g = void 0, root: v = null }) => (_(g), s = e(t, n).map((e, t) => ({
		index: t,
		direction: void 0,
		height: e.offsetHeight,
		node: e,
		observers: {},
		offset: d(e.dataset.offset),
		progress: 0,
		state: void 0
	})), s.length ? (x = l, C = u, S && !h && i(), S = h, y = Math.max(1, +a), c = d(r), p = g, m = v, j(), f(s), M(!0), Y) : (o("no step elements"), Y)), Y.enable = () => (M(!0), Y), Y.disable = () => (M(!1), Y), Y.destroy = () => (D && cancelAnimationFrame(D), A && cancelAnimationFrame(A), M(!1), j(), v(p), S && i(), s = [], Y), Y.resize = () => (J(), Y), Y.offset = (e) => e == null ? c.value : (c = d(e), J(), Y), Y.onStepEnter = (e) => (typeof e == "function" ? t.stepEnter = e : o("onStepEnter requires a function"), Y), Y.onStepExit = (e) => (typeof e == "function" ? t.stepExit = e : o("onStepExit requires a function"), Y), Y.onStepProgress = (e) => (typeof e == "function" ? t.stepProgress = e : o("onStepProgress requires a function"), Y), Y;
}
//#endregion
//#region index.js
var b = y;
//#endregion
export { b as default };

//# sourceMappingURL=scrolleo.js.map