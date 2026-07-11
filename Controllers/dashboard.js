const ctx = document.getElementById('salesChart').getContext('2d');
const salesChart = new Chart(ctx, {
    type: 'line',
    data:{
        labels:['Januari', 'Februari', 'Maret', 'April'],
        datasets: [{
            label: 'Pendapatan',
            data:[7500000, 8000000, 12000000,21000000],
            backgroundColor: 'rgba(233, 29,96, 0.1)',
            borderWidth:3,
            tension:0.3,
            fill:true,
            pointBackgroundColor: '#1a1a2e',
            pointRadius: 5
    }]
},
options:{
    responsive: true,
    plugins: {
        legend: {
            display: true,
            position: 'top',
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks:{
                callback: function(value) {
                    return 'Rp' + value.toLocaleString('id-ID');
                }
            }
        }
    }
}
});