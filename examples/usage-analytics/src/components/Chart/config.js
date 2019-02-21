import i18n from '@dhis2/d2-i18n'

export const colors = [
    '#7cb5ec',
    '#CC6600',
    '#CCCC00',
    '#66CC00',
    '#ff0066',
    '#000000',
    '#00CCCC',
]

export const options = {
    animation: {
        duration: 180,
    },
    legend: {
        position: 'bottom',
    },
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
        mode: 'nearest',
    },
    scales: {
        xAxes: [
            {
                display: true,
                scaleLabel: {
                    display: true,
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
        ],
        yAxes: [
            {
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: i18n.t('Values'),
                },
                ticks: {
                    suggestedMin: 0,
                    precision: 0,
                },
            },
        ],
    },
}

export const dataSet = {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    fill: false,
    lineTension: 0,
}
