(function () {
  "use strict";

  var data = window.DFIR_DATA || [];
  var docs = window.DFIR_DOCS || { cheatsheets: [], playbooks: [] };

  var main = document.getElementById("main");
  var chipsEl = document.getElementById("chips");
  var qEl = document.getElementById("q");
  var statsEl = document.getElementById("stats");
  var emptyEl = document.getElementById("empty");
  var tabsEl = document.getElementById("tabs");

  var activeTab = "codes";
  var activeCat = "all";
  var activeDoc = { cheatsheets: null, playbooks: null };
  var searchTimer = null;
  var codesBuilt = false;

  var placeholders = {
    codes: "Search codes, events, ports…",
    cheatsheets: "Search cheatsheets…",
    playbooks: "Search playbooks…",
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sevClass(sev) {
    sev = (sev || "info").toLowerCase();
    if (
      sev === "ok" ||
      sev === "info" ||
      sev === "warn" ||
      sev === "err" ||
      sev === "crit"
    ) {
      return "sev-" + sev;
    }
    return "sev-info";
  }

  /* ---------- tabs ---------- */
  function setTab(tab) {
    activeTab = tab;
    var buttons = tabsEl.querySelectorAll(".tab");
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute("data-tab") === tab;
      buttons[i].classList.toggle("active", on);
      buttons[i].setAttribute("aria-selected", on ? "true" : "false");
    }
    var panels = ["codes", "cheatsheets", "playbooks"];
    for (var p = 0; p < panels.length; p++) {
      var el = document.getElementById("panel-" + panels[p]);
      if (!el) continue;
      var show = panels[p] === tab;
      el.classList.toggle("active", show);
      if (show) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    }
    qEl.placeholder = placeholders[tab] || "Search…";
    // chips only relevant on codes
    chipsEl.style.display = tab === "codes" ? "" : "none";
    applyFilter();
  }

  /* ---------- codes tab ---------- */
  function buildChips() {
    var html = '<button type="button" class="chip active" data-id="all">All</button>';
    for (var i = 0; i < data.length; i++) {
      html +=
        '<button type="button" class="chip" data-id="' +
        esc(data[i].id) +
        '">' +
        esc(data[i].title) +
        "</button>";
    }
    chipsEl.innerHTML = html;
  }

  function buildTables() {
    if (codesBuilt) return;
    var html = "";
    for (var i = 0; i < data.length; i++) {
      var s = data[i];
      html +=
        '<section class="section" id="sec-' +
        esc(s.id) +
        '" data-id="' +
        esc(s.id) +
        '">';
      html += '<div class="section-head">';
      html += "<h2>" + esc(s.title) + "</h2>";
      html += '<span class="count" data-count>0 shown</span>';
      html += "</div>";
      html += '<p class="section-desc">' + esc(s.desc) + "</p>";
      html += '<div class="table-wrap"><table><thead><tr>';
      for (var c = 0; c < s.columns.length; c++) {
        html += "<th>" + esc(s.columns[c]) + "</th>";
      }
      html += "</tr></thead><tbody>";
      for (var r = 0; r < s.rows.length; r++) {
        var row = s.rows[r];
        var hay = row.join(" ").toLowerCase() + " " + s.title.toLowerCase();
        html += '<tr data-hay="' + esc(hay) + '">';
        for (var k = 0; k < row.length; k++) {
          var cell = row[k];
          if (k === 0) {
            html += '<td class="code">' + esc(cell) + "</td>";
          } else if (k === 2) {
            html +=
              '<td><span class="sev ' +
              sevClass(cell) +
              '">' +
              esc(cell) +
              "</span></td>";
          } else if (k === 3) {
            html += '<td class="note">' + esc(cell) + "</td>";
          } else {
            html += "<td>" + esc(cell) + "</td>";
          }
        }
        html += "</tr>";
      }
      html += "</tbody></table></div></section>";
    }
    main.innerHTML = html;
    codesBuilt = true;
  }

  function filterCodes() {
    var q = (qEl.value || "").trim().toLowerCase();
    var terms = q ? q.split(/\s+/).filter(Boolean) : [];
    var shownRows = 0;
    var shownSections = 0;

    for (var i = 0; i < data.length; i++) {
      var sec = document.getElementById("sec-" + data[i].id);
      if (!sec) continue;
      var catOk = activeCat === "all" || activeCat === data[i].id;
      var rows = sec.querySelectorAll("tbody tr");
      var visibleInSec = 0;

      for (var j = 0; j < rows.length; j++) {
        var hay = rows[j].getAttribute("data-hay") || "";
        var match = true;
        for (var t = 0; t < terms.length; t++) {
          if (hay.indexOf(terms[t]) === -1) {
            match = false;
            break;
          }
        }
        var show = catOk && match;
        rows[j].classList.toggle("hidden", !show);
        if (show) {
          visibleInSec++;
          shownRows++;
        }
      }

      var showSec = catOk && (terms.length === 0 || visibleInSec > 0);
      if (catOk && terms.length > 0 && visibleInSec === 0) showSec = false;
      if (!catOk) showSec = false;

      sec.classList.toggle("hidden", !showSec);
      if (showSec) shownSections++;

      var countEl = sec.querySelector("[data-count]");
      if (countEl) {
        countEl.textContent = visibleInSec + " / " + rows.length;
      }
    }

    emptyEl.classList.toggle("hidden", shownRows > 0);
    statsEl.textContent =
      shownRows +
      " code rows · " +
      shownSections +
      " sections" +
      (q ? ' · "' + q + '"' : "");
  }

  /* ---------- docs tabs (cheatsheets / playbooks) ---------- */
  function listFor(kind) {
    return docs[kind] || [];
  }

  function renderDocNav(kind) {
    var nav = document.getElementById("nav-" + kind);
    var list = listFor(kind);
    var q = (qEl.value || "").trim().toLowerCase();
    var terms = q ? q.split(/\s+/).filter(Boolean) : [];
    var html = "";
    var visible = 0;
    var firstVisibleId = null;

    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      var hay = (d.search || "") + " " + (d.title || "").toLowerCase();
      var match = true;
      for (var t = 0; t < terms.length; t++) {
        if (hay.indexOf(terms[t]) === -1) {
          match = false;
          break;
        }
      }
      if (!match) continue;
      visible++;
      if (!firstVisibleId) firstVisibleId = d.id;
      var isActive = activeDoc[kind] === d.id;
      html +=
        '<button type="button" class="doc-link' +
        (isActive ? " active" : "") +
        '" data-id="' +
        esc(d.id) +
        '">' +
        esc(d.title) +
        "</button>";
    }

    if (!html) {
      html = '<p class="muted small">No matching docs.</p>';
    }
    nav.innerHTML = html;

    // keep selection valid
    if (activeDoc[kind]) {
      var still = false;
      for (var j = 0; j < list.length; j++) {
        if (list[j].id === activeDoc[kind]) {
          var h = (list[j].search || "") + " " + list[j].title.toLowerCase();
          still = true;
          for (var u = 0; u < terms.length; u++) {
            if (h.indexOf(terms[u]) === -1) {
              still = false;
              break;
            }
          }
          break;
        }
      }
      if (!still) activeDoc[kind] = firstVisibleId;
    } else {
      activeDoc[kind] = firstVisibleId;
    }

    showDoc(kind, activeDoc[kind]);
    statsEl.textContent =
      visible +
      " / " +
      list.length +
      " " +
      kind +
      (q ? ' · "' + q + '"' : "");
  }

  function showDoc(kind, id) {
    var view = document.getElementById("view-" + kind);
    var nav = document.getElementById("nav-" + kind);
    var list = listFor(kind);
    var doc = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        doc = list[i];
        break;
      }
    }
    var links = nav.querySelectorAll(".doc-link");
    for (var j = 0; j < links.length; j++) {
      links[j].classList.toggle(
        "active",
        links[j].getAttribute("data-id") === id
      );
    }
    if (!doc) {
      view.innerHTML = '<p class="muted">Select an item from the list.</p>';
      return;
    }
    activeDoc[kind] = id;
    view.innerHTML = doc.html;
    view.scrollTop = 0;
  }

  function applyFilter() {
    if (activeTab === "codes") {
      buildTables();
      filterCodes();
    } else if (activeTab === "cheatsheets" || activeTab === "playbooks") {
      renderDocNav(activeTab);
    }
  }

  function init() {
    buildChips();
    buildTables();

    tabsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".tab");
      if (!btn) return;
      setTab(btn.getAttribute("data-tab"));
    });

    chipsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      activeCat = btn.getAttribute("data-id");
      var all = chipsEl.querySelectorAll(".chip");
      for (var j = 0; j < all.length; j++) {
        all[j].classList.toggle("active", all[j] === btn);
      }
      if (activeTab === "codes") filterCodes();
    });

    function navClick(kind) {
      return function (e) {
        var btn = e.target.closest(".doc-link");
        if (!btn) return;
        showDoc(kind, btn.getAttribute("data-id"));
      };
    }
    document
      .getElementById("nav-cheatsheets")
      .addEventListener("click", navClick("cheatsheets"));
    document
      .getElementById("nav-playbooks")
      .addEventListener("click", navClick("playbooks"));

    qEl.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyFilter, 80);
    });

    document.addEventListener("keydown", function (e) {
      if (
        e.key === "/" &&
        document.activeElement !== qEl &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        var tag =
          (document.activeElement && document.activeElement.tagName) || "";
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          qEl.focus();
          qEl.select();
        }
      }
      if (e.key === "Escape" && document.activeElement === qEl) {
        qEl.value = "";
        applyFilter();
        qEl.blur();
      }
    });

    // default first docs selected
    if (docs.cheatsheets && docs.cheatsheets[0]) {
      activeDoc.cheatsheets = docs.cheatsheets[0].id;
    }
    if (docs.playbooks && docs.playbooks[0]) {
      activeDoc.playbooks = docs.playbooks[0].id;
    }

    setTab("codes");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
