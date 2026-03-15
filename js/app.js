/**
 * app.js
 * Controller connecting Models to the View
 */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Mock DB ----
    const { Customer, Driver, InstantRide, ScheduledRide, CardPayment, DigitalWalletPayment } = window.GocabModels;

    const mockDrivers = [
        new Driver("John Smith", "john@gocab.com", "123-456", "pass", "Toyota Camry (Economy)", "ABC-123", 4.8),
        new Driver("Emma Davis", "emma@gocab.com", "234-567", "pass", "Mercedes E-Class (Premium)", "XYZ-987", 4.9),
        new Driver("Marcus Johnson", "marcus@gocab.com", "345-678", "pass", "Ford Explorer (SUV)", "SUV-555", 4.7),
        new Driver("Sophia Lee", "sophia@gocab.com", "456-789", "pass", "Honda Accord (Economy)", "DEF-456", 5.0)
    ];

    const currentCustomer = new Customer("Alex User", "alex@example.com", "999-888", "secret");

    // ---- DOM Elements ----
    const tabInstant = document.getElementById('tab-instant');
    const tabScheduled = document.getElementById('tab-scheduled');
    const scheduledTimeContainer = document.getElementById('scheduledTimeContainer');
    const scheduledTimeInput = document.getElementById('scheduledTime');
    const bookingForm = document.getElementById('bookingForm');
    
    const pickupInput = document.getElementById('pickupLocation');
    const dropoffInput = document.getElementById('dropoffLocation');
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    const estimatedFareSpan = document.getElementById('estimatedFare');
    
    const trackingSection = document.getElementById('trackingSection');
    const trackingStatus = document.getElementById('trackingStatus');
    const rideProgress = document.getElementById('rideProgress');
    const assignedDriverMini = document.getElementById('assignedDriverMini');
    
    const driverGrid = document.getElementById('driverGrid');
    const faqItems = document.querySelectorAll('.faq-item');

    const paymentModal = document.getElementById('paymentModal');
    const closeModal = document.querySelector('.close-modal');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const modalFareDisplay = document.getElementById('modalFareDisplay');

    // ---- State ----
    let rideType = 'instant'; // instant | scheduled
    let selectedVehicle = 'economy';
    let currentCalculatedFare = 0;
    let pendingRide = null;

    // ---- Functions & Event Listeners ----

    // Render Driver Grid organically from objects
    function renderDrivers() {
        driverGrid.innerHTML = '';
        mockDrivers.forEach(driver => {
            const profile = driver.getProfile();
            const card = document.createElement('div');
            card.className = 'driver-card';
            card.innerHTML = `
                <div class="driver-avatar"><i class="fas fa-user-tie"></i></div>
                <h3 class="driver-name">${profile.name}</h3>
                <div class="driver-rating"><i class="fas fa-star"></i> ${profile.rating} / 5.0</div>
                <p>Vehicle: ${profile.vehicleModel}</p>
            `;
            driverGrid.appendChild(card);
        });
    }

    // Tabs logic
    tabInstant.addEventListener('click', (e) => {
        e.preventDefault();
        tabInstant.classList.add('active');
        tabScheduled.classList.remove('active');
        scheduledTimeContainer.style.display = 'none';
        rideType = 'instant';
        updateFareEstimate();
    });

    tabScheduled.addEventListener('click', (e) => {
        e.preventDefault();
        tabScheduled.classList.add('active');
        tabInstant.classList.remove('active');
        scheduledTimeContainer.style.display = 'block';
        rideType = 'scheduled';
        updateFareEstimate();
    });

    // Vehicle Selection
    vehicleCards.forEach(card => {
        card.addEventListener('click', () => {
            vehicleCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedVehicle = card.dataset.vehicle;
            updateFareEstimate();
        });
    });

    // Inputs changing triggers fare update
    pickupInput.addEventListener('input', updateFareEstimate);
    dropoffInput.addEventListener('input', updateFareEstimate);

    // Dynamic Fare Calculation (Polymorphism in action)
    function updateFareEstimate() {
        const p = pickupInput.value.trim();
        const d = dropoffInput.value.trim();

        if (p.length > 2 && d.length > 2) {
            // Mock distance based on string lengths just for demo simulation
            const mockDistance = (p.length + d.length) * 1.5; 
            
            let mockRide;
            if (rideType === 'instant') {
                mockRide = new InstantRide(p, d, selectedVehicle, mockDistance);
            } else {
                mockRide = new ScheduledRide(p, d, selectedVehicle, mockDistance, scheduledTimeInput.value);
            }

            // Polymorphic call
            currentCalculatedFare = mockRide.calculateFare();
            estimatedFareSpan.textContent = `$${currentCalculatedFare.toFixed(2)}`;
            pendingRide = mockRide;
        } else {
            estimatedFareSpan.textContent = `$0.00`;
            currentCalculatedFare = 0;
            pendingRide = null;
        }
    }

    // Booking Submission
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!pendingRide || currentCalculatedFare === 0) {
            alert('Please enter valid locations to calculate a fare.');
            return;
        }

        if (rideType === 'scheduled' && !scheduledTimeInput.value) {
            alert('Please select a scheduled time.');
            return;
        }

        // Open Payment Modal
        modalFareDisplay.textContent = `$${currentCalculatedFare.toFixed(2)}`;
        paymentModal.style.display = 'block';
    });

    // Payment Logic (Abstraction)
    confirmPaymentBtn.addEventListener('click', () => {
        const paymentMethodValue = document.querySelector('input[name="paymentMethod"]:checked').value;
        let paymentProcessor;

        if (paymentMethodValue === 'CardPayment') {
            paymentProcessor = new CardPayment();
        } else {
            paymentProcessor = new DigitalWalletPayment();
        }

        // Process payment
        paymentProcessor.processPayment(currentCalculatedFare);
        
        // Hide Modal, show tracking
        paymentModal.style.display = 'none';
        startTrackingSequence();
    });

    // Close Modal
    closeModal.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    // Mock Realtime Tracking Sequence
    function startTrackingSequence() {
        trackingSection.classList.remove('hidden');
        trackingSection.scrollIntoView({ behavior: 'smooth' });
        
        trackingStatus.textContent = 'Assigning driver near you...';
        rideProgress.style.width = '10%';
        assignedDriverMini.classList.add('hidden');

        setTimeout(() => {
            // Assign random driver
            const assignedDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
            pendingRide.driver = assignedDriver;
            currentCustomer.addRideToHistory(pendingRide);

            trackingStatus.textContent = 'Driver assigned! En route...';
            rideProgress.style.width = '50%';
            
            assignedDriverMini.innerHTML = `
                <div style="font-size: 2rem;"><i class="fas fa-car"></i></div>
                <div>
                    <strong>${assignedDriver.name}</strong> • ${assignedDriver.rating} <i class="fas fa-star" style="color: gold;"></i><br>
                    <small>${assignedDriver.vehicleModel} (${assignedDriver.vehiclePlate})</small>
                </div>
            `;
            assignedDriverMini.classList.remove('hidden');

            setTimeout(() => {
                trackingStatus.textContent = 'Driver has arrived!';
                rideProgress.style.width = '100%';
                
                setTimeout(() => {
                    alert('Thanks for riding with Gocab!');
                    bookingForm.reset();
                    updateFareEstimate();
                    trackingSection.classList.add('hidden');
                }, 3000);

            }, 4000);

        }, 3000);
    }

    // FAQ Accordion
    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    // Initialize Layout
    renderDrivers();
});
