function re(t, n = document) {
  return typeof t == "string" ? Array.from(n.querySelectorAll(t)) : t instanceof Element ? [t] : t instanceof NodeList ? Array.from(t) : t instanceof Array ? t : [];
}
let p = null;
function se() {
  const t = document.createElement("div");
  t.className = "scrollama__debug-step", t.style.position = "fixed", t.style.left = "0", t.style.width = "100%", t.style.zIndex = "9999", t.style.borderTop = "2px solid black", t.style.borderBottom = "2px solid black";
  const n = document.createElement("p");
  return n.style.position = "absolute", n.style.left = "0", n.style.height = "1px", n.style.width = "100%", n.style.borderTop = "1px dashed black", t.appendChild(n), document.body.appendChild(t), t;
}
function ie({ id: t, step: n, marginTop: o }) {
  const { height: f } = n;
  p || (p = se()), p.style.top = `${o * -1}px`, p.style.height = `${f}px`, p.querySelector("p").style.top = `${f / 2}px`;
}
function W() {
  p && (p.remove(), p = null);
}
function ce() {
  const t = "abcdefghijklmnopqrstuvwxyz", n = Date.now(), o = [];
  for (let f = 0; f < 6; f += 1) {
    const u = t[Math.floor(Math.random() * t.length)];
    o.push(u);
  }
  return `${o.join("")}${n}`;
}
function I(t) {
  console.error(`scrollama error: ${t}`);
}
const _ = /* @__PURE__ */ new WeakMap();
function le(t, n) {
  _.set(t, n);
}
function w(t) {
  return _.get(t);
}
function fe(t, n) {
  const o = Math.ceil(t / n), f = [], u = 1 / o;
  for (let b = 0; b < o + 1; b += 1)
    f.push(b * u);
  return f;
}
function B(t) {
  if (typeof t == "string" && t.indexOf("px") > 0) {
    const n = +t.replace("px", "");
    return isNaN(n) ? (err("offset value must be in 'px' format. Fallback to 0.5."), { format: "percent", value: 0.5 }) : { format: "pixels", value: n };
  } else if (typeof t == "number" || !isNaN(+t))
    return t > 1 && err("offset value is greater than 1. Fallback to 1."), t < 0 && err("offset value is lower than 0. Fallback to 0."), { format: "percent", value: Math.min(Math.max(0, t), 1) };
  return null;
}
function ae(t) {
  t.forEach((n) => le(n.node, n.index));
}
function ue(t) {
  const { top: n } = t.getBoundingClientRect(), o = window.pageYOffset, f = document.body.clientTop || 0;
  return n + o - f;
}
const h = /* @__PURE__ */ new WeakMap();
function G(t) {
  return t === window ? window.scrollY : t.scrollTop;
}
function de(t) {
  const n = h.get(t);
  if (!n) return;
  const o = G(t);
  n.previousScrollY !== o && (o > n.previousScrollY ? n.direction = "down" : o < n.previousScrollY && (n.direction = "up"), n.previousScrollY = o);
}
function C(t) {
  const n = t || window, o = h.get(n);
  return o ? o.direction : "down";
}
function pe(t) {
  const n = t || window;
  if (h.has(n)) {
    const f = h.get(n);
    f.count += 1;
    return;
  }
  const o = () => de(n);
  h.set(n, {
    listener: o,
    previousScrollY: G(n),
    direction: "down",
    count: 1
  }), n.addEventListener("scroll", o, { passive: !0 });
}
function he(t) {
  const n = t || window;
  if (h.has(n)) {
    const o = h.get(n);
    o.count -= 1, o.count === 0 && (n.removeEventListener("scroll", o.listener), h.delete(n));
  }
}
function ge() {
  let t = {}, n = ce(), o = [], f, u, b, S, N = 0, $ = !1, E = !1, O = !1, R = !1, Y = [], k = /* @__PURE__ */ new Map(), M = !1, v = /* @__PURE__ */ new Set(), P = !1;
  function F() {
    t = {
      stepEnter: () => {
      },
      stepExit: () => {
      },
      stepProgress: () => {
      }
    }, Y = [], k.clear(), M = !1, v.clear(), P = !1;
  }
  function z(e) {
    e && !$ && A(), !e && $ && H(), $ = e;
  }
  function J() {
    M = !1, k.forEach(
      ({ element: e, index: r, progress: s, direction: i, step: c }) => {
        if (c.progress = s, c.state === "enter") {
          const a = { element: e, index: r, progress: s, direction: i };
          t.stepProgress(a);
        }
      }
    ), k.clear();
  }
  function K(e, r) {
    const s = w(e), i = o[s], c = C(u);
    k.set(s, {
      element: e,
      index: s,
      progress: r,
      direction: c,
      step: i
    }), M || (M = !0, requestAnimationFrame(J));
  }
  function q(e, r) {
    r !== void 0 && K(e, r);
  }
  function Q(e) {
    const r = w(e), s = o[r], i = C(u), c = { element: e, index: r, direction: i };
    s.direction = i, s.state = "enter", Y[r] || t.stepEnter(c), R && (Y[r] = !0);
  }
  function U(e, r = !0) {
    const s = w(e), i = o[s];
    if (!i.state) return !1;
    const c = C(u), a = { element: e, index: s, direction: c };
    E && (c === "down" && i.progress < 1 ? q(e, 1) : c === "up" && i.progress > 0 && q(e, 0)), i.direction = c, i.state = "exit", t.stepExit(a);
  }
  function V() {
    P = !1, v.forEach((e) => {
      L(e), j(e, E);
    }), v.clear();
  }
  function X(e) {
    e.forEach((r) => {
      const s = w(r.target), i = o[s], c = r.target.offsetHeight;
      c !== i.height && (i.height = c, v.add(i));
    }), v.size > 0 && !P && (P = !0, requestAnimationFrame(V));
  }
  function Z([e]) {
    const { isIntersecting: r, target: s } = e;
    r ? Q(s) : U(s);
  }
  function ee([e]) {
    const r = w(e.target), s = o[r], { isIntersecting: i, intersectionRatio: c, target: a } = e;
    i && s.state === "enter" && q(a, c);
  }
  function L({ observers: e }) {
    Object.keys(e).map((r) => {
      e[r].disconnect();
    });
  }
  function H() {
    o.forEach(L), S && S.disconnect();
  }
  function te() {
    S = new ResizeObserver(X), o.forEach((e) => S.observe(e.node));
  }
  function j(e, r) {
    ne(e), r && oe(e);
  }
  function ne(e) {
    const r = window.innerHeight, s = e.offset || f, i = s.format === "pixels" ? 1 : r, c = s.value * i, a = e.height / 2 - c, m = e.height / 2 - (r - c), g = { rootMargin: `${a}px 0px ${m}px 0px`, threshold: 0.5, root: b }, d = new IntersectionObserver(Z, g);
    d.observe(e.node), e.observers.step = d, O && ie({ id: n, step: e, marginTop: a });
  }
  function oe(e) {
    const r = window.innerHeight, s = e.offset || f, i = s.format === "pixels" ? 1 : r, c = s.value * i, a = -c + e.height, m = c - r, x = `${a}px 0px ${m}px 0px`, T = fe(e.height, N), y = { rootMargin: x, threshold: T }, g = new IntersectionObserver(ee, y);
    g.observe(e.node), e.observers.progress = g;
  }
  function A() {
    H(), te(), o.forEach((e) => j(e, E));
  }
  const l = {};
  return l.setup = ({
    step: e,
    parent: r,
    offset: s = 0.5,
    threshold: i = 4,
    progress: c = !1,
    once: a = !1,
    debug: m = !1,
    container: x = void 0,
    root: T = null
  }) => {
    pe(x);
    const y = re(e, r), g = y.map((d) => ({
      height: d.offsetHeight,
      top: ue(d)
    }));
    return o = y.map((d, D) => ({
      index: D,
      direction: void 0,
      height: g[D].height,
      node: d,
      observers: {},
      offset: B(d.dataset.offset),
      top: g[D].top,
      progress: 0,
      state: void 0
    })), o.length ? (E = c, R = a, O && !m && W(), O = m, N = Math.max(1, +i), f = B(s), u = x, b = T, F(), ae(o), z(!0), l) : (I("no step elements"), l);
  }, l.enable = () => (z(!0), l), l.disable = () => (z(!1), l), l.destroy = () => (z(!1), F(), he(u), O && W(), o = [], l), l.resize = () => (A(), l), l.offset = (e) => e == null ? f.value : (f = B(e), A(), l), l.onStepEnter = (e) => (typeof e == "function" ? t.stepEnter = e : I("onStepEnter requires a function"), l), l.onStepExit = (e) => (typeof e == "function" ? t.stepExit = e : I("onStepExit requires a function"), l), l.onStepProgress = (e) => (typeof e == "function" ? t.stepProgress = e : I("onStepProgress requires a function"), l), l;
}
export {
  ge as default
};
//# sourceMappingURL=scrollama.js.map
