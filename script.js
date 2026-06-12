document.addEventListener('DOMContentLoaded', () => {

    // ---------- DOM ELEMENTS ----------
    // Pages
    const homePage = document.getElementById('home-page');
    const resultsPage = document.getElementById('results-page');
    const aboutPage = document.getElementById('about-page');
    const contactPage = document.getElementById('contact-page');
    const bookingPage = document.getElementById('booking-page');
    const historyPage = document.getElementById('history-page');
    
    // Containers
    const historyContainer = document.getElementById('history-container');
    const resultsContainer = document.getElementById('results-container');
    const resultsHeading = document.getElementById('results-heading');
    const resultsSubheading = document.getElementById('results-subheading');

    // Nav
    const navHome = document.getElementById('nav-home');
    const navHistory = document.getElementById('nav-history');
    const navAbout = document.getElementById('nav-about');
    const navContact = document.getElementById('nav-contact');
    const logoHome = document.getElementById('logo-home');

    // Auth
    const navAuth = document.getElementById('nav-auth');
    const navLogout = document.getElementById('nav-logout');
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth-btn');
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Forms
    const mainForm = document.getElementById('main-search-form');
    const compactForm = document.getElementById('compact-search-form');
    const bookingForm = document.getElementById('booking-form');

    // Inputs
    const originInput = document.getElementById('origin');
    const destInput = document.getElementById('destination');
    const dateInput = document.getElementById('date');
    const compactOrigin = document.getElementById('compact-origin');
    const compactDest = document.getElementById('compact-destination');
    const compactDate = document.getElementById('compact-date');

    // Buttons & Interactivity
    const swapBtnMain = document.getElementById('swap-btn-main');
    const swapBtnCompact = document.getElementById('swap-btn-compact');
    const sortSelect = document.getElementById('sort-select');
    const filterCheckboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
    const routeCards = document.querySelectorAll('.mock-route');

    // State Variables
    let currentOrigin = '';
    let currentDest = '';
    let baseRoutes = [];

    // Set today's date as min for date inputs
    const today = new Date().toISOString().split('T')[0];
    if(dateInput) dateInput.min = today;
    if(compactDate) compactDate.min = today;

    // ---------- NAVIGATION ----------
    function hideAllPages() {
        [homePage, resultsPage, aboutPage, contactPage, bookingPage, historyPage].forEach(p => {
            if (p) {
                p.classList.add('hidden-page');
                p.classList.remove('active-page');
            }
        });
        [navHome, navHistory, navAbout, navContact].forEach(nav => {
            if (nav) nav.classList.remove('active');
        });
    }

    function showHome() {
        hideAllPages();
        homePage.classList.remove('hidden-page');
        homePage.classList.add('active-page');
        if(navHome) navHome.classList.add('active');
        window.scrollTo(0, 0);
    }

    function showAbout() {
        hideAllPages();
        aboutPage.classList.remove('hidden-page');
        aboutPage.classList.add('active-page');
        if(navAbout) navAbout.classList.add('active');
        window.scrollTo(0, 0);
    }

    function showContact() {
        hideAllPages();
        contactPage.classList.remove('hidden-page');
        contactPage.classList.add('active-page');
        if(navContact) navContact.classList.add('active');
        window.scrollTo(0, 0);
    }

    async function showResults(origin, dest, date, pref = 'balanced') {
        if (!origin || !dest) return;
        hideAllPages();
        resultsPage.classList.remove('hidden-page');
        resultsPage.classList.add('active-page');

        // Sync inputs
        if(compactOrigin) compactOrigin.value = origin;
        if(compactDest) compactDest.value = dest;
        if(date && compactDate) compactDate.value = date;

        const mainPref = document.getElementById('preference');
        const compactPref = document.getElementById('compact-preference');
        if(mainPref) mainPref.value = pref;
        if(compactPref) compactPref.value = pref;

        currentOrigin = origin;
        currentDest = dest;

        if(resultsHeading) resultsHeading.textContent = `${origin} to ${dest}`;
        if(resultsSubheading) resultsSubheading.textContent = date ? `Departure on ${date}` : 'Showing best travel combinations';

        if(resultsContainer) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class='bx bx-loader-alt bx-spin' style="font-size: 3rem; color: var(--clr-primary);"></i>
                    <p>Calculating real-time routes...</p>
                </div>
            `;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/routes?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&preference=${pref}`);
            if (!response.ok) throw new Error("Failed to fetch routes");
            
            baseRoutes = await response.json();
            renderRoutes(origin, dest);
        } catch (error) {
            console.error("Route error:", error);
            if(resultsContainer) {
                resultsContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: var(--clr-white); border-radius: 8px;">
                        <i class='bx bx-error-circle' style="font-size: 3rem; color: #e74c3c; margin-bottom: 10px;"></i>
                        <h3 style="margin:0; color: var(--clr-dark);">No routes found</h3>
                        <p style="color: var(--clr-text-muted);">Please enter a valid city name.</p>
                    </div>
                `;
            }
        }
        
        window.scrollTo(0, 0);
    }

    function showBooking(summary) {
        hideAllPages();
        bookingPage.classList.remove('hidden-page');
        bookingPage.classList.add('active-page');

        const summaryEl = document.getElementById('booking-summary');
        if(summaryEl) summaryEl.textContent = summary;
        window.scrollTo(0, 0);
    }

    function showHistory() {
        hideAllPages();
        historyPage.classList.remove('hidden-page');
        historyPage.classList.add('active-page');
        if(navHistory) navHistory.classList.add('active');
        loadHistory();
        window.scrollTo(0, 0);
    }

    // ---------- EVENTS ----------
    if(navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); showHome(); });
    if(navHistory) navHistory.addEventListener('click', (e) => { e.preventDefault(); showHistory(); });
    if(navAbout) navAbout.addEventListener('click', (e) => { e.preventDefault(); showAbout(); });
    if(navContact) navContact.addEventListener('click', (e) => { e.preventDefault(); showContact(); });
    if(logoHome) logoHome.addEventListener('click', () => { showHome(); });

    if(swapBtnMain) {
        swapBtnMain.addEventListener('click', () => {
            const temp = originInput.value;
            originInput.value = destInput.value;
            destInput.value = temp;
        });
    }

    if(swapBtnCompact) {
        swapBtnCompact.addEventListener('click', () => {
            const temp = compactOrigin.value;
            compactOrigin.value = compactDest.value;
            compactDest.value = temp;
            if(compactOrigin.value && compactDest.value) {
                const pref = document.getElementById('compact-preference')?.value || 'balanced';
                showResults(compactOrigin.value, compactDest.value, compactDate.value, pref);
            }
        });
    }

    if(mainForm) {
        mainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pref = document.getElementById('preference')?.value || 'balanced';
            showResults(originInput.value, destInput.value, dateInput.value, pref);
        });
    }

    if(compactForm) {
        compactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pref = document.getElementById('compact-preference')?.value || 'balanced';
            showResults(compactOrigin.value, compactDest.value, compactDate.value, pref);
        });
    }

    routeCards.forEach(card => {
        card.addEventListener('click', () => {
            const origin = card.getAttribute('data-origin');
            const dest = card.getAttribute('data-dest');
            if(originInput) originInput.value = origin;
            if(destInput) destInput.value = dest;
            showResults(origin, dest, '');
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            if (baseRoutes.length > 0) renderRoutes(currentOrigin, currentDest);
        });
    }

    filterCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
             if (baseRoutes.length > 0) renderRoutes(currentOrigin, currentDest);
        });
    });

    // Modal Events
    const ticketModal = document.getElementById('ticket-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if(ticketModal) ticketModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (ticketModal && e.target === ticketModal) {
            ticketModal.style.display = 'none';
        }
    });

    // ---------- AUTHENTICATION ----------
    const AUTH_API_URL = 'http://localhost:5000/api/auth';
    
    function checkAuthState() {
        const token = localStorage.getItem('token');
        if (token) {
            if (navAuth) navAuth.style.display = 'none';
            if (navLogout) navLogout.style.display = 'inline-block';
            if (navHistory) navHistory.style.display = 'inline-block';
        } else {
            if (navAuth) navAuth.style.display = 'inline-block';
            if (navLogout) navLogout.style.display = 'none';
            if (navHistory) navHistory.style.display = 'none';
        }
    }

    if (navAuth) {
        navAuth.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.style.display = 'flex';
        });
    }

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'none';
            signupSection.style.display = 'block';
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupSection.style.display = 'none';
            loginSection.style.display = 'block';
        });
    }

    if (navLogout) {
        navLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            checkAuthState();
            showHome();
            alert("Logged out successfully");
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            try {
                const response = await fetch(`${AUTH_API_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                
                alert("Account created! Please login.");
                signupForm.reset();
                showLoginLink.click();
            } catch (error) {
                alert("Signup failed: " + error.message);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${AUTH_API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                loginForm.reset();
                authModal.style.display = 'none';
                checkAuthState();
                
                if (window.pendingBookingSummary) {
                    showBooking(window.pendingBookingSummary);
                    window.pendingBookingSummary = null;
                } else {
                    alert("Logged in successfully");
                }
            } catch (error) {
                alert("Login failed: " + error.message);
            }
        });
    }

    checkAuthState();

    // ---------- BOOKING ----------
    const API_BASE_URL = 'http://localhost:5000/api/bookings';

    // Payment UI Logic
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    const upiFields = document.getElementById('upi-fields');
    const cardFields = document.getElementById('card-fields');

    if (paymentRadios.length > 0) {
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'upi') {
                    if(upiFields) upiFields.style.display = 'block';
                    if(cardFields) cardFields.style.display = 'none';
                } else {
                    if(upiFields) upiFields.style.display = 'none';
                    if(cardFields) cardFields.style.display = 'block';
                }
            });
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Payment Simulation
            submitBtn.textContent = 'Processing Payment...';
            submitBtn.disabled = true;

            await new Promise(resolve => setTimeout(resolve, 2500));
            
            submitBtn.textContent = 'Payment Successful';
            await new Promise(resolve => setTimeout(resolve, 800));

            const name = document.getElementById('passenger-name').value;
            const email = document.getElementById('passenger-email').value;
            const phone = document.getElementById('passenger-phone').value;
            const age = document.getElementById('passenger-age').value;
            const gender = document.getElementById('passenger-gender').value;
            const summary = document.getElementById('booking-summary').textContent;

            const bookingData = {
                name,
                email,
                phone,
                age: Number(age),
                gender,
                summary
            };

            // Generate Ticket ID and Save to localStorage as Paid
            const localTicketId = "FYW-" + Date.now();
            const localBooking = { ...bookingData, ticketId: localTicketId, status: "Paid", bookedAt: new Date().toISOString() };
            const stored = JSON.parse(localStorage.getItem('paidBookings') || '[]');
            stored.push(localBooking);
            localStorage.setItem('paidBookings', JSON.stringify(stored));

            try {
                // Continue normal booking process
                const token = localStorage.getItem('token');
                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(bookingData)
                });

                if (!response.ok) {
                    throw new Error('Failed to create booking on the server');
                }

                alert("🎉 Booking Confirmed!");
                bookingForm.reset();
                showHistory();
            } catch (error) {
                console.error("Booking error:", error);
                alert("Something went wrong with the booking. Please try again.");
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ---------- ROUTES ----------

    function renderRoutes(origin, dest) {
        if(!resultsContainer) return;
        resultsContainer.innerHTML = "";

        const activeModes = Array.from(filterCheckboxes)
                                 .filter(cb => cb.checked)
                                 .map(cb => cb.value);

        let filteredRoutes = baseRoutes.filter(route => {
            return activeModes.length === 0 || activeModes.includes(route.type);
        });

        const sortBy = sortSelect ? sortSelect.value : 'recommended';
        filteredRoutes.sort((a, b) => {
            const priceA = parseInt(a.price.replace(/\D/g, ''));
            const priceB = parseInt(b.price.replace(/\D/g, ''));
            const timeA = parseInt(a.time.replace(/\D/g, ''));
            const timeB = parseInt(b.time.replace(/\D/g, ''));
            
            if (sortBy === 'cheapest') return priceA - priceB;
            if (sortBy === 'fastest') return timeA - timeB;
            return a.rank - b.rank;
        });

        if (filteredRoutes.length === 0) {
            resultsContainer.innerHTML = `<div style="text-align:center; padding: 40px; background: var(--clr-white); border-radius: 12px;"><h3 style="font-family: var(--font-heading); color: var(--clr-dark);">No routes found</h3><p class="text-muted">No travel combinations match your selected transport modes. Try selecting more options.</p></div>`;
            return;
        }

        filteredRoutes.forEach(route => {
            const aiBadge = route.isRecommended ? `
                <div style="background: rgba(46, 204, 113, 0.15); color: #27ae60; padding: 6px 12px; border-radius: 20px; display: inline-block; font-size: 0.85rem; font-weight: bold; margin-bottom: 10px;">
                    <i class='bx bx-star'></i> AI Recommended
                </div>
                <p style="font-size: 0.85rem; color: #27ae60; margin: 0 0 10px 0; font-style: italic;">${route.aiReason}</p>
            ` : '';
            
            const borderStyle = route.isRecommended ? 'border: 2px solid #27ae60;' : 'border-left: 4px solid var(--clr-primary);';

            resultsContainer.innerHTML += `
                <div class="result-card" style="display:flex; justify-content:space-between; align-items:center; background:var(--clr-white); padding:20px; border-radius:8px; box-shadow:var(--shadow-sm); margin-bottom:15px; ${borderStyle}">
                    <div>
                        ${aiBadge}
                        <h3 style="margin:0; color:var(--clr-dark); font-size: 1.2rem;">${origin} &rarr; ${dest}</h3>
                        <p style="margin:5px 0; color:var(--clr-text-muted);"><i class='bx bx-trip'></i> ${route.summary}</p>
                        <p style="margin:0; font-weight:bold; color: var(--clr-dark);"><i class='bx bx-time-five'></i> ${route.time}</p>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:1.4rem; color:var(--clr-primary); font-weight:bold; margin-bottom:10px;">${route.price}</div>
                        <button class="btn btn-primary" onclick="window.bookRoute('${origin} to ${dest} • ${route.summary} • Travel Time: ${route.time} • ${route.price}')">
                            Select
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // ---------- GLOBAL FUNCTION ----------
    window.bookRoute = function (summary) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login or create an account to continue booking");
            window.pendingBookingSummary = summary;
            if (authModal) authModal.style.display = 'flex';
            return;
        }
        showBooking(summary);
    };

    window.showTicketModal = function(ticketStr) {
        const ticket = JSON.parse(decodeURIComponent(ticketStr));
        const modal = document.getElementById('ticket-modal');
        const content = document.getElementById('ticket-details-content');
        
        if(content && modal) {
            content.innerHTML = `
                <div style="background: var(--clr-bg, #f8f9fa); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 0 0 5px 0;"><strong>Ticket ID:</strong> <span style="font-family: monospace; font-size: 1.1rem;">${ticket.ticketId || 'N/A'}</span></p>
                    <p style="margin: 0;"><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold; background: rgba(46, 204, 113, 0.1); padding: 2px 8px; border-radius: 12px; font-size: 0.85rem;">${ticket.status || 'Confirmed'} <i class='bx bx-check-circle'></i></span></p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <p style="margin: 0; font-size: 0.8rem; color: var(--clr-text-muted);">Passenger Name</p>
                        <p style="margin: 0; font-weight: 500;">${ticket.name}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 0.8rem; color: var(--clr-text-muted);">Age</p>
                        <p style="margin: 0; font-weight: 500;">${ticket.age || 'N/A'}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 0.8rem; color: var(--clr-text-muted);">Phone Number</p>
                        <p style="margin: 0; font-weight: 500;">${ticket.phone || 'N/A'}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 0.8rem; color: var(--clr-text-muted);">Gender</p>
                        <p style="margin: 0; font-weight: 500;">${ticket.gender || 'N/A'}</p>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <p style="margin: 0; font-size: 0.8rem; color: var(--clr-text-muted);">Email Address</p>
                        <p style="margin: 0; font-weight: 500;">${ticket.email}</p>
                    </div>
                </div>
                <div style="border-top: 1px dashed var(--clr-border); padding-top: 15px;">
                    <p style="margin: 0; font-size: 0.8rem; color: var(--clr-text-muted);">Booking Summary</p>
                    <p style="margin: 0; font-weight: 600; font-size: 1.1rem; color: var(--clr-dark);">${ticket.summary}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: var(--clr-text-muted);">Booked on: ${ticket.date}</p>
                </div>
            `;
            modal.style.display = 'flex';
        }
    };

    // ---------- HISTORY ----------
    async function loadHistory() {
        if(!historyContainer) return;
        
        historyContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class='bx bx-loader-alt bx-spin' style="font-size: 3rem; color: var(--clr-primary);"></i>
                <p>Loading your tickets...</p>
            </div>
        `;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_BASE_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch bookings");
            const bookings = await response.json();

            historyContainer.innerHTML = "";

            if (bookings.length === 0) {
                historyContainer.innerHTML = `
                    <div style="padding: 40px 20px; text-align: center; background: var(--clr-white); border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <i class='bx bx-book-open' style="font-size: 3rem; color: var(--clr-text-muted); margin-bottom: 10px;"></i>
                        <h3 style="margin:0; font-family: var(--font-heading); color: var(--clr-dark);">No bookings found</h3>
                        <p class="text-muted">You have not booked any trips yet.</p>
                    </div>
                `;
                return;
            }

            bookings.forEach(b => {
                const ticketStr = encodeURIComponent(JSON.stringify(b));
                const isCanceled = b.status === 'Canceled';
                const statusBg = isCanceled ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)';
                const statusColor = isCanceled ? '#e74c3c' : '#27ae60';
                const cardBorder = isCanceled ? '#e74c3c' : 'var(--clr-primary)';

                historyContainer.innerHTML += `
                    <div class="ticket-card" style="background: var(--clr-white); border-radius: 12px; box-shadow: var(--shadow-md); padding: 25px; margin-bottom: 20px; border-left: 6px solid ${cardBorder}; opacity: ${isCanceled ? '0.7' : '1'};">
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--clr-border); padding-bottom: 15px; margin-bottom: 15px;">
                            <div>
                                <h3 style="margin: 0; color: var(--clr-dark); font-size: 1.2rem; text-decoration: ${isCanceled ? 'line-through' : 'none'};">${b.summary.split(' • ')[0] || b.summary}</h3>
                                <p style="margin: 5px 0 0 0; color: var(--clr-text-muted);"><i class='bx bx-user'></i> ${b.name}</p>
                            </div>
                            <div style="text-align: right;">
                                <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 15px; font-weight: bold; font-size: 0.8rem;">${b.status}</span>
                                <div style="font-size: 0.8rem; margin-top:5px; color: var(--clr-text-muted); font-family: monospace;">${b.ticketId}</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-outline" style="flex: 1; border: 1px solid var(--clr-primary); color: var(--clr-primary); background: transparent; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;" onclick="window.showTicketModal('${ticketStr}')">
                                <i class='bx bx-id-card'></i> View Ticket
                            </button>
                            ${!isCanceled ? `
                            <button class="btn btn-outline" style="flex: 1; border: 1px solid #e74c3c; color: #e74c3c; background: transparent; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;" onclick="window.cancelTicket('${b._id}')">
                                <i class='bx bx-x-circle'></i> Cancel
                            </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Error loading history:", error);
            historyContainer.innerHTML = `<div style="text-align:center; color:#e74c3c; padding:20px;">Failed to load tickets. Please try again later.</div>`;
        }
    }

    window.cancelTicket = async function(id) {
        if(confirm("Are you sure you want to cancel this ticket? This action cannot be undone.")) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'Canceled' })
                });
                
                if (!response.ok) throw new Error("Failed to cancel ticket");
                
                loadHistory();
            } catch (error) {
                console.error("Cancel error:", error);
                alert("Failed to cancel ticket. Ensure backend is running.");
            }
        }
    };
    // ---------- AUTOCOMPLETE ----------
    const CITIES = [
        "Agra", "Ahmedabad", "Ajmer", "Aligarh", "Allahabad", "Amritsar", "Andaman and Nicobar Islands", "Andhra Pradesh", 
        "Arunachal Pradesh", "Assam", "Aurangabad", "Bangalore", "Bareilly", "Belgaum", "Bhavnagar", "Bhilai", "Bhiwandi", 
        "Bhopal", "Bhubaneswar", "Bihar", "Bikaner", "Chandigarh", "Chennai", "Chhattisgarh", "Coimbatore", "Cuttack", 
        "Dadra and Nagar Haveli and Daman and Diu", "Dehradun", "Delhi", "Dhanbad", "Durgapur", "Faridabad", "Firozabad", 
        "Ghaziabad", "Goa", "Gorakhpur", "Gujarat", "Gulbarga", "Guntur", "Gurgaon", "Guwahati", "Gwalior", "Haryana", 
        "Himachal Pradesh", "Hubli", "Hyderabad", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jalgaon", "Jammu", 
        "Jammu and Kashmir", "Jamnagar", "Jamshedpur", "Jharkhand", "Jhansi", "Jodhpur", "Kannur", "Kanpur", "Karnataka", 
        "Kerala", "Kochi", "Kolhapur", "Kolkata", "Kollam", "Kota", "Kozhikode", "Kurnool", "Ladakh", "Lakshadweep", 
        "Lucknow", "Ludhiana", "Madhya Pradesh", "Madurai", "Maharashtra", "Malegaon", "Mangalore", "Manipur", "Meerut", 
        "Meghalaya", "Mizoram", "Moradabad", "Mumbai", "Mysore", "Nagaland", "Nagpur", "Nashik", "Nellore", "Noida", 
        "Odisha", "Patna", "Pondicherry", "Puducherry", "Pune", "Punjab", "Raipur", "Rajasthan", "Rajkot", "Ranchi", 
        "Rourkela", "Salem", "Sangli", "Sikkim", "Siliguri", "Solapur", "Srinagar", "Surat", "Tamil Nadu", "Telangana", 
        "Thiruvananthapuram", "Thrissur", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tripura", "Ujjain", 
        "Uttar Pradesh", "Uttarakhand", "Vadodara", "Varanasi", "Vasai-Virar", "Vijayawada", "Visakhapatnam", 
        "Warangal", "West Bengal"
    ];
    const originSuggestions = document.getElementById('origin-suggestions');
    const destSuggestions = document.getElementById('destination-suggestions');

    function setupAutocomplete(inputEl, suggestionsEl) {
        if (!inputEl || !suggestionsEl) return;

        function renderSuggestions() {
            const val = inputEl.value.toLowerCase();
            suggestionsEl.innerHTML = '';
            
            const matches = val ? CITIES.filter(city => city.toLowerCase().includes(val)) : CITIES;
            
            if (matches.length > 0) {
                matches.forEach(city => {
                    const li = document.createElement('li');
                    li.textContent = city;
                    li.addEventListener('click', () => {
                        inputEl.value = city;
                        suggestionsEl.style.display = 'none';
                    });
                    suggestionsEl.appendChild(li);
                });
                suggestionsEl.style.display = 'block';
            } else {
                suggestionsEl.style.display = 'none';
            }
        }

        inputEl.addEventListener('input', renderSuggestions);
        inputEl.addEventListener('focus', renderSuggestions);

        document.addEventListener('click', (e) => {
            if (e.target !== inputEl && !suggestionsEl.contains(e.target)) {
                suggestionsEl.style.display = 'none';
            }
        });
    }

    setupAutocomplete(originInput, originSuggestions);
    setupAutocomplete(destInput, destSuggestions);

});