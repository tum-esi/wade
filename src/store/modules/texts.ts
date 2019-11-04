export default {
    namespaced: true,
    state: {
        performance: {
            performanceOptions: {
                title: 'Options',
                titleOptions: 'Type:',
                selectedInteraction: 'Selected Interaction:',
                selectedInteractions: 'Selected Interactions:',
                delayTitle: 'Delay:',
                delayDurationPlaceholder: 'Delay in ms',
                durationTitle: 'Duration:',
                durationPlaceholder: 'Duration in ms',
                iterationsTitle: 'Iterations:',
                iterationsPlaceholder: 'Number of iterations',
                errorNoTypeSelected: 'Please select a measurement option.',
                btnStart: 'Start measurements',
                measurementNumTitle: 'Measure multiple times',
            },
            performanceOutput: {
                title: 'Output',
                btnSaveComputer: 'Save Performance Measurement to computer'
            }
        }

    }
};
