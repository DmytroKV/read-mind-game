// Game State
let gameState = {
    score: 0,
    perClick: 1,
    perSecond: 0,
    multiplier: 1,
    upgrades: {
        1: { count: 0, cost: 10, perClick: 1, perSecond: 0 },
        2: { count: 0, cost: 100, perClick: 0, perSecond: 1 },
        3: { count: 0, cost: 500, perClick: 5, perSecond: 0 },
        4: { count: 0, cost: 1000, perClick: 0, perSecond: 10 },
        5: { count: 0, cost: 5000, perClick: 0, perSecond: 0, multiplier: 2 },
        6: { count: 0, cost: 10000, perClick: 50, perSecond: 0 }
    }
};

// DOM Elements
const clickerBtn = document.getElementById('clickerBtn');
const scoreDisplay = document.getElementById('score');
const perClickDisplay = document.getElementById('perClick');
const perSecondDisplay = document.getElementById('perSecond');
const feedback = document.getElementById('feedback');
const resetBtn = document.getElementById('resetBtn');
const upgradeButtons = document.querySelectorAll('.upgrade-btn');

// Load game state from localStorage
function loadGame() {
    const saved = localStorage.getItem('clickerGameState');
    if (saved) {
        gameState = JSON.parse(saved);
    }
    updateDisplay();
    updateUpgradeButtons();
}

// Save game state to localStorage
function saveGame() {
    localStorage.setItem('clickerGameState', JSON.stringify(gameState));
}

// Update display values
function updateDisplay() {
    scoreDisplay.textContent = formatNumber(Math.floor(gameState.score));
    perClickDisplay.textContent = formatNumber(gameState.perClick);
    perSecondDisplay.textContent = formatNumber(gameState.perSecond);
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
}

// Handle click
clickerBtn.addEventListener('click', () => {
    const clickValue = gameState.perClick * gameState.multiplier;
    gameState.score += clickValue;
    
    // Show feedback
    feedback.textContent = `+${formatNumber(clickValue)}`;
    feedback.style.animation = 'none';
    setTimeout(() => {
        feedback.style.animation = 'fadeInOut 1s ease-out forwards';
    }, 10);
    
    updateDisplay();
    updateUpgradeButtons();
    saveGame();
});

// Recalculate per-second and per-click values
function recalculateStats() {
    let newPerClick = 1;
    let newPerSecond = 0;
    let newMultiplier = 1;
    
    for (let type in gameState.upgrades) {
        const upgrade = gameState.upgrades[type];
        newPerClick += upgrade.perClick * upgrade.count;
        newPerSecond += upgrade.perSecond * upgrade.count;
        
        if (upgrade.multiplier) {
            newMultiplier *= upgrade.multiplier ** upgrade.count;
        }
    }
    
    gameState.perClick = newPerClick;
    gameState.perSecond = newPerSecond;
    gameState.multiplier = newMultiplier;
}

// Buy upgrade
function buyUpgrade(type) {
    const upgrade = gameState.upgrades[type];
    const cost = upgrade.cost * Math.pow(1.15, upgrade.count);
    
    if (gameState.score >= cost) {
        gameState.score -= cost;
        upgrade.count++;
        recalculateStats();
        updateDisplay();
        updateUpgradeButtons();
        saveGame();
    }
}

// Update upgrade buttons
function updateUpgradeButtons() {
    upgradeButtons.forEach(btn => {
        const type = btn.dataset.type;
        const upgrade = gameState.upgrades[type];
        const cost = upgrade.cost * Math.pow(1.15, upgrade.count);
        const canAfford = gameState.score >= cost;
        
        // Update cost display
        btn.querySelector('.upgrade-cost span').textContent = formatNumber(Math.floor(cost));
        
        // Update owned count
        btn.querySelector('.upgrade-owned span').textContent = upgrade.count;
        
        // Enable/disable button
        btn.disabled = !canAfford;
    });
}

// Reset game
resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
        gameState = {
            score: 0,
            perClick: 1,
            perSecond: 0,
            multiplier: 1,
            upgrades: {
                1: { count: 0, cost: 10, perClick: 1, perSecond: 0 },
                2: { count: 0, cost: 100, perClick: 0, perSecond: 1 },
                3: { count: 0, cost: 500, perClick: 5, perSecond: 0 },
                4: { count: 0, cost: 1000, perClick: 0, perSecond: 10 },
                5: { count: 0, cost: 5000, perClick: 0, perSecond: 0, multiplier: 2 },
                6: { count: 0, cost: 10000, perClick: 50, perSecond: 0 }
            }
        };
        updateDisplay();
        updateUpgradeButtons();
        saveGame();
    }
});

// Passive income
setInterval(() => {
    const passiveIncome = gameState.perSecond * gameState.multiplier;
    if (passiveIncome > 0) {
        gameState.score += passiveIncome;
        updateDisplay();
        saveGame();
    }
}, 1000);

// Upgrade button click handlers
upgradeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        buyUpgrade(type);
    });
});

// Initialize game
loadGame();
