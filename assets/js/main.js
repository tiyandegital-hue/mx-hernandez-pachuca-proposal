/* Plomería y Electricidad Hernández — shared interactions */
(function () {
  "use strict";
  var WA = "https://wa.me/527712164534";
  var MOBILE = "771 216 4534";

  /* footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("mainnav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  /* ---- WhatsApp chat mock (typing on load, index hero) ---- */
  var chat = document.getElementById("chat-mock");
  if (chat) {
    var msgs = JSON.parse(chat.getAttribute("data-messages") || "[]");
    var body = chat.querySelector(".chat-body");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function addBubble(m) {
      var d = document.createElement("div");
      d.className = "bubble " + m.kind;
      if (m.photo) {
        var p = document.createElement("span");
        p.className = "photo-tag";
        p.textContent = m.photo;
        d.appendChild(p);
        d.appendChild(document.createElement("br"));
      }
      d.appendChild(document.createTextNode(m.text));
      var t = document.createElement("span");
      t.className = "t";
      t.textContent = m.time + (m.kind === "out" ? "  ✓✓" : "");
      d.appendChild(t);
      body.appendChild(d);
    }
    function typeAll(i) {
      if (i >= msgs.length) return;
      var m = msgs[i];
      if (m.kind === "sys") { addBubble(m); typeAll(i + 1); return; }
      var tp = document.createElement("div");
      tp.className = "bubble " + m.kind;
      tp.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      body.appendChild(tp);
      setTimeout(function () {
        tp.remove();
        addBubble(m);
        typeAll(i + 1);
      }, reduced ? 60 : 900);
    }
    var started = false;
    function start() {
      if (started) return;
      started = true;
      typeAll(0);
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { start(); io.disconnect(); }
      }, { threshold: 0.2 });
      io.observe(chat);
    } else { start(); }
  }

  /* ---- Quoter (cotizar.html) ---- */
  var quoter = document.getElementById("quoter");
  if (quoter) {
    var problem = "";
    var problemLabel = "";
    var coloniaSel = document.getElementById("q-colonia");
    var fotoChk = document.getElementById("q-foto");
    var preview = document.getElementById("q-preview");
    var sendBtn = document.getElementById("q-send");
    var probBtns = quoter.querySelectorAll(".prob-btn");

    function buildMessage() {
      var lines = ["Hola, requiero cotización técnica."];
      lines.push("Problema: " + (problemLabel || "[selecciona un problema]"));
      lines.push("Colonia: " + (coloniaSel ? coloniaSel.value : ""));
      lines.push("Foto o video: " + (fotoChk && fotoChk.checked ? "Sí, la tengo lista para adjuntarla." : "No tengo foto por ahora."));
      lines.push("¿Me pueden cotizar antes de ir?");
      return lines.join("\n");
    }
    function render() {
      var msg = buildMessage();
      preview.textContent = msg;
      if (problem) {
        sendBtn.href = WA + "?text=" + encodeURIComponent(msg);
        sendBtn.removeAttribute("aria-disabled");
      } else {
        sendBtn.href = "#quoter";
        sendBtn.setAttribute("aria-disabled", "true");
      }
    }
    probBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        probBtns.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        problem = b.getAttribute("data-value");
        problemLabel = b.getAttribute("data-label");
        render();
      });
    });
    if (coloniaSel) coloniaSel.addEventListener("change", render);
    if (fotoChk) fotoChk.addEventListener("change", render);
    sendBtn.addEventListener("click", function (e) {
      if (!problem) {
        e.preventDefault();
        preview.textContent = "Primero selecciona el tipo de falla en el Paso 1.";
        preview.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    /* preselect from ?falla= (problem picker links) */
    var params = new URLSearchParams(window.location.search);
    var f = params.get("falla");
    if (f) {
      probBtns.forEach(function (b) {
        if (b.getAttribute("data-value") === f) b.click();
      });
    }
    var c = params.get("colonia");
    if (c && coloniaSel) { coloniaSel.value = c; }
    render();
  }

  /* ---- Generic forms -> WhatsApp (contacto / mantenimiento) ---- */
  document.querySelectorAll("form[data-wa-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var fd = new FormData(form);
      var lines = ["Hola, quiero solicitar asistencia técnica."];
      fd.forEach(function (v, k) {
        if (v instanceof File) {
          if (v && v.size > 0) lines.push("Foto: sí, la adjunto en WhatsApp.");
          return;
        }
        if (v && String(v).trim() !== "") lines.push(k + ": " + v);
      });
      var url = WA + "?text=" + encodeURIComponent(lines.join("\n"));
      var msg = form.querySelector(".form-msg");
      if (msg) {
        msg.innerHTML = 'Reporte listo. <a href="' + url + '" target="_blank" rel="noopener">Abrir WhatsApp con el reporte precargado</a> — adjunta la foto del problema en el chat.';
        msg.classList.add("show");
        msg.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      window.open(url, "_blank", "noopener");
    });
  });

  /* ---- Maintenance protocol select -> prefill booking form ---- */
  document.querySelectorAll("[data-protocol]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sel = document.getElementById("m-servicio");
      if (sel) {
        sel.value = btn.getAttribute("data-protocol");
        sel.scrollIntoView({ behavior: "smooth", block: "center" });
        sel.focus({ preventScroll: true });
      }
    });
  });

  /* ---- Problem picker tiles: pass falla to quoter ---- */
  document.querySelectorAll(".pick-tile").forEach(function (t) {
    t.addEventListener("click", function () {
      try { sessionStorage.setItem("hernandez-falla", t.getAttribute("data-falla") || ""); } catch (e) {}
    });
  });
})();
