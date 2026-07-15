document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close mobile menu when clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking outside
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function (e) {
            if (e.target === mobileMenu) {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function setActiveLink() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveLink);

    // Smooth scroll for navigation links
    const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    // Quote Form Submission
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = quoteForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;

            const formData = new FormData(quoteForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const apiUrl = 'https://us-central1-manny-express.cloudfunctions.net/sendQuoteEmail'

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Google Ads Conversion Event with callback to redirect
                    gtag('event', 'conversion', {
                        'send_to': 'AW-17649539123/bOV6CK2Lv-gbELOw-t9B',
                        'event_callback': function() {
                            window.location.href = '/merci.html';
                        }
                    });

                    // Fallback redirect if gtag callback doesn't fire within 1 second
                    setTimeout(function() {
                        window.location.href = '/merci.html';
                    }, 1000);
                } else {
                    throw new Error(result.error || 'Une erreur est survenue');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Une erreur est survenue lors de l\'envoi du formulaire. Veuillez réessayer ou nous contacter par téléphone.');
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    // Scroll to featured pricing card on mobile
    if (window.innerWidth <= 768) {
        const pricingGrid = document.querySelector('.pricing-grid');
        const featuredCard = document.querySelector('.pricing-card.featured');

        if (pricingGrid && featuredCard) {
            // Calculate center position
            const scrollLeft = featuredCard.offsetLeft - (pricingGrid.clientWidth - featuredCard.clientWidth) / 2;
            pricingGrid.scrollLeft = scrollLeft;
        }
    }

    // Testimonials Carousel
    function initializeTestimonialSlider() {
        const track = document.querySelector('.testimonials-track');
        if (!track) return;

        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        let cards = Array.from(track.children);

        // Don't initialize if there are no cards (e.g. still loading or error)
        if (cards.length === 0 || cards[0].id === 'loading-reviews') return;

        // Reset state
        let currentIndex = 0;
        const GAP = 24; // 1.5rem = 24px

        // Remove old event listeners by replacing buttons with clones to ensure clean slate
        // This is important if `initializeTestimonialSlider` is called multiple times
        const newPrevBtn = prevBtn.cloneNode(true);
        const newNextBtn = nextBtn.cloneNode(true);
        if (prevBtn.parentNode) prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        if (nextBtn.parentNode) nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

        function updateSlider() {
            // Reassign cards in case dom changed
            cards = Array.from(track.children);
            if (cards.length === 0) return;

            const cardWidth = cards[0].getBoundingClientRect().width;
            const slideWidth = cardWidth + GAP;

            // Move track
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

            // Update button states
            updateButtonState(cards);
        }

        function getVisibleCards() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 768) return 2;
            return 1;
        }

        function updateButtonState(currentCards) {
            const visibleCards = getVisibleCards();
            const totalCards = currentCards.length;
            const maxIndex = Math.max(0, totalCards - visibleCards);

            newPrevBtn.style.opacity = currentIndex <= 0 ? '0.5' : '1';
            newPrevBtn.style.cursor = currentIndex <= 0 ? 'default' : 'pointer';

            newNextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
            newNextBtn.style.cursor = currentIndex >= maxIndex ? 'default' : 'pointer';
        }

        newNextBtn.addEventListener('click', () => {
            const currentCards = Array.from(track.children);
            const visibleCards = getVisibleCards();
            const maxIndex = Math.max(0, currentCards.length - visibleCards);

            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        });

        newPrevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });

        // Initialize display
        track.style.transform = `translateX(0px)`;
        updateButtonState(cards);

        // Handle window resize
        let resizeTimer;
        // Clean up old resize listener (simplistic approach: we just bind one new listener or rely on existing one)
        window.removeEventListener('resize', window.testimonialResizeHandler);
        window.testimonialResizeHandler = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const currentCards = Array.from(track.children);
                const visibleCards = getVisibleCards();
                const maxIndex = Math.max(0, currentCards.length - visibleCards);
                if (currentIndex > maxIndex) currentIndex = maxIndex;
                updateSlider();
            }, 100);
        };
        window.addEventListener('resize', window.testimonialResizeHandler);
    }

    // Expose globally so inline scripts can call it after fetching reviews
    window.initializeTestimonialSlider = initializeTestimonialSlider;

    // Listen for custom event triggered by the Google Places API callback
    document.addEventListener('reviewsLoaded', initializeTestimonialSlider);

    // Call once initially just in case static fallback exists
    initializeTestimonialSlider();

    // Formules comparison carousel
    const fcarScroll = document.getElementById('formulesCarousel');
    if (fcarScroll) {
        const fcar = fcarScroll.closest('.fcar');
        const prevBtn = fcar.querySelector('.fcar-prev');
        const nextBtn = fcar.querySelector('.fcar-next');

        function fcarStep() {
            const col = fcarScroll.querySelector('.ft-col');
            return col ? col.getBoundingClientRect().width : 190;
        }

        function fcarUpdate() {
            const fits = fcarScroll.scrollWidth <= fcarScroll.clientWidth + 2;
            fcar.classList.toggle('fcar-static', fits);
            const maxScroll = fcarScroll.scrollWidth - fcarScroll.clientWidth;
            prevBtn.disabled = fcarScroll.scrollLeft <= 2;
            nextBtn.disabled = fcarScroll.scrollLeft >= maxScroll - 2;
        }

        prevBtn.addEventListener('click', () => fcarScroll.scrollBy({ left: -fcarStep(), behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => fcarScroll.scrollBy({ left: fcarStep(), behavior: 'smooth' }));
        fcarScroll.addEventListener('scroll', fcarUpdate);
        window.addEventListener('resize', fcarUpdate);
        fcarUpdate();

        // Global involvement slider (mobile): lever is two-way bound to the scroll
        const track = document.getElementById('fcarSliderTrack');
        const thumb = document.getElementById('fcarSliderThumb');
        const fill = document.getElementById('fcarSliderFill');
        const curName = document.getElementById('fcarCurName');
        const vousPct = document.getElementById('fcarVousPct');
        const nousPct = document.getElementById('fcarNousPct');

        const formules = Array.from(fcarScroll.querySelectorAll('thead .ft-col')).map(col => {
            const gauge = col.querySelector('.ft-gauge');
            const pct = gauge ? parseInt(gauge.style.getPropertyValue('--pct'), 10) || 0 : 0;
            const name = col.querySelector('.ft-name');
            return { name: name ? name.textContent.trim() : '', pct: pct };
        });

        if (track && thumb && formules.length > 1) {
            let dragging = false;
            let snapTimer;

            const maxScroll = () => Math.max(0, fcarScroll.scrollWidth - fcarScroll.clientWidth);
            const fraction = () => {
                const max = maxScroll();
                return max > 0 ? fcarScroll.scrollLeft / max : 0;
            };

            function renderSlider() {
                const frac = fraction();
                thumb.style.left = (frac * 100) + '%';
                if (fill) fill.style.width = (frac * 100) + '%';
                const f = formules[Math.round(frac * (formules.length - 1))];
                if (f) {
                    if (curName) curName.textContent = f.name;
                    if (vousPct) vousPct.textContent = (100 - f.pct) + '%';
                    if (nousPct) nousPct.textContent = f.pct + '%';
                }
            }

            function snapToNearest() {
                const max = maxScroll();
                if (max <= 0) return;
                const idx = Math.round(fraction() * (formules.length - 1));
                const target = (idx / (formules.length - 1)) * max;
                if (Math.abs(fcarScroll.scrollLeft - target) > 2) {
                    fcarScroll.scrollTo({ left: target, behavior: 'smooth' });
                }
            }

            function seek(clientX) {
                const rect = track.getBoundingClientRect();
                const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                fcarScroll.scrollLeft = frac * maxScroll();
                renderSlider();
            }

            thumb.addEventListener('pointerdown', (e) => {
                dragging = true;
                thumb.setPointerCapture(e.pointerId);
                e.preventDefault();
            });
            thumb.addEventListener('pointermove', (e) => {
                if (dragging) seek(e.clientX);
            });
            const endDrag = () => {
                if (!dragging) return;
                dragging = false;
                snapToNearest();
            };
            thumb.addEventListener('pointerup', endDrag);
            thumb.addEventListener('pointercancel', endDrag);
            track.addEventListener('pointerdown', (e) => {
                if (e.target === thumb) return;
                seek(e.clientX);
                snapToNearest();
            });

            // Keep the slider in sync when the table is swiped, and snap on rest
            fcarScroll.addEventListener('scroll', () => {
                renderSlider();
                if (dragging) return;
                clearTimeout(snapTimer);
                snapTimer = setTimeout(snapToNearest, 130);
            });
            window.addEventListener('resize', renderSlider);
            renderSlider();
        }

        // Sticky cloned header: a <thead> can't stick to the page top from inside a
        // horizontally-scrolling container, so we clone the scroller and pin the clone
        // (clipped to the header height) just below the navbar while the table is in view.
        const stTable = fcarScroll.querySelector('.ftable');
        const stHead = stTable ? stTable.querySelector('thead') : null;
        if (stHead) {
            const wrap = document.createElement('div');
            wrap.className = 'fcar-sticky-wrap';
            const clone = fcarScroll.cloneNode(true);
            clone.removeAttribute('id');
            wrap.appendChild(clone);
            document.body.appendChild(wrap);

            const navbar = document.querySelector('.navbar');
            let syncing = false;
            fcarScroll.addEventListener('scroll', () => {
                if (syncing) return;
                syncing = true;
                clone.scrollLeft = fcarScroll.scrollLeft;
                syncing = false;
            });
            clone.addEventListener('scroll', () => {
                if (syncing) return;
                syncing = true;
                fcarScroll.scrollLeft = clone.scrollLeft;
                syncing = false;
            });

            const cloneHead = clone.querySelector('thead');
            function stUpdate() {
                const navBottom = navbar ? navbar.getBoundingClientRect().bottom : 0;
                const rect = fcarScroll.getBoundingClientRect();
                const show = rect.top < navBottom && rect.bottom > navBottom + 20;
                if (show) {
                    // Make visible first so the clone header (which may show the bars
                    // that the mobile table hides) can be measured at the right width.
                    wrap.classList.add('is-visible');
                    wrap.style.top = navBottom + 'px';
                    wrap.style.left = rect.left + 'px';
                    wrap.style.width = rect.width + 'px';
                    wrap.style.height = cloneHead.getBoundingClientRect().height + 'px';
                    clone.scrollLeft = fcarScroll.scrollLeft;
                } else {
                    wrap.classList.remove('is-visible');
                }
            }

            window.addEventListener('scroll', stUpdate, { passive: true });
            window.addEventListener('resize', stUpdate);
            stUpdate();
        }
    }

});
