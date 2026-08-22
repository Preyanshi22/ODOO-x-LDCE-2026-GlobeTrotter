// GlobeTrotter Application Shell - Connected to FastAPI & MongoDB Atlas
const API_BASE = "http://localhost:8000/api";

const Journeys = {
    getAll: async function() {
        try {
            const response = await fetch(`${API_BASE}/trips`);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            if (data && data.length > 0) {
                return data.map(this.normalizeTrip);
            }
        } catch (e) {
            console.warn("API unavailable, falling back to localStorage/mock data:", e);
        }
        
        const saved = localStorage.getItem('globeTrotterJourneys');
        if (saved) {
            try { return JSON.parse(saved); } catch (err) { }
        }
        return this.mockData;
    },

    normalizeTrip: function(trip) {
        return {
            id: trip.id || trip._id,
            name: trip.title || "Untitled Trip",
            destinations: trip.stops && trip.stops.length > 0 ? trip.stops.map(s => s.city_name) : ["Explorer Destination"],
            startDate: trip.start_date || new Date(),
            endDate: trip.end_date || new Date(),
            duration: trip.duration_days || (trip.stops ? trip.stops.length * 3 : 5),
            budget: trip.total_budget || 0,
            budgetCurrency: "?",
            status: "upcoming",
            description: trip.description || "An extraordinary adventure customized with smart budgeting and route planning.",
            image: "assets/images/Kyoto Temple Scene.png"
        };
    },

    mockData: [
        {
            id: "1",
            name: "Japanese Odyssey",
            destinations: ["Tokyo", "Kyoto", "Osaka"],
            startDate: new Date(2026, 7, 18),
            endDate: new Date(2026, 7, 25),
            duration: 7,
            budget: 80000,
            budgetCurrency: "?",
            status: "upcoming",
            description: "A journey through ancient temples and modern metropolises, experiencing the perfect blend of tradition and innovation.",
            image: "assets/images/Kyoto Temple Scene.png"
        }
    ],

    getFeatured: async function() {
        const journeys = await this.getAll();
        return journeys[0] || null;
    }
};

const Utils = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    },

    formatDateRange: (startDate, endDate) => {
        const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${start} — ${end}`;
    }
};

async function renderJourneysDashboard() {
    const featuredJourneyEl = document.getElementById('featured-journey');
    const journeysGridEl = document.getElementById('journeys-grid');

    if (!featuredJourneyEl || !journeysGridEl) return;

    const journeys = await Journeys.getAll();
    const featured = await Journeys.getFeatured();

    if (featured) {
        featuredJourneyEl.innerHTML = createFeaturedJourneyHTML(featured);
    } else {
        featuredJourneyEl.innerHTML = '<p class="text-center py-8">No journeys found</p>';
    }

    if (journeys.length > 0) {
        journeysGridEl.innerHTML = journeys.map(createJourneyCardHTML).join('');
    } else {
        journeysGridEl.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-label">YOUR JOURNEY STARTS HERE</span>
                <h2 class="empty-state-heading">Begin with a destination, a date, and somewhere worth going.</h2>
                <p class="empty-state-text">Your first extraordinary journey awaits.</p>
                <a href="create-journey.html" class="btn btn-primary btn-large">CREATE YOUR FIRST JOURNEY ?</a>
            </div>
        `;
    }

    setupJourneyEventListeners();
}

function createFeaturedJourneyHTML(journey) {
    return `
        <img src="${journey.image}" alt="${journey.name} destination" class="featured-journey-image" loading="lazy">
        <div class="featured-journey-content">
            <div class="featured-journey-info">
                <div>
                    <h2 class="featured-journey-title">${journey.name}</h2>
                    <div class="featured-journey-dates">${Utils.formatDateRange(journey.startDate, journey.endDate)}</div>
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
            <a href="itinerary-builder.html?id=${journey.id}" class="featured-journey-action">CONTINUE PLANNING ?</a>
        </div>
    `;
}

function createJourneyCardHTML(journey) {
    return `
        <div class="journey-card" data-journey-id="${journey.id}">
            <img src="${journey.image}" alt="${journey.name}" class="journey-card-image" loading="lazy">
            <div class="journey-card-content">
                <div class="journey-card-header">
                    <h3 class="journey-card-title">${journey.name}</h3>
                    <span class="journey-card-status status-${journey.status.toLowerCase()}">${journey.status.toUpperCase()}</span>
                </div>
                <div class="journey-card-dates">${Utils.formatDateRange(journey.startDate, journey.endDate)}</div>
                <div class="journey-card-details">
                    <span>${journey.destinations.join(' · ')}</span>
                </div>
                <a href="itinerary-view.html?id=${journey.id}" class="journey-card-action">VIEW JOURNEY ?</a>
            </div>
        </div>
    `;
}

function setupJourneyEventListeners() {
    document.querySelectorAll('.journey-card-action').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const journeyId = e.target.closest('.journey-card').dataset.journeyId;
            window.location.href = `itinerary-view.html?id=${journeyId}`;
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderJourneysDashboard();
});
