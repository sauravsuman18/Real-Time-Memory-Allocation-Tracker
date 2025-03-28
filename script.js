// Initialize Chart.js
const ctx = document.getElementById('memoryChart').getContext('2d');
const memoryChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Memory Usage (%)',
            data: [],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Usage %'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            }
        },
        animation: {
            duration: 0
        }
    }
});

// Initialize variables for memory tracking
const maxDataPoints = 60;
let memoryData = [];
let updateInterval;

// Format bytes to human-readable format
function formatBytes(bytes) {
    const gigabytes = bytes / (1024 * 1024 * 1024);
    return `${gigabytes.toFixed(2)} GB`;
}

// Update memory usage display
function updateMemoryDisplay(memory) {
    try {
        const totalMemory = memory.jsHeapSizeLimit;
        const usedMemory = memory.usedJSHeapSize;
        const availableMemory = totalMemory - usedMemory;
        const usagePercentage = (usedMemory / totalMemory * 100).toFixed(1);

        // Update gauge
        document.getElementById('totalMemoryGauge').style.width = `${usagePercentage}%`;
        
        // Update text displays
        document.getElementById('totalMemory').textContent = formatBytes(totalMemory);
        document.getElementById('usedMemory').textContent = formatBytes(usedMemory);
        document.getElementById('availableMemory').textContent = formatBytes(availableMemory);
        document.getElementById('memoryUsage').textContent = `${usagePercentage}%`;

        // Update chart
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();
        
        memoryChart.data.labels.push(timeLabel);
        memoryChart.data.datasets[0].data.push(parseFloat(usagePercentage));

        // Remove old data points if we exceed maxDataPoints
        if (memoryChart.data.labels.length > maxDataPoints) {
            memoryChart.data.labels.shift();
            memoryChart.data.datasets[0].data.shift();
        }

        memoryChart.update();
    } catch (error) {
        console.error('Error updating memory display:', error);
        stopTracking();
    }
}

// Main update function
function updateMemoryStats() {
    if (performance && performance.memory) {
        updateMemoryDisplay(performance.memory);
    } else {
        console.log('Performance.memory API is not available in this browser');
        // Use mock data for demonstration
        const mockMemory = {
            jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
            totalJSHeapSize: 1 * 1024 * 1024 * 1024,
            usedJSHeapSize: Math.random() * 1024 * 1024 * 1024
        };
        updateMemoryDisplay(mockMemory);
    }
}

// Start memory tracking
function startTracking() {
    if (!updateInterval) {
        updateInterval = setInterval(updateMemoryStats, 1000);
        updateMemoryStats(); // Initial update
    }
}

// Stop memory tracking
function stopTracking() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// Start tracking when page loads
startTracking();

// Clean up when page is hidden/closed
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopTracking();
    } else {
        startTracking();
    }
});
