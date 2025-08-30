// Global variables
let currentBooking = null;
let drivers = [];
let userLocation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeAnimations();
    getCurrentLocation();
});

// Initialize application
function initializeApp() {
    console.log('RideEasy App Initialized');
    loadMockData();
    setupNavigation();
}

// Setup event listeners
function setupEventListeners() {
    // Booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }

    // Driver form
    const driverForm = document.getElementById('driverForm');
    if (driverForm) {
        driverForm.addEventListener('submit', handleDriverSubmit);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    });
}

// Handle navbar scroll effect
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Initialize animations
function initializeAnimations() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe animated elements
    document.querySelectorAll('[class*="animate-"]').forEach(el => {
        observer.observe(el);
    });
}

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('Location obtained:', userLocation);
            },
            (error) => {
                console.log('Location error:', error);
                showAlert('Location access denied. Please enter addresses manually.', 'info');
            }
        );
    }
}

// Load mock data
function loadMockData() {
    drivers = [
        {
            id: 1,
            name: 'John Smith',
            rating: 4.8,
            vehicle: 'Toyota Camry',
            type: 'comfort',
            eta: '3 min',
            price: 12.50,
            distance: '2.1 km'
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            rating: 4.9,
            vehicle: 'Honda Civic',
            type: 'economy',
            eta: '5 min',
            price: 8.80,
            distance: '2.1 km'
        },
        {
            id: 3,
            name: 'Michael Chen',
            rating: 4.7,
            vehicle: 'BMW 3 Series',
            type: 'premium',
            eta: '7 min',
            price: 18.90,
            distance: '2.1 km'
        }
    ];
}

// Handle booking form submission
function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        pickup: e.target.querySelector('input[placeholder*="pickup"]').value,
        destination: e.target.querySelector('input[placeholder*="destination"]').value,
        date: e.target.querySelector('input[type="date"]').value,
        time: e.target.querySelector('input[type="time"]').value,
        vehicleType: e.target.querySelector('select').value
    };

    if (!bookingData.pickup || !bookingData.destination || !bookingData.date || !bookingData.time || !bookingData.vehicleType) {
        showAlert('Please fill in all required fields.', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Finding Drivers...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        showAvailableDrivers(bookingData);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Show available drivers
function showAvailableDrivers(bookingData) {
    const filteredDrivers = drivers.filter(driver => driver.type === bookingData.vehicleType || bookingData.vehicleType === 'economy');
    
    if (filteredDrivers.length === 0) {
        showAlert('No drivers available for the selected vehicle type. Please try another option.', 'error');
        return;
    }

    // Create drivers modal
    const modal = createDriversModal(filteredDrivers, bookingData);
    document.body.appendChild(modal);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Remove modal when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Create drivers selection modal
function createDriversModal(drivers, bookingData) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header border-0 pb-2">
                    <h5 class="modal-title fw-bold">Available Drivers</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="row g-3">
                        ${drivers.map(driver => `
                            <div class="col-12">
                                <div class="card border-0 shadow-sm rounded-3 driver-card" data-driver-id="${driver.id}">
                                    <div class="card-body p-4">
                                        <div class="row align-items-center">
                                            <div class="col-md-3 text-center mb-3 mb-md-0">
                                                <div class="driver-avatar mb-2">
                                                    <i class="fas fa-user-circle fs-1 text-primary"></i>
                                                </div>
                                                <div class="rating">
                                                    <i class="fas fa-star text-warning"></i>
                                                    <span class="fw-bold">${driver.rating}</span>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <h5 class="fw-bold mb-2">${driver.name}</h5>
                                                <p class="text-muted mb-1"><i class="fas fa-car me-2"></i>${driver.vehicle}</p>
                                                <p class="text-muted mb-1"><i class="fas fa-clock me-2"></i>ETA: ${driver.eta}</p>
                                                <p class="text-muted mb-0"><i class="fas fa-route me-2"></i>${driver.distance}</p>
                                            </div>
                                            <div class="col-md-3 text-center">
                                                <div class="price mb-3">
                                                    <span class="h4 text-primary fw-bold">$${driver.price}</span>
                                                </div>
                                                <button class="btn btn-primary rounded-pill px-4 select-driver-btn" data-driver-id="${driver.id}">
                                                    Select Driver
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add click handlers for driver selection
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('select-driver-btn')) {
            const driverId = parseInt(e.target.dataset.driverId);
            selectDriver(driverId, bookingData);
            bootstrap.Modal.getInstance(modal).hide();
        }
    });

    return modal;
}

// Select a driver
function selectDriver(driverId, bookingData) {
    const selectedDriver = drivers.find(d => d.id === driverId);
    if (!selectedDriver) return;

    currentBooking = {
        ...bookingData,
        driver: selectedDriver,
        status: 'confirmed',
        bookingId: 'RD' + Date.now()
    };

    showBookingConfirmation();
}

// Show booking confirmation
function showBookingConfirmation() {
    const modal = createConfirmationModal(currentBooking);
    document.body.appendChild(modal);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Create booking confirmation modal
function createConfirmationModal(booking) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header border-0 pb-2 text-center">
                    <div class="w-100">
                        <div class="success-icon mb-3">
                            <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h4 class="modal-title fw-bold text-success">Booking Confirmed!</h4>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="text-center mb-4">
                        <p class="text-muted">Booking ID: <strong>${booking.bookingId}</strong></p>
                    </div>
                    
                    <div class="booking-details">
                        <div class="row mb-3">
                            <div class="col-6">
                                <small class="text-muted">Driver</small>
                                <p class="fw-bold mb-0">${booking.driver.name}</p>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Vehicle</small>
                                <p class="fw-bold mb-0">${booking.driver.vehicle}</p>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <small class="text-muted">ETA</small>
                                <p class="fw-bold mb-0 text-primary">${booking.driver.eta}</p>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Total Fare</small>
                                <p class="fw-bold mb-0 text-success">$${booking.driver.price}</p>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <div class="trip-details">
                            <div class="mb-2">
                                <small class="text-muted">From</small>
                                <p class="mb-1"><i class="fas fa-circle text-success me-2"></i>${booking.pickup}</p>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted">To</small>
                                <p class="mb-0"><i class="fas fa-map-marker-alt text-danger me-2"></i>${booking.destination}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <button type="button" class="btn btn-primary rounded-pill px-4 me-2" onclick="trackRide()">
                            <i class="fas fa-map-marked-alt me-2"></i>Track Ride
                        </button>
                        <button type="button" class="btn btn-outline-primary rounded-pill px-4" data-bs-dismiss="modal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Track ride function
function trackRide() {
    showAlert('Ride tracking feature will be available in the mobile app!', 'info');
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        showAlert('Thank you for your message! We\'ll get back to you soon.', 'success');
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Handle login form submission
function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="loading"></span> Logging in...';
    submitBtn.disabled = true;
    
    // Simulate login
    setTimeout(() => {
        if (email && password) {
            showAlert('Welcome back! Login successful.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            e.target.reset();
        } else {
            showAlert('Please check your credentials and try again.', 'error');
        }
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Handle signup form submission
function handleSignupSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="loading"></span> Creating Account...';
    submitBtn.disabled = true;
    
    // Simulate account creation
    setTimeout(() => {
        showAlert('Account created successfully! Welcome to RideEasy.', 'success');
        bootstrap.Modal.getInstance(document.getElementById('signupModal')).hide();
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Handle driver registration form submission
function handleDriverSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
    submitBtn.disabled = true;
    
    // Simulate driver application submission
    setTimeout(() => {
        showAlert('Driver application submitted successfully! We\'ll review and contact you within 24 hours.', 'success');
        bootstrap.Modal.getInstance(document.getElementById('driverModal')).hide();
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2500);
}

// Show alert messages
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} custom-alert position-fixed`;
    alertDiv.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        box-shadow: var(--shadow-lg);
        border-radius: var(--border-radius);
    `;
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close btn-close-sm ms-3" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Utility function to calculate distance (mock)
function calculateDistance(pickup, destination) {
    // Mock distance calculation
    return (Math.random() * 10 + 1).toFixed(1);
}

// Utility function to calculate fare (mock)
function calculateFare(distance, vehicleType) {
    const rates = {
        economy: 0.80,
        comfort: 1.20,
        premium: 1.80,
        suv: 2.20
    };
    
    const rate = rates[vehicleType] || rates.economy;
    const baseFare = 2.50;
    return (baseFare + (distance * rate)).toFixed(2);
}