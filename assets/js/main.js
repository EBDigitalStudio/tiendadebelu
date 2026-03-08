/* =============================================
   TIENDA DE BELU — MAIN V2
   Scripts compartidos: Navbar, Scroll Fade,
   Hamburguesa, WhatsApp Float
   Se aplica a TODAS las páginas del sitio
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // NAVBAR — scroll effect
  // ============================================
  const v2Navbar  = document.querySelector('.v2-navbar');
  const v2Header  = document.querySelector('.v2-header');
  const v2Hero    = document.querySelector('.v2-hero');

  function updateNavbar() {
    if (!v2Navbar) return;
    if (v2Hero) {
      const heroBottom = v2Hero.getBoundingClientRect().bottom;
      v2Navbar.classList.toggle('scrolled', heroBottom < 80);
    } else {
      v2Navbar.classList.add('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ============================================
  // HAMBURGUESA — animación X
  // ============================================
  const v2HamBtn = document.getElementById('v2HamburgerBtn');
  if (v2HamBtn) {
    const bsCollapse = document.getElementById('v2NavMenu');
    if (bsCollapse) {
      bsCollapse.addEventListener('show.bs.collapse', () => v2HamBtn.classList.add('is-active'));
      bsCollapse.addEventListener('hide.bs.collapse', () => v2HamBtn.classList.remove('is-active'));
    }
  }

  // ============================================
  // SCROLL FADE-IN — Intersection Observer
  // ============================================
  const v2Fades = document.querySelectorAll('.v2-scroll-fade');
  if (v2Fades.length > 0) {
    const v2Observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('v2-visible');
          v2Observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    v2Fades.forEach(function (el) { v2Observer.observe(el); });
  }

  // ============================================
  // HERO — ajuste de margin para navbar sticky
  // ============================================
  (function adjustHero() {
    const nav  = v2Header;
    const hero = v2Hero;
    if (!nav || !hero) return;
    const h = nav.getBoundingClientRect().height;
    hero.style.marginTop  = `-${h}px`;
    hero.style.paddingTop = `${h}px`;
    hero.style.minHeight  = `calc(100svh + ${h}px)`;
  })();

  // ============================================
  // FAVORITO — toggle corazón en cards de producto
  // ============================================
  document.querySelectorAll('.v2-prod-fav').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const icon = this.querySelector('i');
      if (!icon) return;
      if (icon.classList.contains('fa-regular')) {
        icon.classList.replace('fa-regular', 'fa-solid');
        this.style.color = '#ff1493';
      } else {
        icon.classList.replace('fa-solid', 'fa-regular');
        this.style.color = '';
      }
    });
  });

  // ============================================
  // SCROLL SPY — solo en el index (cuando hay hero)
  //
  // Detecta qué sección está en pantalla y activa
  // el nav-link correspondiente con la sombra blanca.
  // "Inicio" activo = arriba en el hero.
  // "¿Qué Ofrecemos?" activo = al llegar a #v2-ofrecemos.
  // ============================================
  if (v2Hero) {

    const navLinks = document.querySelectorAll('.v2-navbar .nav-link');

    // Secciones con scroll spy: [id, href del nav-link]
    const spySections = [
      { id: 'v2-ofrecemos' , href: '#v2-ofrecemos'   }
    ];

    function clearActive() {
      navLinks.forEach(link => link.classList.remove('active'));
    }

    function setActive(href) {
      navLinks.forEach(function (link) {
        if (link.getAttribute('href') === href) {
          link.classList.add('active');
        }
      });
    }

    function runScrollSpy() {
      const navH   = v2Header ? v2Header.getBoundingClientRect().height : 0;
      const scrollY = window.scrollY;
      const offset  = navH + 80; // margen de activación
      let   active  = null;

      // Recorrer secciones de abajo hacia arriba
      // para que la última que supere el offset gane
      spySections.forEach(function (item) {
        const el = document.getElementById(item.id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + scrollY - offset;
        if (scrollY >= top) {
          active = item.href;
        }
      });

      clearActive();

      if (active) {
        setActive(active);          // sección interna activa
      } else {
        setActive('index.html');    // arriba → Inicio activo
      }
    }

    window.addEventListener('scroll', runScrollSpy, { passive: true });
    runScrollSpy(); // ejecutar al cargar
  }

});