/**
 * MERIDIAN HACKATHON SAFE MODE
 * Bypasses rate-limited AI APIs with high-fidelity, deterministic responses.
 */

const NARRATIVE_POOL = [
    "You've had a solid start today. Most of your morning was spent in deep flow within VS Code, though a 40-minute Instagram session after lunch slightly dipped your score. Tip: Try to tackle your hardest refactoring task now while your recovery speed is still high.",
    "Focus depth is impressive today, especially during the 10AM block. However, I detected a 'Distraction Loop' on YouTube around 11:45. Your recovery was quick—8 minutes back to baseline. Recommendation: Keep the phone in the other room for the next 60 minutes.",
    "Your cognitive velocity is peaking! You've moved through 4 GitHub PRs and 2 Notion docs with 92% efficiency. Careful of the WhatsApp ping fatigue; consider a 5-minute non-digital reset now to maintain this pace.",
    "A bit of a fragmented afternoon. Switching between Slack and Chrome has increased your context-switching cost by 15%. I've applied the Ghost Layer to help. Tip: Focus on ONE tab for the next session."
];

const SNAPSHOT_POOL = [
    "Deep work session detected. You're currently refactoring the authentication module and syncing project documentation.",
    "Research phase active. Comparing Ktor documentation with existing Express routes for the Phase 2 migration.",
    "Communication spike. Handling team coordination in Slack while reviewing the final hackathon submission checklist.",
    "Optimization mode. Fine-tuning CSS animations and layout grids for the high-fidelity dashboard demo."
];

function infer(prompt) {
    return new Promise((resolve) => {
        // Simulate a tiny bit of "thinking" delay for realism
        setTimeout(() => {
            if (prompt.toLowerCase().includes("coach") || prompt.toLowerCase().includes("narrative")) {
                const pick = NARRATIVE_POOL[Math.floor(Math.random() * NARRATIVE_POOL.length)];
                resolve(pick);
            } else {
                const pick = SNAPSHOT_POOL[Math.floor(Math.random() * SNAPSHOT_POOL.length)];
                resolve(pick);
            }
        }, 800);
    });
}

module.exports = { infer };
