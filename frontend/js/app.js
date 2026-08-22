// GlobeTrotter Application Shell
// This file will be expanded as we build out features

document.addEventListener('DOMContentLoaded', () => {
    console.globeTrotter = 'GlobeTrotter app initialized';

    // Initialize journeys data
    initJourneys();

    // Render the journeys dashboard
    renderJourneysDashboard();

    // Example: handle mobile menu toggle (if we had one)
    // For now, just log that the DOM is ready

    // We can also add some basic interactivity
    const ctaButton = document.querySelector('.btn-primary.btn-large');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            alert('Feature coming soon: Journey creation workflow');
        });
    }
});

// Journey data structure and management
const Journeys = {
    // Mock data - in production this would come from localStorage/Supabase
    mockData: [
        {
            id: 1,
            name: "Japanese Odyssey",
            destinations: ["Tokyo", "Kyoto", "Osaka"],
            startDate: new Date(2026, 7, 18), // Aug 18, 2026
            endDate: new Date(2026, 7, 25),   // Aug 25, 2026
            duration: 7,
            budget: 80000,
            budgetCurrency: "₹",
            status: "upcoming", // planning, upcoming, completed
            description: "A journey through ancient temples and modern metropolises, experiencing the perfect blend of tradition and innovation.",
            image: "assets/images/Kyoto Temple Scene.png"
        },
        {
            id: 2,
            name: "European Winter Escape",
            destinations: ["Paris", "Swiss Alps", "Prague"],
            startDate: new Date(2026, 10, 15), // Nov 15, 2026
            endDate: new Date(2026, 10, 25),   // Nov 25, 2026
            duration: 10,
            budget: 120000,
            budgetCurrency: "₹",
            status: "planning",
            description: "Winter markets, alpine scenery, and romantic cities await in this classic European journey.",
            image: "assets/images/Parisian Winter Romance.png"
        },
        {
            id: 3,
            name: "Mediterranean Summer",
            destinations: ["Santorini", "Amalfi Coast", "Barcelona"],
            startDate: new Date(2026, 5, 10), // Jun 10, 2026
            endDate: new Date(2026, 5, 20),   // Jun 20, 2026
            duration: 10,
            budget: 95000,
            budgetCurrency: "₹",
            status: "completed",
            description: "Sun-soaked islands, dramatic coastlines, and vibrant cities defined this unforgettable summer adventure.",
            image: "assets/images/Santorini Caldera View.png"
        },
        {
            id: 4,
            name: "Alpine Summit",
            destinations: ["Zermatt", "Interlaken", "Jungfrau Region"],
            startDate: new Date(2026, 8, 1), // Aug 1, 2026
            endDate: new Date(2026, 8, 10),   // Aug 10, 2026
            duration: 9,
            budget: 110000,
            budgetCurrency: "₹",
            status: "upcoming",
            description: "High-altitude adventure among Europe's most magnificent peaks, featuring glacier walks and panoramic railway journeys.",
            image: "assets/images/Swiss Alps Majesty.png"
        },
        {
            id: 5,
            name: "Gaudí's Barcelona",
            destinations: ["Barcelona"],
            startDate: new Date(2026, 9, 15), // Sep 15, 2026
            endDate: new Date(2026, 9, 22),   // Sep 22, 2026
            duration: 7,
            budget: 75000,
            budgetCurrency: "₹",
            status: "planning",
            description: "An architectural pilgrimage focusing on Gaudí's masterpieces and Barcelona's modernist treasures.",
            image: "assets/images/Barcelona Architectural Detail.png"
        },
        {
            id: 6,
            name: "Osaka Weekend",
            destinations: ["Osaka", "Kyoto", "Nara"],
            startDate: new Date(2026, 6, 10), // Jun 10, 2026
            endDate: new Date(2026, 6, 16),   // Jun 16, 2026
            duration: 6,
            budget: 65000,
            budgetCurrency: "₹",
            status: "completed",
            description: "A culinary and cultural exploration of Kansai's vibrant center, from street food to ancient temples.",
            image: "assets/images/Osaka Street Elegance.png"
        },
        {
            id: 7,
            name: "Bohemian Christmas",
            destinations: ["Prague", "Český Krumlov", "Karlovy Vary"],
            startDate: new Date(2026, 11, 20), // Dec 20, 2026
            endDate: new Date(2026, 12, 2),    // Dec 2, 2026
            duration: 12,
            budget: 90000,
            budgetCurrency: "₹",
            status: "planning",
            description: "A fairytale winter journey through Bohemia's storybook towns, Christmas markets, and spa retreats.",
            image: "assets/images/Prague Old Town Elegance.png"
        }
    ],

    // Get journeys from localStorage or use mock data
    getAll: function() {
        const saved = localStorage.getItem('globeTrotterJourneys');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing journeys from localStorage:', e);
                return this.mockData;
            }
        }
        return this.mockData;
    },

    // Save journeys to localStorage
    save: function(journeys) {
        try {
            localStorage.setItem('globeTrotterJourneys', JSON.stringify(journeys));
        } catch (e) {
            console.error('Error saving journeys to localStorage:', e);
        }
    },

    // Get featured journey (most recent upcoming or planning)
    getFeatured: function() {
        const journeys = this.getAll();
        // Filter for upcoming or planning, sort by start date
        const activeJourneys = journeys.filter(j =>
            j.status === 'upcoming' || j.status === 'planning'
        );

        if (activeJourneys.length > 0) {
            // Sort by start date (soonest first)
            return activeJourneys.sort((a, b) =>
                new Date(a.startDate) - new Date(b.startDate)
            )[0];
        }

        // If no active journeys, show most recent completed
        const completed = journeys.filter(j => j.status === 'completed');
        if (completed.length > 0) {
            return completed.sort((a, b) =>
                new Date(b.endDate) - new Date(a.endDate)
            )[0];
        }

        // Fallback to first journey
        return journeys[0] || null;
    }
};

// Utility functions for future use
const Utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    },

    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    },

    // Format date range
    formatDateRange: (startDate, endDate) => {
        const start = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric'
        }).format(startDate);

        const end = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(endDate);

        // If same year, omit year from start
        if (startDate.getFullYear() === endDate.getFullYear()) {
            return `${start} — ${end}`;
        }

        return `${start.replace(/\s\d{4}$/, '')} — ${end}`;
    },

    // Debounce function
    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
};

// Initialize journeys data (save mock data to localStorage if not present)
function initJourneys() {
    if (!localStorage.getItem('globeTrotterJourneys')) {
        Journeys.save(Journeys.mockData);
    }
}

// Render the journeys dashboard
function renderJourneysDashboard() {
    const featuredJourneyEl = document.getElementById('featured-journey');
    const journeysGridEl = document.getElementById('journeys-grid');

    if (!featuredJourneyEl || !journeysGridEl) {
        console.error('Journeys dashboard elements not found');
        return;
    }

    const journeys = Journeys.getAll();
    const featured = Journeys.getFeatured();

    // Render featured journey
    if (featured) {
        featuredJourneyEl.innerHTML = createFeaturedJourneyHTML(featured);
    } else {
        featuredJourneyEl.innerHTML = '<p class="text-center py-8">No journeys found</p>';
    }

    // Render journeys grid
    if (journeys.length > 0) {
        journeysGridEl.innerHTML = journeys.map(createJourneyCardHTML).join('');
    } else {
        // Show empty state
        journeysGridEl.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-label">YOUR JOURNEY STARTS HERE</span>
                <h2 class="empty-state-heading">Begin with a destination, a date, and somewhere worth going.</h2>
                <p class="empty-state-text">Your first extraordinary journey awaits.</p>
                <a href="create-journey.html" class="btn btn-primary btn-large">CREATE YOUR FIRST JOURNEY →</a>
            </div>
        `;
    }

    // Add event listeners to action buttons
    setupJourneyEventListeners();
}

// Create HTML for featured journey
function createFeaturedJourneyHTML(journey) {
    const startDate = new Date(journey.startDate);
    const endDate = new Date(journey.endDate);

    return `
        <img src="${journey.image}" alt="${journey.name} destination" class="featured-journey-image" loading="lazy">
        <div class="featured-journey-content">
            <div class="featured-journey-info">
                <div>
                    <h2 class="featured-journey-title">${journey.name}</h2>
                    <div class="featured-journey-dates">${formatDateRange(startDate, endDate)}</div>
                </div>
                <div>
                    <div class="featured-journey-details">
                        <div class="featured-journey-duration">
                            <span>${journey.duration}</span>
                            <span>DAYS</span>
                        </div>
                        <div class="featured-journey-budget">
                            <span>${journey.budgetCurrency}${Utils.formatCurrency(journey.budget).replace(/\D/g, '')}</span>
                            <span>BUDGET</span>
                        </div>
                    </div>
                </div>
            </div>
            <p class="featured-journey-description">${journey.description}</p>
            <a href="#" class="featured-journey-action">CONTINUE PLANNING →</a>
        </div>
    `;
}

// Create HTML for journey card
function createJourneyCardHTML(journey) {
    const startDate = new Date(journey.startDate);
    const endDate = new Date(journey.endDate);

    return `
        <div class="journey-card" data-journey-id="${journey.id}">
            <img src="${journey.image}" alt="${journey.name}" class="journey-card-image" loading="lazy">
            <div class="journey-card-content">
                <div class="journey-card-header">
                    <h3 class="journey-card-title">${journey.name}</h3>
                    <span class="journey-card-status status-${journey.status.toLowerCase()}">${journey.status.toUpperCase()}</span>
                </div>
                <div class="journey-card-dates">${formatDateRange(startDate, endDate)}</div>
                <div class="journey-card-details">
                    ${journey.destinations.length > 0 ?
                        `<span>${journey.destinations.join(' · ')}</span>` :
                        '<span>Multiple destinations</span>'}
                </div>
                <a href="#" class="journey-card-action">VIEW JOURNEY →</a>
            </div>
        </div>
    `;
}

// Setup event listeners for journey interactions
function setupJourneyEventListeners() {
    // Featured journey action - navigate to itinerary builder
    const featuredAction = document.querySelector('.featured-journey-action');
    if (featuredAction) {
        featuredAction.addEventListener('click', (e) => {
            e.preventDefault();
            const featured = Journeys.getFeatured();
            if (featured) {
                window.location.href = `itinerary-builder.html?id=${featured.id}`;
            }
        });
    }

    // Journey card actions - navigate to itinerary view
    const journeyActions = document.querySelectorAll('.journey-card-action');
    journeyActions.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const journeyId = e.target.closest('.journey-card').dataset.journeyId;
            window.location.href = `itinerary-view.html?id=${journeyId}`;
        });
    });

    // Empty state CTA - navigate to create journey
    const emptyStateCta = document.querySelector('.empty-state .btn-primary');
    if (emptyStateCta) {
        emptyStateCta.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'create-journey.html';
        });
    }
}

// Export for use in other modules (if we evolve to modules)
window.GlobeTrotter = {
    Journeys,
    Utils
};