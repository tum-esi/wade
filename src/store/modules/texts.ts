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
                delayDurationTitle: 'Delay Duration:',
                durationTitle: 'Duration:',
                durationPlaceholder: 'Duration in ms',
                iterationsTitle: 'Iterations:',
                iterationsPlaceholder: 'Number',
                errorNoTypeSelected: 'Please select a measurement option.',
                btnStart: 'Start measurements',
                measurementNumTitle: 'Repetitions',
            },
            performanceOutput: {
                title: 'Output',
                btnSaveComputer: 'Save output',
                btnAnnotateTD: 'Annotate TD',
                outputSettingType: 'Type'
            }
        }

    }
};
