/**
 * MERIDIAN — Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Meridian Dashboard Initialized');

    // Fetch Cognitive Score from API
    async function updateCognitiveScore() {
        try {
            const response = await fetch('/api/cognitive-score');
            const data = await response.json();
            
            // Update UI (elements found in dashboard.html)
            const scoreNum = document.getElementById('ringNum');
            const statScore = document.getElementById('statScore');
            
            if (scoreNum) scoreNum.textContent = data.score;
            if (statScore) statScore.textContent = data.score;
            
            // Update the ring if it exists
            const ring = document.getElementById('scoreRing');
            if (ring) {
                const total = 364.4;
                const offset = total - (data.score / 100) * total;
                ring.style.strokeDashoffset = offset;
            }
        } catch (error) {
            console.error('Error fetching cognitive score:', error);
        }
    }

    // Fetch Nudges from API
    async function loadNudges() {
        try {
            const response = await fetch('/api/nudges');
            const nudges = await response.json();
            
            const nudgeList = document.getElementById('nudgeList');
            if (nudgeList) {
                // Clear existing (optional) or just append
                // nudgeList.innerHTML = ''; 
                // For now, let's just log them
                console.log('Nudges loaded:', nudges);
            }
        } catch (error) {
            console.error('Error fetching nudges:', error);
        }
    }

    // Fetch Narrative Insight (AI Powered)
    async function updateNarrativeInsight() {
        const loading = document.getElementById('narrativeLoading');
        const text = document.getElementById('narrativeText');
        if (loading) loading.style.display = 'block';
        if (text) text.style.opacity = '0.5';

        try {
            const response = await fetch('/api/narrative-insight');
            const data = await response.json();
            if (text) {
                text.textContent = `"${data.insight}"`;
                text.style.opacity = '1';
            }
        } catch (error) {
            console.error('Error fetching narrative insight:', error);
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    // Fetch Mental Snapshot (AI Powered)
    async function updateMentalSnapshot() {
        try {
            const response = await fetch('/api/mental-snapshot');
            const data = await response.json();
            const snapshotEl = document.getElementById('mentalSnapshot');
            if (snapshotEl) {
                snapshotEl.textContent = data.snapshot;
            }
        } catch (error) {
            console.error('Error fetching mental snapshot:', error);
        }
    }

    // Fetch Telegram Feed
    async function updateTelegramFeed() {
        const feedEl = document.getElementById('telegramFeed');
        try {
            const response = await fetch('/api/telegram-feed');
            const data = await response.json();
            if (feedEl && data.length > 0) {
                feedEl.innerHTML = data.map(item => `
                    <div class="nudge" style="background:transparent; padding:0; border:none; margin-bottom:12px;">
                        <div class="nudge-icon" style="background:rgba(36,161,222,0.1); color:#24A1DE;">
                            ${item.sender.includes('Bot') ? '🤖' : '👤'}
                        </div>
                        <div>
                            <div class="nudge-text" style="font-size:12px; color:var(--text-muted);">${item.sender}: <span style="color:var(--text-primary)">${item.message}</span></div>
                            <div class="nudge-time">${item.time}</div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error fetching telegram feed:', error);
        }
    }

    // Initial load
    updateCognitiveScore();
    loadNudges();
    updateNarrativeInsight();
    updateMentalSnapshot();
    updateTelegramFeed();

    // Set interval for live updates
    setInterval(updateCognitiveScore, 30000); // every 30s
    setInterval(updateTelegramFeed, 5000); // every 5s
});

// Global functions for buttons
async function refreshInsight() {
    // We can't easily call internal functions from here unless we expose them or redeclare
    const loading = document.getElementById('narrativeLoading');
    const text = document.getElementById('narrativeText');
    if (loading) loading.style.display = 'block';
    
    try {
        const response = await fetch('/api/narrative-insight');
        const data = await response.json();
        if (text) text.textContent = `"${data.insight}"`;
    } catch (error) {
        console.error('Error refreshing insight:', error);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function simulateDistraction() {
    const screen = document.getElementById('frictionScreen');
    const timer = document.getElementById('frictionTimer');
    const bar = document.getElementById('frictionBar');
    
    if (!screen) return;
    
    screen.style.display = 'flex';
    let count = 5;
    timer.textContent = count;
    bar.style.width = '100%';
    
    const interval = setInterval(() => {
        count--;
        timer.textContent = count;
        if (count <= 0) {
            clearInterval(interval);
            screen.style.display = 'none';
            // Show a toast
            if (typeof showToast === 'function') showToast('✓ Focus reset. Proceed with intention.');
        }
    }, 1000);
    
    setTimeout(() => {
        bar.style.width = '0%';
    }, 10);
}

function togglePrivacy(el) {
    const pip = document.getElementById('ghostPip');
    if (pip) {
        pip.classList.toggle('on');
        const isActive = pip.classList.contains('on');
        console.log('Ghost Layer:', isActive ? 'Enabled' : 'Disabled');
        
        // Update global state if available
        if (typeof MERIDIAN !== 'undefined') {
            isActive ? MERIDIAN.GhostMode.enable() : MERIDIAN.GhostMode.disable();
        }
    }
}

function dismissNudge(btn) {
    const nudge = btn.closest('.nudge');
    if (nudge) {
        nudge.style.opacity = '0';
        nudge.style.transform = 'translateX(20px)';
        setTimeout(() => nudge.remove(), 300);
    }
}
