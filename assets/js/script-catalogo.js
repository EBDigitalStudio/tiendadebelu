/**
 * =============================================
 * TIENDA DE BELU — catalogo.js
 * Filtros, búsqueda, paginación y WhatsApp
 * =============================================
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     CONFIGURACIÓN INTERNA (no expuesta al DOM)
  ───────────────────────────────────────────*/
  const CONFIG = Object.freeze({
    WA_NUMBER:     "595992863948",
    ITEMS_PER_PAGE: 8,
    SCROLL_TARGET: ".cat-controls", // a dónde sube al cambiar página
  });

  /* ─────────────────────────────────────────
     ESTADO PRIVADO
  ───────────────────────────────────────────*/
  let state = {
    currentPage:     1,
    activeCategory:  "todos",
    searchQuery:     "",
  };

  /* ─────────────────────────────────────────
     REFERENCIAS AL DOM (se resuelven una sola vez)
  ───────────────────────────────────────────*/
  const dom = {
    grid:         () => document.getElementById("catProductGrid"),
    cols:         () => document.querySelectorAll(".cat-product-col"),
    filterBtns:   () => document.querySelectorAll(".cat-filter-btn"),
    searchInput:  () => document.getElementById("catSearchInput"),
    searchClear:  () => document.getElementById("catSearchClear"),
    resultsCount: () => document.getElementById("catResultsCount"),
    emptyState:   () => document.getElementById("catEmptyState"),
    pageNumbers:  () => document.getElementById("catPageNumbers"),
    pagePrev:     () => document.querySelector(".cat-page-prev"),
    pageNext:     () => document.querySelector(".cat-page-next"),
    pagination:   () => document.querySelector(".cat-pagination"),
  };

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────*/

  /**
   * Normaliza texto: minúsculas + sin tildes
   * Hace la búsqueda más tolerante
   */
  function normalize(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /**
   * Lee el precio desde el atributo data-price del col,
   * nunca del texto visible del DOM.
   * Así el usuario no puede modificarlo desde "Inspeccionar".
   */
  function safeReadProduct(col) {
    return {
      name:     col.dataset.name     || "",
      category: col.dataset.category || "",
      price:    col.dataset.price    || "",   // <-- del atributo, no del DOM visible
      img:      col.dataset.img      || "",
    };
  }

  /* ─────────────────────────────────────────
     FILTRADO — devuelve los cols que pasan
     los filtros activos de categoría + búsqueda
  ───────────────────────────────────────────*/
  function getFilteredCols() {
    const cols  = Array.from(dom.cols());
    const cat   = state.activeCategory;
    const query = normalize(state.searchQuery.trim());

    return cols.filter(col => {
      const data = safeReadProduct(col);

      // Filtro por categoría
      const matchCat =
        cat === "todos" || data.category === cat;

      // Filtro por búsqueda
      const matchSearch =
        query === "" || normalize(data.name).includes(query);

      return matchCat && matchSearch;
    });
  }

  /* ─────────────────────────────────────────
     RENDER — muestra u oculta cards según
     filtros + página actual
  ───────────────────────────────────────────*/
  function render() {
    const filtered = getFilteredCols();
    const all      = Array.from(dom.cols());
    const total    = filtered.length;

    const { ITEMS_PER_PAGE } = CONFIG;
    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

    // Asegurar que la página actual sea válida
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const end   = start + ITEMS_PER_PAGE;

    // Crear Set de cols visibles para O(1) lookup
    const visibleSet = new Set(filtered.slice(start, end));

    // Mostrar / ocultar cada col
    all.forEach(col => {
      col.style.display = visibleSet.has(col) ? "" : "none";
    });

    // Estado vacío
    const empty = dom.emptyState();
    if (empty) empty.style.display = total === 0 ? "flex" : "none";

    // Contador de resultados
    updateResultsCount(total);

    // Paginación
    renderPagination(total, totalPages);
  }

  /* ─────────────────────────────────────────
     CONTADOR DE RESULTADOS
  ───────────────────────────────────────────*/
  function updateResultsCount(total) {
    const el = dom.resultsCount();
    if (!el) return;

    if (total === 0) {
      el.innerHTML = "Sin resultados";
    } else if (total === 1) {
      el.innerHTML = "Mostrando <strong>1</strong> producto";
    } else {
      el.innerHTML = `Mostrando <strong>${total}</strong> productos`;
    }
  }

  /* ─────────────────────────────────────────
     PAGINACIÓN — genera botones dinámicamente
  ───────────────────────────────────────────*/
  function renderPagination(total, totalPages) {
    const numbersEl  = dom.pageNumbers();
    const prevBtn    = dom.pagePrev();
    const nextBtn    = dom.pageNext();
    const paginEl    = dom.pagination();

    if (!numbersEl || !prevBtn || !nextBtn) return;

    // Ocultar paginación si hay 1 sola página
    if (paginEl) paginEl.style.display = totalPages <= 1 ? "none" : "flex";

    // Limpiar números anteriores
    numbersEl.innerHTML = "";

    // Generar botones de página con lógica de puntos suspensivos
    const pages = getPaginationRange(state.currentPage, totalPages);

    pages.forEach(p => {
      if (p === "...") {
        const span = document.createElement("span");
        span.className = "cat-page-dots";
        span.textContent = "…";
        numbersEl.appendChild(span);
        return;
      }

      const btn = document.createElement("button");
      btn.className = "cat-page-num" + (p === state.currentPage ? " active" : "");
      btn.dataset.page = p;
      btn.textContent = p;
      btn.addEventListener("click", () => goToPage(p));
      numbersEl.appendChild(btn);
    });

    // Estado de botones anterior / siguiente
    prevBtn.disabled = state.currentPage <= 1;
    nextBtn.disabled = state.currentPage >= totalPages;
  }

  /**
   * Genera el rango de páginas con puntos suspensivos
   * Ej: [1, 2, "...", 8, 9] para currentPage=2, total=9
   */
  function getPaginationRange(current, total) {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];

    if (current <= 3) {
      pages.push(1, 2, 3, "...", total);
    } else if (current >= total - 2) {
      pages.push(1, "...", total - 2, total - 1, total);
    } else {
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }

    return pages;
  }

  /* ─────────────────────────────────────────
     NAVEGACIÓN DE PÁGINAS
  ───────────────────────────────────────────*/
  function goToPage(page) {
    state.currentPage = page;
    render();
    scrollToTop();
  }

  function scrollToTop() {
    const target = document.querySelector(CONFIG.SCROLL_TARGET);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /* ─────────────────────────────────────────
     WHATSAPP — mensaje seguro desde data attrs
     El precio se lee desde data-price del col,
     nunca del texto visible del HTML.
  ───────────────────────────────────────────*/
  function buildWAMessage(col) {
    const { name, price, img } = safeReadProduct(col);

    // Construir URL absoluta de la imagen si es relativa
    const imgUrl = img
      ? new URL(img, window.location.href).href
      : "";

    const lines = [
      "Hola Tienda de Belu 😊",
      "Quisiera consultar por este producto:",
      "",
      `Producto: ${name}`,
      `Precio: ${price}`,
      imgUrl ? `Imagen de referencia: ${imgUrl}` : "",
      "",
      "¿Está disponible?",
    ];

    return lines.filter(l => l !== null).join("\n");
  }

  function openWhatsApp(col) {
    const msg = buildWAMessage(col);
    const url = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  /* ─────────────────────────────────────────
     INICIALIZACIÓN DE EVENTOS
  ───────────────────────────────────────────*/

  /** Filtros de categoría */
  function initFilters() {
    dom.filterBtns().forEach(btn => {
      btn.addEventListener("click", () => {
        // Desactivar todos, activar el clickeado
        dom.filterBtns().forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        state.activeCategory = btn.dataset.category || "todos";
        state.currentPage    = 1;
        render();
      });
    });
  }

  /** Buscador */
  function initSearch() {
    const input    = dom.searchInput();
    const clearBtn = dom.searchClear();

    if (!input) return;

    input.addEventListener("input", () => {
      state.searchQuery = input.value;
      state.currentPage = 1;

      // Mostrar / ocultar botón de limpiar
      if (clearBtn) {
        clearBtn.style.display = input.value.length > 0 ? "flex" : "none";
      }

      render();
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        input.value        = "";
        state.searchQuery  = "";
        state.currentPage  = 1;
        clearBtn.style.display = "none";
        input.focus();
        render();
      });
    }
  }

  /** Paginación — botones anterior / siguiente */
  function initPaginationButtons() {
    const prevBtn = dom.pagePrev();
    const nextBtn = dom.pageNext();

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (state.currentPage > 1) goToPage(state.currentPage - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const filtered   = getFilteredCols();
        const totalPages = Math.ceil(filtered.length / CONFIG.ITEMS_PER_PAGE);
        if (state.currentPage < totalPages) goToPage(state.currentPage + 1);
      });
    }
  }

  /** Botones WhatsApp en las cards */
  function initWAButtons() {
    // Delegación de eventos en el grid completo (más eficiente)
    const grid = dom.grid();
    if (!grid) return;

    grid.addEventListener("click", e => {
      const btn = e.target.closest(".cat-card__wa-btn");
      if (!btn) return;

      const col = btn.closest(".cat-product-col");
      if (!col) return;

      openWhatsApp(col);
    });
  }

  /* ─────────────────────────────────────────
     ARRANQUE
  ───────────────────────────────────────────*/
  function init() {
    initFilters();
    initSearch();
    initPaginationButtons();
    initWAButtons();
    render(); // render inicial
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();