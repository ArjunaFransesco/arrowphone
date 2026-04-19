/* ============================================================
   NEXUS STORE — script.js
   All interactivity and animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. NAVBAR SCROLL EFFECT
    // ============================================================
    const mainNav = document.getElementById('mainNav');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }

        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================================================
    // 2. SMOOTH SCROLL FOR NAV LINKS
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });

                // Close mobile nav if open
                const navMenu = document.getElementById('navMenu');
                if (navMenu.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
                    bsCollapse.hide();
                }
            }
        });
    });

    // ============================================================
    // 3. SEARCH OVERLAY
    // ============================================================
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput.focus(), 200);
        document.body.style.overflow = 'hidden';
    });

    const closeSearch = () => {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    searchClose.addEventListener('click', closeSearch);

    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) closeSearch();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });

    // ============================================================
    // 4. SCROLL REVEAL ANIMATION
    // ============================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger cards in a grid
                const siblings = entry.target.parentElement.querySelectorAll('[data-reveal]');
                let delay = 0;
                siblings.forEach((el, idx) => {
                    if (el === entry.target) delay = idx * 80;
                });

                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay);

                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -50px 0px'
    });

    const revealRightObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealRightObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
    document.querySelectorAll('[data-reveal-right]').forEach(el => revealRightObserver.observe(el));

    // ============================================================
    // 5. COUNTING ANIMATION (STATS)
    // ============================================================
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const end = parseInt(target.getAttribute('data-count'));
                const duration = 1800;
                const start = 0;
                const startTime = performance.now();

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out quad
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(start + (end - start) * eased);
                    target.textContent = current;
                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        target.textContent = end;
                    }
                };

                requestAnimationFrame(updateCount);
                countObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

    // ============================================================
    // 6. PRODUCT FILTER
    // ============================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter cards with animation
            productCards.forEach((card, i) => {
                const category = card.getAttribute('data-category') || '';
                const matches = filter === 'semua' || category.includes(filter);

                if (matches) {
                    card.classList.remove('hidden');
                    card.style.animation = 'none';
                    card.offsetHeight; // reflow
                    card.style.animation = `fadeInUp 0.4s ease ${i * 0.05}s both`;
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Inject fadeInUp keyframe dynamically
    if (!document.querySelector('#dynamic-styles')) {
        const style = document.createElement('style');
        style.id = 'dynamic-styles';
        style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
        document.head.appendChild(style);
    }

    // ============================================================
    // 7. TESTIMONIAL SLIDER
    // ============================================================
    const testiTrack = document.getElementById('testiTrack');
    const testiPrev = document.getElementById('testiPrev');
    const testiNext = document.getElementById('testiNext');
    const testiDotsContainer = document.getElementById('testiDots');

    const cards = testiTrack.querySelectorAll('.testi-card');
    let currentIndex = 0;
    let autoSlideTimer;

    // Determine visible cards per view
    const getVisible = () => {
        if (window.innerWidth >= 992) return 3;
        if (window.innerWidth >= 576) return 2;
        return 1;
    };

    const maxIndex = () => Math.max(0, cards.length - getVisible());

    // Build dots
    const buildDots = () => {
        testiDotsContainer.innerHTML = '';
        const count = maxIndex() + 1;
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('button');
            dot.className = 'testi-dot' + (i === currentIndex ? ' active' : '');
            dot.addEventListener('click', () => goTo(i));
            testiDotsContainer.appendChild(dot);
        }
    };

    const updateDots = () => {
        testiDotsContainer.querySelectorAll('.testi-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    };

    const goTo = (index) => {
        currentIndex = Math.max(0, Math.min(index, maxIndex()));
        const cardWidth = cards[0].offsetWidth + 24; // gap = 1.5rem = 24px
        testiTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        updateDots();
        resetAutoSlide();
    };

    testiPrev.addEventListener('click', () => goTo(currentIndex - 1));
    testiNext.addEventListener('click', () => goTo(currentIndex + 1));

    // Auto slide
    const startAutoSlide = () => {
        autoSlideTimer = setInterval(() => {
            const next = currentIndex < maxIndex() ? currentIndex + 1 : 0;
            goTo(next);
        }, 4000);
    };

    const resetAutoSlide = () => {
        clearInterval(autoSlideTimer);
        startAutoSlide();
    };

    // Touch/swipe support
    let touchStartX = 0;
    testiTrack.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    testiTrack.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
        }
    });

    buildDots();
    startAutoSlide();

    window.addEventListener('resize', () => {
        buildDots();
        goTo(Math.min(currentIndex, maxIndex()));
    });

    // ============================================================
    // 8. NAVBAR ACTIVE LINK ON SCROLL
    // ============================================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nexus-nav .nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => sectionObserver.observe(s));

    // ============================================================
    // 9. PRODUCT CARD HOVER RIPPLE (subtle)
    // ============================================================
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
        });
    });

    // ============================================================
    // 10. BRAND CARD CLICK EFFECT
    // ============================================================
    document.querySelectorAll('.brand-card').forEach(card => {
        card.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // ============================================================
    // 11. NEWSLETTER FORM
    // ============================================================
    const newsletterBtn = document.querySelector('.newsletter-section .btn-primary-solid');
    const newsletterInput = document.querySelector('.newsletter-input');

    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', () => {
            const email = newsletterInput.value.trim();
            if (email && email.includes('@')) {
                newsletterBtn.textContent = '✓ Terdaftar!';
                newsletterBtn.style.background = '#22c55e';
                newsletterInput.value = '';
                setTimeout(() => {
                    newsletterBtn.textContent = 'Subscribe';
                    newsletterBtn.style.background = '';
                }, 3000);
            } else {
                newsletterInput.style.borderColor = '#FF3B30';
                setTimeout(() => {
                    newsletterInput.style.borderColor = '';
                }, 1500);
            }
        });
    }

    // ============================================================
    // 12. ADD TO CART FEEDBACK
    // ============================================================
    document.querySelectorAll('.overlay-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const original = this.innerHTML;
            this.innerHTML = '<i class="bi bi-check-lg"></i> Ditambahkan!';
            this.style.background = '#22c55e';

            // Update cart badge
            const badge = document.querySelector('.cart-badge');
            if (badge) {
                const count = parseInt(badge.textContent) + 1;
                badge.textContent = count;
                badge.style.transform = 'scale(1.4)';
                setTimeout(() => { badge.style.transform = ''; }, 300);
            }

            setTimeout(() => {
                this.innerHTML = original;
                this.style.background = '';
            }, 2000);
        });
    });

    // ============================================================
    // 13. WISHLIST TOGGLE
    // ============================================================
    document.querySelectorAll('.overlay-btn-icon').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            if (icon.classList.contains('bi-heart')) {
                icon.classList.remove('bi-heart');
                icon.classList.add('bi-heart-fill');
                this.style.background = '#FF3B30';
                this.style.color = '#fff';
                this.style.borderColor = '#FF3B30';
            } else {
                icon.classList.remove('bi-heart-fill');
                icon.classList.add('bi-heart');
                this.style.background = '';
                this.style.color = '';
                this.style.borderColor = '';
            }
        });
    });

    // ============================================================
    // 14. FEATURE CARD TILT
    // ============================================================
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.4s ease';
        });
    });

    // ============================================================
    // 15. PHONE SHOWCASE — MOUSE PARALLAX
    // ============================================================
    const phoneShowcase = document.querySelector('.hero-phone-showcase');
    if (phoneShowcase) {
        document.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;
            phoneShowcase.style.transform = `perspective(1000px) rotateY(${dx * 5}deg) rotateX(${-dy * 3}deg)`;
        });

        document.addEventListener('mouseleave', () => {
            phoneShowcase.style.transform = '';
        });
    }

    console.log('%cArrawphone Store ✦ Loaded Successfully', 'color:#0057FF;font-family:Plus Jakarta Sans;font-weight:800;font-size:14px;');
});