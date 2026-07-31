/* Vahan360 — interactions */
(function () {
  "use strict";

  // Mobile nav
  var toggle = document.getElementById("navToggle");
  var mobile = document.getElementById("navMobile");
  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      var open = mobile.getAttribute("data-open") === "true";
      mobile.setAttribute("data-open", String(!open));
      mobile.hidden = open;
      toggle.setAttribute("aria-expanded", String(!open));
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobile.setAttribute("data-open", "false");
        mobile.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Year
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Nav shadow on scroll
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Notify form (if present)
  var notify = document.getElementById("notifyForm");
  var notifyMsg = document.getElementById("notifyMsg");
  if (notify) {
    notify.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (document.getElementById("notifyInput").value || "").replace(/\D/g, "");
      if (val.length < 10) { notifyMsg.textContent = "Please enter a valid 10-digit mobile number."; notifyMsg.style.color = "#D6540A"; return; }
      notifyMsg.textContent = "Thanks! We'll let you know the moment Vahan360 is live.";
      notifyMsg.style.color = "#FD6502"; notify.reset();
    });
  }

  // Contact form (opens email app; replace with form service when ready)
  var contact = document.getElementById("contactForm");
  var contactMsg = document.getElementById("contactMsg");
  if (contact) {
    contact.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cname").value.trim();
      var email = document.getElementById("cemail").value.trim();
      var msg = document.getElementById("cmsg").value.trim();
      if (!name || !email || !msg) { contactMsg.textContent = "Please fill in all fields."; contactMsg.style.color = "#D6540A"; return; }
      window.location.href = "mailto:info@vahan360.co.in?subject=" +
        encodeURIComponent("Website enquiry from " + name) + "&body=" +
        encodeURIComponent(msg + "\n\n— " + name + " (" + email + ")");
      contactMsg.textContent = "Opening your email app…"; contactMsg.style.color = "#FD6502";
    });
  }

  // Scroll reveal — observe EVERY .reveal element
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !reveals.length) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      var idx = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
      el.style.transitionDelay = Math.min(idx * 0.08, 0.4) + "s";
      obs.observe(el);
    });
    // Safety: reveal anything still hidden shortly after load
    window.addEventListener("load", function () {
      setTimeout(function () {
        reveals.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) el.classList.add("is-visible");
        });
      }, 400);
    });
  }
})();

/* Advanced interactions: progress, counters, tabs, active nav */
(function () {
  "use strict";
  // Scroll progress bar
  var bar = document.querySelector(".progress");
  if (bar) {
    var upd = function () {
      var h = document.documentElement;
      var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = (pct || 0) + "%";
    };
    window.addEventListener("scroll", upd, { passive: true }); upd();
  }

  // Animated counters
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cobs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute("data-count")),
            suf = el.getAttribute("data-suffix") || "", t0 = null, dur = 1400;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1), val = Math.floor(p * target);
          el.textContent = val + suf;
          if (p < 1) requestAnimationFrame(step); else el.textContent = target + suf;
        }
        requestAnimationFrame(step); cobs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cobs.observe(c); });
  }

  // Tabs
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var btns = group.querySelectorAll(".tabbtn"), panels = group.querySelectorAll(".tabpanel");
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("active"); });
        panels.forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        if (panels[i]) panels[i].classList.add("active");
      });
    });
  });

  // Active nav link by current path
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "index.html" && href === "index.html")) a.classList.add("active");
  });
})();

/* Service tabs */
(function () {
  "use strict";
  var btns = document.querySelectorAll(".tabs__btn");
  if (!btns.length) return;
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-tab");
      document.querySelectorAll(".tabs__btn").forEach(function (x) { x.classList.remove("active"); });
      document.querySelectorAll(".tabs__panel").forEach(function (p) { p.classList.remove("active"); });
      b.classList.add("active");
      var panel = document.getElementById(id);
      if (panel) panel.classList.add("active");
    });
  });
})();
