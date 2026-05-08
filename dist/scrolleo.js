function se(t, n = document) {
  return typeof t == "string" ? Array.from(n.querySelectorAll(t)) : t instanceof Element ? [t] : t instanceof NodeList ? Array.from(t) : t instanceof Array ? t : [];
}
let p = null;
function ie() {
  const t = document.createElement("div");
  t.className = "scrollama__debug-step", t.style.position = "fixed", t.style.left = "0", t.style.width = "100%", t.style.zIndex = "9999", t.style.borderTop = "2px solid black", t.style.borderBottom = "2px solid black";
  const n = document.createElement("p");
  return n.style.position = "absolute", n.style.left = "0", n.style.height = "1px", n.style.width = "100%", n.style.borderTop = "1px dashed black", t.appendChild(n), document.body.appendChild(t), t;
}
function ce({ id: t, step: n, marginTop: r }) {
  const { height: a } = n;
  p || (p = ie()), p.style.top = `${r * -1}px`, p.style.height = `${a}px`, p.querySelector("p").style.top = `${a / 2}px`;
}
function _() {
  p && (p.remove(), p = null);
}
function le() {
  const t = "abcdefghijklmnopqrstuvwxyz", n = Date.now(), r = [];
  for (let a = 0; a < 6; a += 1) {
    const u = t[Math.floor(Math.random() * t.length)];
    r.push(u);
  }
  return `${r.join("")}${n}`;
}
function A(t) {
  console.error(`scrollama error: ${t}`);
}
const G = /* @__PURE__ */ new WeakMap();
function ae(t, n) {
  G.set(t, n);
}
function w(t) {
  return G.get(t);
}
function fe(t, n) {
  const r = Math.ceil(t / n), a = [], u = 1 / r;
  for (let g = 0; g < r + 1; g += 1)
    a.push(g * u);
  return a;
}
function R(t) {
  if (typeof t == "string" && t.indexOf("px") > 0) {
    const n = +t.replace("px", "");
    return isNaN(n) ? (err("offset value must be in 'px' format. Fallback to 0.5."), { format: "percent", value: 0.5 }) : { format: "pixels", value: n };
  } else if (typeof t == "number" || !isNaN(+t))
    return t > 1 && err("offset value is greater than 1. Fallback to 1."), t < 0 && err("offset value is lower than 0. Fallback to 0."), { format: "percent", value: Math.min(Math.max(0, t), 1) };
  return null;
}
function ue(t) {
  t.forEach((n) => ae(n.node, n.index));
}
const h = /* @__PURE__ */ new WeakMap();
function J(t) {
  return t === window ? window.scrollY : t.scrollTop;
}
function de(t) {
  const n = h.get(t);
  if (!n) return;
  const r = J(t);
  n.previousScrollY !== r && (r > n.previousScrollY ? n.direction = "down" : r < n.previousScrollY && (n.direction = "up"), n.previousScrollY = r);
}
function B(t) {
  const n = t || window, r = h.get(n);
  return r ? r.direction : "down";
}
function pe(t) {
  const n = t || window;
  if (h.has(n)) {
    const a = h.get(n);
    a.count += 1;
    return;
  }
  const r = () => de(n);
  h.set(n, {
    listener: r,
    previousScrollY: J(n),
    direction: "down",
    count: 1
  }), n.addEventListener("scroll", r, { passive: !0 });
}
function he(t) {
  const n = t || window;
  if (h.has(n)) {
    const r = h.get(n);
    r.count -= 1, r.count === 0 && (n.removeEventListener("scroll", r.listener), h.delete(n));
  }
}
function ge() {
  let t = {}, n = le(), r = [], a, u, g, y, N = 0, q = !1, E = !1, O = !1, C = !1, T = [], z = /* @__PURE__ */ new Map(), M = !1, v = null, m = /* @__PURE__ */ new Set(), k = !1, x = null;
  function L() {
    t = {
      stepEnter: () => {
      },
      stepExit: () => {
      },
      stepProgress: () => {
      }
    }, T = [], z.clear(), M = !1, v = null, m.clear(), k = !1, x = null;
  }
  function I(e) {
    e && !q && D(), !e && q && H(), q = e;
  }
  function K() {
    M = !1, v = null, z.forEach(
      ({ element: e, index: o, progress: s, direction: i, step: c }) => {
        if (c.progress = s, c.state === "enter") {
          const f = { element: e, index: o, progress: s, direction: i };
          t.stepProgress(f);
        }
      }
    ), z.clear();
  }
  function Q(e, o) {
    const s = w(e), i = r[s], c = B(u);
    z.set(s, {
      element: e,
      index: s,
      progress: o,
      direction: c,
      step: i
    }), M || (M = !0, v = requestAnimationFrame(K));
  }
  function Y(e, o) {
    o !== void 0 && Q(e, o);
  }
  function U(e) {
    const o = w(e), s = r[o], i = B(u), c = { element: e, index: o, direction: i };
    s.direction = i, s.state = "enter", T[o] || t.stepEnter(c), C && (T[o] = !0);
  }
  function V(e) {
    const o = w(e), s = r[o];
    if (!s.state) return !1;
    const i = B(u), c = { element: e, index: o, direction: i };
    E && (i === "down" && s.progress < 1 ? Y(e, 1) : i === "up" && s.progress > 0 && Y(e, 0)), s.direction = i, s.state = "exit", t.stepExit(c);
  }
  function X() {
    k = !1, x = null, m.forEach((e) => {
      j(e), W(e, E);
    }), m.clear();
  }
  function Z(e) {
    e.forEach((o) => {
      const s = w(o.target), i = r[s], c = Math.round(
        o.borderBoxSize?.[0]?.blockSize ?? o.contentRect.height
      );
      c !== i.height && (i.height = c, m.add(i));
    }), m.size > 0 && !k && (k = !0, x = requestAnimationFrame(X));
  }
  function ee([e]) {
    const { isIntersecting: o, target: s } = e;
    o ? U(s) : V(s);
  }
  function te([e]) {
    const o = w(e.target), s = r[o], { isIntersecting: i, intersectionRatio: c, target: f } = e;
    i && s.state === "enter" && Y(f, c);
  }
  function j({ observers: e }) {
    Object.values(e).forEach((o) => o.disconnect());
  }
  function H() {
    r.forEach(j), y && y.disconnect();
  }
  function ne() {
    y = new ResizeObserver(Z), r.forEach((e) => y.observe(e.node));
  }
  function W(e, o) {
    re(e), o && oe(e);
  }
  function re(e) {
    const o = window.innerHeight, s = e.offset || a, i = s.format === "pixels" ? 1 : o, c = s.value * i, f = e.height / 2 - c, b = e.height / 2 - (o - c), d = { rootMargin: `${f}px 0px ${b}px 0px`, threshold: 0.5, root: g }, $ = new IntersectionObserver(ee, d);
    $.observe(e.node), e.observers.step = $, O && ce({ id: n, step: e, marginTop: f });
  }
  function oe(e) {
    const o = window.innerHeight, s = e.offset || a, i = s.format === "pixels" ? 1 : o, c = s.value * i, f = -c + e.height, b = c - o, S = `${f}px 0px ${b}px 0px`, P = fe(e.height, N), F = { rootMargin: S, threshold: P }, d = new IntersectionObserver(te, F);
    d.observe(e.node), e.observers.progress = d;
  }
  function D() {
    H(), ne(), r.forEach((e) => W(e, E));
  }
  const l = {};
  return l.setup = ({
    step: e,
    parent: o,
    offset: s = 0.5,
    threshold: i = 4,
    progress: c = !1,
    once: f = !1,
    debug: b = !1,
    container: S = void 0,
    root: P = null
  }) => (pe(S), r = se(e, o).map((d, $) => ({
    index: $,
    direction: void 0,
    height: d.offsetHeight,
    node: d,
    observers: {},
    offset: R(d.dataset.offset),
    progress: 0,
    state: void 0
  })), r.length ? (E = c, C = f, O && !b && _(), O = b, N = Math.max(1, +i), a = R(s), u = S, g = P, L(), ue(r), I(!0), l) : (A("no step elements"), l)), l.enable = () => (I(!0), l), l.disable = () => (I(!1), l), l.destroy = () => (v && cancelAnimationFrame(v), x && cancelAnimationFrame(x), I(!1), L(), he(u), O && _(), r = [], l), l.resize = () => (D(), l), l.offset = (e) => e == null ? a.value : (a = R(e), D(), l), l.onStepEnter = (e) => (typeof e == "function" ? t.stepEnter = e : A("onStepEnter requires a function"), l), l.onStepExit = (e) => (typeof e == "function" ? t.stepExit = e : A("onStepExit requires a function"), l), l.onStepProgress = (e) => (typeof e == "function" ? t.stepProgress = e : A("onStepProgress requires a function"), l), l;
}
export {
  ge as default
};
//# sourceMappingURL=scrolleo.js.map
