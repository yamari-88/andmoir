/* MOIR 2027 — сумка, страницы и эффекты. Без библиотек. */
(function () {
  "use strict";

  var DATA = window.MOIR;
  var P = DATA.products;
  var NS = "http://www.w3.org/2000/svg";
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return el;
  }
  function svg(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  var money = function (n) { return new Intl.NumberFormat("fr-FR").format(n) + " €"; };
  var pct = function (l) { return "left:" + l.x + "%;top:" + l.y + "%;width:" + l.w + "%"; };

  /* ---------------- СУМКА (localStorage с запасным вариантом в памяти) ---------------- */
  var KEY = "moir.bag.v1";
  var mem = null;
  var Bag = {
    all: function () {
      if (!mem) {
        try { mem = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { mem = []; }
        if (!Array.isArray(mem)) mem = [];
        mem = mem.filter(function (i) { return i && P[i.id]; });
      }
      return mem.slice();
    },
    save: function (a) {
      mem = a;
      try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { /* ок, живём в памяти */ }
      paintCount();
    },
    add: function (id, size) {
      var a = this.all();
      if (a.some(function (i) { return i.id === id && i.size === size; })) return false;
      a.push({ id: id, size: size });
      this.save(a);
      return true;
    },
    remove: function (id, size) {
      this.save(this.all().filter(function (i) { return !(i.id === id && i.size === size); }));
    },
    total: function () {
      return this.all().reduce(function (s, i) { return s + P[i.id].price; }, 0);
    }
  };
  function paintCount() {
    var n = Bag.all().length;
    $$("[data-bag-count]").forEach(function (el) { el.textContent = n; });
  }

  /* ---------------- ЭФФЕКТЫ ---------------- */

  // «Призрак» — силуэт, который лениво тянется за курсором
  function initGhost() {
    if (reduced || (window.matchMedia && matchMedia("(hover: none)").matches)) return;
    var g = h("img", { "class": "ghost", src: "assets/sil-fitting.png", alt: "", "aria-hidden": "true" });
    g.onerror = function () { g.remove(); };
    document.body.appendChild(g);
    var mx = 0, my = 0, x = 0, y = 0, ready = false;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!ready) { x = mx; y = my; ready = true; g.classList.add("on"); }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { g.classList.remove("on"); ready = false; });
    (function loop() {
      x += (mx - x) * 0.07;
      y += (my - y) * 0.07;
      var tilt = Math.max(-8, Math.min(8, (mx - x) * 0.05));
      g.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-50%) rotate(" + tilt.toFixed(2) + "deg)";
      requestAnimationFrame(loop);
    })();
  }

  // Трескающееся зеркало: клик по зоне [data-crack] добавляет трещины от точки удара.
  // Основа — лучи с ответвлениями, плюс поперечные трещины между соседними лучами (паутина).
  function f(n) { return n.toFixed(1); }
  function ray(x, y, a, len, depth, trail) {
    var d = "M" + f(x) + " " + f(y), done = 0, px = x, py = y;
    while (done < len) {
      var step = 10 + Math.random() * 26;
      a += (Math.random() - 0.5) * 0.65;
      px += Math.cos(a) * step;
      py += Math.sin(a) * step;
      d += "L" + f(px) + " " + f(py);
      if (trail) trail.push([px, py]);
      done += step;
      if (depth < 3 && Math.random() < 0.2) {
        d += ray(px, py, a + (Math.random() < 0.5 ? -1 : 1) * (0.45 + Math.random() * 0.7), (len - done) * 0.65, depth + 1, null);
        d += "M" + f(px) + " " + f(py);
      }
    }
    return d;
  }
  function jag(p, q) {
    var mx = (p[0] + q[0]) / 2 + (Math.random() - 0.5) * 14;
    var my = (p[1] + q[1]) / 2 + (Math.random() - 0.5) * 14;
    return "L" + f(mx) + " " + f(my) + "L" + f(q[0]) + " " + f(q[1]);
  }
  function crackAt(zone, x, y) {
    var r = zone.getBoundingClientRect();
    var el = $("svg.cracks", zone);
    if (!el) {
      el = svg("svg", { "class": "cracks", preserveAspectRatio: "none", "aria-hidden": "true" });
      zone.appendChild(el);
    }
    el.setAttribute("viewBox", "0 0 " + r.width + " " + r.height);
    var g = svg("g");
    el.appendChild(g);
    if (el.childNodes.length > 5) el.removeChild(el.firstChild);

    var rays = 9 + Math.floor(Math.random() * 5);
    var reach = Math.max(r.width, r.height) * 0.8;
    var d = "", trails = [], i;
    for (i = 0; i < rays; i++) {
      var trail = [];
      var a = (i / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      d += ray(x, y, a, (0.2 + Math.random() * 0.5) * reach, 0, trail);
      trails.push(trail);
    }
    for (i = 0; i < rays; i++) {
      var A = trails[i], B = trails[(i + 1) % rays];
      [2, 4, 7, 11].forEach(function (k) {
        if (A[k] && B[k] && Math.random() < 0.7) d += "M" + f(A[k][0]) + " " + f(A[k][1]) + jag(A[k], B[k]);
      });
    }
    ["c-lo", "c-hi"].forEach(function (cls) {
      var p = svg("path", { "class": cls, d: d });
      g.appendChild(p);
      if (reduced) return;
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.getBoundingClientRect(); // reflow
      p.style.transition = "stroke-dashoffset 0.4s ease-out";
      p.style.strokeDashoffset = 0;
    });
    if (!reduced && zone.parentElement && zone.parentElement.animate) {
      zone.parentElement.animate(
        [{ transform: "translate(0,0)" }, { transform: "translate(-3px,1px)" }, { transform: "translate(2px,-1px)" }, { transform: "none" }],
        { duration: 240 }
      );
    }
  }
  function initCracks() {
    $$("[data-crack]").forEach(function (z) {
      z.addEventListener("pointerdown", function (e) {
        var r = z.getBoundingClientRect();
        crackAt(z, e.clientX - r.left, e.clientY - r.top);
      });
    });
  }

  function initBack() {
    $$("[data-back]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        try {
          if (history.length > 1 && document.referrer && new URL(document.referrer).origin === location.origin) {
            e.preventDefault();
            history.back();
          }
        } catch (err) { /* идём по href */ }
      });
    });
  }

  /* ---------------- СЦЕНА ТОВАРА ---------------- */
  // Рваная тень: серые листы с неровным краем (SVG-фильтр смещает контур шумом)
  function tornShadow() {
    var el = svg("svg", { "class": "torn", viewBox: "0 0 740 900", preserveAspectRatio: "none", "aria-hidden": "true" });
    var defs = svg("defs");
    var flt = svg("filter", { id: "rough", x: "-20%", y: "-20%", width: "140%", height: "140%" });
    flt.appendChild(svg("feTurbulence", { type: "fractalNoise", baseFrequency: "0.035", numOctaves: "3", seed: "7", result: "n" }));
    flt.appendChild(svg("feDisplacementMap", { "in": "SourceGraphic", in2: "n", scale: "38" }));
    defs.appendChild(flt);
    el.appendChild(defs);
    var g = svg("g", { filter: "url(#rough)", fill: "#5d6b6d", "fill-opacity": "0.26" });
    g.appendChild(svg("path", { d: "M-20 70 L250 40 L290 520 L245 905 L-20 890 Z" }));
    g.appendChild(svg("path", { d: "M140 862 L735 755 L770 905 L80 915 Z" }));
    g.appendChild(svg("path", { d: "M300 520 L520 470 L560 640 L330 690 Z", "fill-opacity": "0.5" }));
    el.appendChild(g);
    return el;
  }
  function mirrorEl(m) {
    var wrap = h("div", { "class": "mirror", style: pct(m) });
    wrap.appendChild(h("img", { "class": "mirror__img", src: "assets/" + m.src, alt: "" }));
    if (m.reflection) {
      wrap.appendChild(h("img", {
        "class": "mirror__refl" + (m.reflection.ghost ? " is-ghost" : ""),
        src: "assets/" + m.reflection.src, alt: "", style: pct(m.reflection)
      }));
    }
    wrap.appendChild(h("div", { "class": "mirror-hit", "data-crack": "", "aria-hidden": "true" }));
    return wrap;
  }
  function buildScene(p) {
    var sc = $("#scene");
    sc.textContent = "";
    sc.setAttribute("aria-label", p.name);
    sc.appendChild(tornShadow());
    p.scene.layers.forEach(function (l) {
      if (l === "MIRROR") sc.appendChild(mirrorEl(p.scene.mirror));
      else sc.appendChild(h("img", { src: "assets/" + l.src, alt: "", style: pct(l) }));
    });
    $("#shade").src = "assets/" + p.scene.shade;
  }

  /* ---------------- СТРАНИЦЫ ---------------- */
  var pages = {};

  pages.collection = function () {
    var box = $("#tags");
    Object.keys(P).forEach(function (key, i) {
      var p = P[key], t = p.tag.tape;
      box.appendChild(
        h("a", { "class": "tag", href: "product.html?id=" + p.id, style: "--w:" + p.tag.w },
          h("div", { "class": "tag__hang", style: "--d:" + (-i * 1.9) + "s" },
            h("img", { src: "assets/tag-" + p.id + ".webp", alt: p.name }),
            h("span", { "class": "tape", "aria-hidden": "true", style: "left:" + t.l + "%;top:" + t.t + "%;width:" + t.w + "%" }, h("b", { text: "LOOK" }))
          ),
          h("div", { "class": "tag__cap" },
            h("div", { "class": "row" },
              h("h3", { text: p.name }),
              h("span", { "class": "slash", text: "/" }),
              h("span", { "class": "price", text: p.price + " €" })
            ),
            h("p", { text: p.tagline })
          )
        )
      );
    });

    // силуэт «I» в COLLECTION стоит на верёвке средней бирки (как в макете):
    // подгоняем межбуквенный интервал заголовка под реальный шрифт и ширину окна
    function alignI() {
      var title = $(".title"), sil = $(".sil", title), hang = $$(".tag__hang")[1];
      if (!sil || !hang) return;
      title.style.letterSpacing = "";
      if (window.innerWidth <= 768) return;
      var s = sil.getBoundingClientRect(), t = hang.getBoundingClientRect();
      var target = t.left + t.width * 0.56;          // верёвка бирки ~56% её ширины
      var ls = parseFloat(getComputedStyle(title).letterSpacing) || 0;
      var delta = (target - (s.left + s.width / 2)) / 7; // 7 букв до «I»
      title.style.letterSpacing = Math.max(ls * 0.5, ls + delta) + "px";
    }
    alignI();
    window.addEventListener("resize", alignI);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignI);
  };

  pages.product = function () {
    var id = new URLSearchParams(location.search).get("id");
    var p = P[id] || P["black-dress"];
    document.title = "MOIR — " + p.name;
    $("#pName").textContent = p.name;
    $("#pPrice").textContent = p.price + " €";
    $("#pText").textContent = p.text;
    buildScene(p);

    // размеры
    var size = DATA.sizes[0], wrap = $("#sizes");
    DATA.sizes.forEach(function (s) {
      var b = h("button", { "class": "size", type: "button", "aria-pressed": String(s === size), text: s });
      b.addEventListener("click", function () {
        size = s;
        $$(".size", wrap).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      });
      wrap.appendChild(b);
    });

    // BUY
    var buy = $("#buy"), line = $("#bagLine"), t;
    buy.addEventListener("click", function () {
      var ok = Bag.add(p.id, size);
      buy.textContent = ok ? "ADDED" : "ALREADY IN BAG";
      buy.classList.add("is-done");
      line.hidden = false;
      clearTimeout(t);
      t = setTimeout(function () { buy.textContent = "BUY"; buy.classList.remove("is-done"); }, 1600);
    });

    // DELIVERY
    var dt = $("#delivText");
    dt.textContent = DATA.deliveryText;
    var db = $("#delivBtn");
    db.setAttribute("aria-expanded", "false");
    db.addEventListener("click", function () {
      dt.hidden = !dt.hidden;
      db.setAttribute("aria-expanded", String(!dt.hidden));
    });
  };

  pages.bag = function () {
    var tags = $("#bagTags"), rows = $("#sumRows");

    function render() {
      var items = Bag.all(), n = items.length;
      $("#bagN").textContent = n;
      $("#sumLead").textContent = n ? n + (n === 1 ? " piece" : " pieces") + " hanging." : "Nothing hanging.";
      $("#sumTotal").textContent = money(Bag.total());
      $("#checkout").disabled = !n;
      $("#checkNote").hidden = true;

      tags.textContent = "";
      rows.textContent = "";
      tags.classList.toggle("is-3", n === 3);
      tags.classList.toggle("is-many", n > 3);
      if (!n) tags.appendChild(h("p", { "class": "bag-empty", text: "Your bag is empty. Nothing hangs here yet." }));

      items.forEach(function (it, i) {
        var p = P[it.id];
        var rm = h("button", { type: "button", text: "Remove" });
        var el = h("article", { "class": "bag-item" },
          h("div", { "class": "tag__hang", style: "--w:" + p.tag.w + ";--d:" + (-i * 2.3) + "s" },
            h("img", { src: "assets/tag-" + p.id + ".webp", alt: p.name })
          ),
          h("div", { "class": "bag-cap" }, h("h3", { text: p.name }), rm)
        );
        rm.addEventListener("click", function () {
          rm.disabled = true;
          if (reduced) { Bag.remove(it.id, it.size); render(); return; }
          el.classList.add("fall");
          var hang = $(".tag__hang", el), done = false;
          function finish() { if (done) return; done = true; Bag.remove(it.id, it.size); render(); }
          hang.addEventListener("animationend", finish);
          setTimeout(finish, 1200); // страховка
        });
        tags.appendChild(el);

        rows.appendChild(
          h("li", {},
            h("span", { text: p.name + "  /  " + it.size }),
            h("span", { text: money(p.price) })
          )
        );
      });
    }

    $("#checkout").addEventListener("click", function () { $("#checkNote").hidden = false; });
    render();
  };

  /* ---------------- СТАРТ ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    paintCount();
    var page = document.body.getAttribute("data-page");
    if (pages[page]) pages[page]();
    initCracks();
    initBack();
    initGhost();
  });
})();
