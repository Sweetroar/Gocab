/**
 * models.js
 * Implements OOP Concepts: Encapsulation, Abstraction, Inheritance, Polymorphism
 */

// ==========================================
// 1. ABSTRACTION & ENCAPSULATION
// ==========================================
class User {
    // Encapsulation: Private fields
    #id;
    #password;

    constructor(name, email, phone, password) {
        if (this.constructor === User) {
            throw new Error("Abstract class 'User' cannot be instantiated directly.");
        }
        this.#id = Math.random().toString(36).substr(2, 9);
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.#password = password;
    }

    // Abstraction: Common interface for all users
    getProfile() {
        return {
            id: this.#id,
            name: this.name,
            email: this.email,
            phone: this.phone
        };
    }

    // Abstract method to be overridden
    getRole() {
        throw new Error("Method 'getRole()' must be implemented.");
    }
}

// ==========================================
// 2. INHERITANCE
// ==========================================
class Customer extends User {
    constructor(name, email, phone, password) {
        super(name, email, phone, password);
        this.rideHistory = [];
    }

    getRole() {
        return "Customer";
    }

    addRideToHistory(ride) {
        this.rideHistory.push(ride);
    }
}

class Driver extends User {
    constructor(name, email, phone, password, vehicleModel, vehiclePlate, rating) {
        super(name, email, phone, password);
        this.vehicleModel = vehicleModel;
        this.vehiclePlate = vehiclePlate;
        this.rating = rating;
        this.isAvailable = true;
    }

    getRole() {
        return "Driver";
    }

    completeRide() {
        this.isAvailable = true;
    }

    // Overriding getProfile to add driver specific info
    getProfile() {
        const baseProfile = super.getProfile();
        return {
            ...baseProfile,
            vehicleModel: this.vehicleModel,
            rating: this.rating
        };
    }
}

// ==========================================
// 3. POLYMORPHISM
// ==========================================
// Abstract Base Class
class Ride {
    #origin;
    #destination;

    constructor(origin, destination, vehicleType, distanceInKm) {
        if (this.constructor === Ride) {
            throw new Error("Abstract class 'Ride' cannot be instantiated directly.");
        }
        this.#origin = origin;
        this.#destination = destination;
        this.vehicleType = vehicleType; // economy, premium, suv
        this.distanceInKm = distanceInKm;
        this.status = 'Pending'; // Pending, Accepted, Completed
        this.driver = null;
    }

    getOrigin() { return this.#origin; }
    getDestination() { return this.#destination; }

    // Polymorphic method to calculate generic fare based on vehicle
    calculateFare() {
        let baseFare = 0;
        let perKmRate = 0;

        switch (this.vehicleType) {
            case 'economy':
                baseFare = 5.0; perKmRate = 1.2; break;
            case 'premium':
                baseFare = 10.0; perKmRate = 2.0; break;
            case 'suv':
                baseFare = 15.0; perKmRate = 2.5; break;
            default:
                baseFare = 5.0; perKmRate = 1.2;
        }

        return baseFare + (this.distanceInKm * perKmRate);
    }
}

class InstantRide extends Ride {
    constructor(origin, destination, vehicleType, distanceInKm) {
        super(origin, destination, vehicleType, distanceInKm);
        this.surgeMultiplier = this.#calculateSurge();
    }

    // Encapsulated private method
    #calculateSurge() {
        // Randomly simulate surge pricing between 1.0x and 1.5x
        return 1.0 + (Math.random() * 0.5);
    }

    // Polymorphism: Overriding the base calculateFare
    calculateFare() {
        const baseCalculatedFare = super.calculateFare();
        return baseCalculatedFare * this.surgeMultiplier;
    }
}

class ScheduledRide extends Ride {
    constructor(origin, destination, vehicleType, distanceInKm, scheduledTime) {
        super(origin, destination, vehicleType, distanceInKm);
        this.scheduledTime = scheduledTime;
        this.bookingFee = 5.00; // Flat booking fee for scheduled rides
    }

    // Polymorphism: Overriding the base calculateFare
    calculateFare() {
        const baseCalculatedFare = super.calculateFare();
        return baseCalculatedFare + this.bookingFee;
    }
}

// Payment Interface / Abstraction Mockup
class PaymentMethod {
    processPayment(amount) {
        throw new Error("processPayment() must be implemented by subclasses");
    }
}

class CardPayment extends PaymentMethod {
    processPayment(amount) {
        console.log(`Processing card payment of $${amount.toFixed(2)}`);
        return true;
    }
}

class DigitalWalletPayment extends PaymentMethod {
    processPayment(amount) {
        console.log(`Processing digital wallet payment of $${amount.toFixed(2)}`);
        return true;
    }
}

// Expose to global scope for app.js
window.GocabModels = {
    Customer,
    Driver,
    InstantRide,
    ScheduledRide,
    CardPayment,
    DigitalWalletPayment
};
