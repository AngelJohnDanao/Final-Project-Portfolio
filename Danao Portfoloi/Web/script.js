const DataManager = {
    init() {
        if (!localStorage.getItem('mastermods_bookings')) {
            localStorage.setItem('mastermods_bookings', '[]');
        }
        

        if (!localStorage.getItem('mastermods_services')) {
            const defaultServices = [
                { id: 'SVC-001', name: 'PC Repair & Troubleshooting', category: 'Repair', price: '₱800 - ₱2,500', status: 'active' },
                { id: 'SVC-002', name: 'Virus Removal', category: 'Repair', price: '₱900 - ₱1,800', status: 'active' },
                { id: 'SVC-003', name: 'OS Installation', category: 'Repair', price: '₱700 - ₱1,500', status: 'active' },
                { id: 'SVC-004', name: 'Hardware Upgrade', category: 'Upgrade', price: '₱600 - ₱2,500', status: 'active' },
                { id: 'SVC-005', name: 'Laptop Repair', category: 'Repair', price: '₱1,000 - ₱4,000', status: 'active' },
                { id: 'SVC-006', name: 'Network Setup', category: 'Network', price: '₱1,200 - ₱4,000', status: 'active' },
                { id: 'SVC-007', name: 'Preventive Maintenance', category: 'Maintenance', price: '₱700 - ₱1,500', status: 'active' }
            ];

            localStorage.setItem('mastermods_services', JSON.stringify(defaultServices));
        }
    },

    getBookings() {
        return JSON.parse(localStorage.getItem('mastermods_bookings') || '[]');
    },

    addBooking(bookingData) {
    const bookings = this.getBookings();

    const newBooking = {
        id: `BK-${String(bookings.length + 1).padStart(3, '0')}`,

        customer: bookingData.customer || '',
        email: bookingData.email || '',
        phone: bookingData.phone || '',
        address: bookingData.address || '',

        service: bookingData.service || '',
        deviceType: bookingData.deviceType || 'Not specified', // ✅ ADD THIS

        branch: bookingData.branch || '',
        componentOption: bookingData.componentOption || 'None',

        payment: bookingData.payment && bookingData.payment.trim() !== ''
            ? bookingData.payment
            : 'Not specified',

        date: bookingData.date || 'TBD',
        time: bookingData.time || 'TBD',
        budget: bookingData.budget || '',
        message: bookingData.message || '',

        status: 'pending',
        createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    localStorage.setItem('mastermods_bookings', JSON.stringify(bookings));

    return newBooking;
},
    updateBookingStatus(id, status) {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === id);

        if (index !== -1) {
            bookings[index].status = status;
            localStorage.setItem('mastermods_bookings', JSON.stringify(bookings));
        }
    },

    deleteBooking(id) {
        const filtered = this.getBookings().filter(b => b.id !== id);
        localStorage.setItem('mastermods_bookings', JSON.stringify(filtered));
    },

    getServices() {
        return JSON.parse(localStorage.getItem('mastermods_services') || '[]');
    },

    addService(serviceData) {
        const services = this.getServices();

        const newService = {
            id: `SVC-${String(services.length + 1).padStart(3, '0')}`,
            ...serviceData,
            status: 'active'
        };

        services.push(newService);
        localStorage.setItem('mastermods_services', JSON.stringify(services));

        return newService;
    },

    updateService(id, serviceData) {
        const services = this.getServices();
        const index = services.findIndex(s => s.id === id);

        if (index !== -1) {
            services[index] = { ...services[index], ...serviceData };
            localStorage.setItem('mastermods_services', JSON.stringify(services));
        }
    },

    deleteService(id) {
        const filtered = this.getServices().filter(s => s.id !== id);
        localStorage.setItem('mastermods_services', JSON.stringify(filtered));
    }
};

/* ================= UTILITIES ================= */

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => toast.classList.remove('show'), 3500);
}

function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
}

function getBudget(serviceName) {
    const budgets = {
        'PC Repair & Troubleshooting': '₱800 - ₱2,500',
        'Virus Removal': '₱900 - ₱1,800',
        'OS Installation': '₱700 - ₱1,500',
        'Hardware Upgrade': '₱600 - ₱2,500',
        'Laptop Repair': '₱1,000 - ₱4,000',
        'Network Setup': '₱1,200 - ₱4,000',
        'Preventive Maintenance': '₱700 - ₱1,500'
    };

    return budgets[serviceName] || 'To be discussed';
}

/* ================= COMPONENT OPTIONS ================= */

const componentOptionsByService = {
    'PC Repair & Troubleshooting': [
        'No replacement needed',
        'RAM Upgrade',
        'SSD/HDD Replacement',
        'Power Supply Replacement',
        'GPU Installation',
        'Motherboard Repair'
    ],
    'Hardware Upgrade': [
        'RAM Upgrade',
        'SSD/HDD Replacement',
        'Power Supply Replacement',
        'GPU Installation',
        'Motherboard Repair'
    ]
};

function syncComponentOptions(form) {
    const serviceInput = form.querySelector('#service');
    const componentInput = form.querySelector('#componentOption');

    if (!serviceInput || !componentInput) return;

    const selectedService = serviceInput.value;

    // Only allow for 2 services
    const allowedOptions = componentOptionsByService[selectedService];

    componentInput.innerHTML = '';

    if (!allowedOptions) {
        // DISABLE for all other services
        componentInput.disabled = true;

        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Not applicable for this type of service. This is only available for Repairs and Upgrades.';
        componentInput.appendChild(option);

        return;
    }

    // ENABLE for allowed services
    componentInput.disabled = false;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select component option';
    componentInput.appendChild(placeholder);

    allowedOptions.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        componentInput.appendChild(option);
    });
}

/* ================= FORM HELPERS ================= */

function setFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    input.classList.add('input-invalid');

    let errorNode = formGroup.querySelector('.form-error');
    if (!errorNode) {
        errorNode = document.createElement('p');
        errorNode.className = 'form-error';
        formGroup.appendChild(errorNode);
    }

    errorNode.textContent = message;
}

function clearFieldErrors(form) {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.input-invalid').forEach(el => el.classList.remove('input-invalid'));
}

function validateBookingForm(form) {
    clearFieldErrors(form);

    let valid = true;

    const name = form.querySelector('#name');
    const phone = form.querySelector('#phone');
    const email = form.querySelector('#email');
    const address = form.querySelector('#address');
    const service = form.querySelector('#service');
    const branch = form.querySelector('#branch');
    const message = form.querySelector('#message');

    if (!name.value.trim()) {
        setFieldError(name, 'Name is required.');
        valid = false;
    }

    const normalizedPhone = phone.value.replace(/[^\d]/g, '');
    if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
        setFieldError(phone, 'Enter a valid contact number.');
        valid = false;
    }

    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        setFieldError(email, 'Enter a valid email address.');
        valid = false;
    }

    if (address.value.trim().length < 10) {
        setFieldError(address, 'Please provide a complete address.');
        valid = false;
    }

    if (!service.value) {
        setFieldError(service, 'Please select a service.');
        valid = false;
    }

    if (!branch.value) {
        setFieldError(branch, 'Please select your preferred branch.');
        valid = false;
    }

    if (message.value.trim().length < 15) {
        setFieldError(message, 'Please provide a specific issue description (at least 15 characters).');
        valid = false;
    }

    return valid;
}

/* ================= BRANCH DATA ================= */

const BRANCH_LOCATIONS = [
    {
        name: 'Luzon Branch - Quezon City',
        region: 'Luzon',
        address: 'Unit 204, TriNoma Tech Arcade, North Avenue, Quezon City, Metro Manila 1105',
        contact: '+63 917 845 2210',
        hours: 'Mon-Fri 9:00 AM - 6:00 PM, Sat 10:00 AM - 4:00 PM',
        lat: 14.6548,
        lng: 121.0339,
        isMain: true
    },
    {
        name: 'Luzon Branch - Baguio City',
        region: 'Luzon',
        address: '15 Session Road Extension, Baguio City, Benguet',
        contact: '+63 917 845 2211',
        hours: 'Mon-Sat 9:00 AM - 6:00 PM',
        lat: 16.4120,
        lng: 120.5960
    },
    {
        name: 'Luzon Branch - Naga City',
        region: 'Luzon',
        address: '2nd Floor Magsaysay IT Hub, Naga City, Camarines Sur',
        contact: '+63 917 845 2212',
        hours: 'Mon-Sat 9:00 AM - 6:00 PM',
        lat: 13.6218,
        lng: 123.1948
    },
    {
        name: 'Visayas Branch - Cebu City',
        region: 'Visayas',
        address: '88 IT Park Drive, Lahug, Cebu City, Cebu',
        contact: '+63 917 845 2213',
        hours: 'Mon-Sat 9:00 AM - 6:00 PM, Sun Closed',
        lat: 10.3280,
        lng: 123.9067
    },
    {
        name: 'Visayas Branch - Iloilo City',
        region: 'Visayas',
        address: 'Rizal Tech Arcade, Mandurriao, Iloilo City, Iloilo',
        contact: '+63 917 845 2214',
        hours: 'Mon-Sat 9:00 AM - 6:00 PM',
        lat: 10.7202,
        lng: 122.5621
    },
    {
        name: 'Visayas Branch - Tacloban City',
        region: 'Visayas',
        address: '44 Justice Romualdez Street, Tacloban City, Leyte',
        contact: '+63 917 845 2215',
        hours: 'Mon-Sat 9:00 AM - 5:30 PM',
        lat: 11.2443,
        lng: 125.0030
    },
    {
        name: 'Mindanao Branch - Davao City',
        region: 'Mindanao',
        address: 'Unit 6 Digital Hub, Bajada District, Davao City',
        contact: '+63 917 845 2216',
        hours: 'Mon-Sat 9:00 AM - 6:00 PM, Sun 10:00 AM - 3:00 PM',
        lat: 7.0982,
        lng: 125.6118
    },
    {
        name: 'Mindanao Branch - Cagayan de Oro',
        region: 'Mindanao',
        address: 'Corrales PC Center, Cagayan de Oro, Misamis Oriental',
        contact: '+63 917 845 2217',
        hours: 'Mon-Sat 9:00 AM - 6:00 PM',
        lat: 8.4542,
        lng: 124.6319
    },
    {
        name: 'Mindanao Branch - General Santos',
        region: 'Mindanao',
        address: 'Santiago Boulevard, General Santos City, South Cotabato',
        contact: '+63 917 845 2218',
        hours: 'Mon-Sat 9:00 AM - 6:00 PM',
        lat: 6.1164,
        lng: 125.1716
    }
];

/* ================= MAP HELPERS ================= */

function buildGoogleMapLink(lat, lng, name) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}%20(${encodeURIComponent(name)})`;
}

/* ================= PAGE INIT ================= */

function initBranchesPage() {
    const listContainer = document.getElementById('branchesList');

    if (listContainer) {
        listContainer.innerHTML = BRANCH_LOCATIONS.map(branch => `
            <article class="branch-card">
                <div class="branch-card-head">
                    <div class="service-icon repair">
                        <i class="fas fa-location-dot"></i>
                    </div>
                    <div>
                        <h3>${branch.name} ${branch.isMain ? '<span class="main-branch-badge">Main</span>' : ''}</h3>
                        <p class="branch-region">${branch.region}</p>
                    </div>
                </div>

                <p class="service-description">${branch.address}</p>
                <p><strong>Contact:</strong> ${branch.contact}</p>
                <p><strong>Hours:</strong> ${branch.hours}</p>

                <a class="branch-map-link"
                   href="${buildGoogleMapLink(branch.lat, branch.lng, branch.name)}"
                   target="_blank" rel="noopener noreferrer">
                    Open in Google Maps
                </a>
            </article>
        `).join('');
    }

    const mapContainer = document.getElementById('branchMapInteractive');

    if (mapContainer && window.L) {
        const map = L.map('branchMapInteractive').setView([12.8797, 121.7740], 5.7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const markers = [];

        BRANCH_LOCATIONS.forEach(branch => {
            const marker = L.marker([branch.lat, branch.lng]).addTo(map);

            marker.bindPopup(`
                <strong>${branch.name}</strong><br>
                ${branch.address}<br>
                ${branch.contact}<br>
                <a href="${buildGoogleMapLink(branch.lat, branch.lng, branch.name)}" target="_blank">View</a>
            `);

            markers.push(marker);
        });

        if (markers.length > 1) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.25));
        }
    }
}

/* ================= UI FEATURES ================= */

function initScrollJumpDropdown() {
    const wrap = document.getElementById('scrollJump');
    const select = document.getElementById('scrollJumpSelect');

    if (!wrap || !select) return;

    const toggle = () => {
        wrap.classList.toggle('show', window.scrollY > 220);
    };

    window.addEventListener('scroll', toggle, { passive: true });
    toggle();

    select.addEventListener('change', (e) => {
        const value = e.target.value;
        if (!value) return;

        const target = document.querySelector(value);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function initRevealAnimations() {
    const targets = document.querySelectorAll(
        '.section-header, .service-card, .about-card, .branch-card, .payment-item'
    );

    if (!targets.length) return;

    targets.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${Math.min(i * 35, 220)}ms`;
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    targets.forEach(el => observer.observe(el));
}

/* ================= MAIN ================= */

document.addEventListener('DOMContentLoaded', () => {
    DataManager.init();

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMobile = document.getElementById('navMobile');

    mobileMenuBtn?.addEventListener('click', () => {
        navMobile?.classList.toggle('active');
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = this.getAttribute('href');

            if (!target || target === '#') return;

            const el = document.querySelector(target);
            if (el) {
                e.preventDefault();
                smoothScroll(target);
                navMobile?.classList.remove('active');
            }
        });
    });

    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        syncComponentOptions(bookingForm);

        bookingForm.querySelector('#service')?.addEventListener('change', () => {
            syncComponentOptions(bookingForm);
        });

        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!validateBookingForm(bookingForm)) {
                showToast('Please correct the highlighted fields.', 'error');
                return;
            }

            const formData = new FormData(bookingForm);
            const service = formData.get('service');

            const data = {
                customer: formData.get('name').trim(),
                email: formData.get('email').trim(),
                phone: formData.get('phone').trim(),
                address: formData.get('address').trim(),
                service,
                branch: formData.get('branch'),
                deviceType: formData.get('deviceType') || 'Not specified',
                componentOption: formData.get('componentOption') || 'None',
                payment: formData.get('payment') || 'Not specified',
                date: formData.get('preferredDate') || 'TBD',
                time: formData.get('preferredTime') || 'TBD',
                budget: getBudget(service),
                message: formData.get('message').trim()
            };

            localStorage.setItem('customer_email', data.email);
            DataManager.addBooking(data);

            bookingForm.reset();
            showToast('Service request submitted. Our team will contact you soon.');

            setTimeout(() => {
                if (confirm('Track your request now?')) {
                    window.location.href = 'track-booking.html';
                }
            }, 1000);
        });
    }

    initBranchesPage();
    initScrollJumpDropdown();
    initRevealAnimations();

    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const active = item.classList.contains('active');

            document.querySelectorAll('.faq-item')
                .forEach(i => i.classList.remove('active'));

            if (!active) item.classList.add('active');
        });
    });
});