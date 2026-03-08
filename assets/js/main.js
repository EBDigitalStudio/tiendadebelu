/* ========================================
   TIENDA DE BELU — main.js
   Script principal compartido en todas las páginas
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

    // ========================================
    // ANIMACIÓN HAMBURGUESA
    // ========================================

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navbarCollapse = document.getElementById('navbarNav');

    if (hamburgerBtn && navbarCollapse) {
        hamburgerBtn.addEventListener('click', function () {
            this.classList.toggle('is-active');
        });

        navbarCollapse.addEventListener('hidden.bs.collapse', function () {
            hamburgerBtn.classList.remove('is-active');
        });

        navbarCollapse.addEventListener('shown.bs.collapse', function () {
            hamburgerBtn.classList.add('is-active');
        });
    }

    // ========================================
    // SCROLL SUAVE PARA LINKS INTERNOS (#)
    // ========================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 16;
                window.scrollTo({ top: targetTop, behavior: 'smooth' });

                // Cerrar menú mobile si está abierto
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) bsCollapse.hide();
            }
        });
    });

    // ========================================
    // FADE-IN AL HACER SCROLL (Intersection Observer)
    // ========================================

    const scrollFadeEls = document.querySelectorAll('.scroll-fade');

    if (scrollFadeEls.length > 0) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = (Array.from(scrollFadeEls).indexOf(entry.target) % 4) * 80;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        scrollFadeEls.forEach(el => fadeObserver.observe(el));
    }

    // ========================================
    // ACTIVE NAV LINK
    // Páginas normales: detecta por URL
    // index.html: detecta por sección visible en scroll
    // ========================================

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    // -- Activar por URL (para catalogo, acerca, contacto) --
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('#')[0];
        if (linkPage && linkPage === currentPage) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });

    // -- Activar por sección visible (solo en index.html) --
    const sections = document.querySelectorAll('section[id]');

    if (sections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active'));

                    const activeLink = document.querySelector(
                        `.navbar-nav .nav-link[href="#${entry.target.id}"]`
                    );

                    if (activeLink) {
                        activeLink.classList.add('active');
                    } else {
                        // Si la sección visible no tiene link directo, activar Inicio
                        const inicioLink = document.querySelector('.navbar-nav .nav-link[href="index.html"]');
                        if (inicioLink) inicioLink.classList.add('active');
                    }
                }
            });
        }, {
            // Se activa cuando la sección ocupa el centro de la pantalla
            rootMargin: '-30% 0px -60% 0px'
        });

        sections.forEach(section => sectionObserver.observe(section));
    }

});