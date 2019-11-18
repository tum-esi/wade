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
                outputSettingType: 'Type',
                outputSettingOverallIterations: 'Number of executed iterations',
                outputSettingIterations: 'Iterations',
                outputSettingDuration: 'Duration',
                outputSettingDelay: 'Delay Type',
                outputSettingDelayDuration: 'Delay Duration',
                outputSettingNumMeasurements: 'Number Measurements',
                outputSettingClient: 'Number Clients',
                outputResultoverallIteration: 'Overall Iterations',
                outputResultoverallDuration: 'Overall Duration',
                outputResultRealistic: 'Realistic',
                outputResultPossible: 'Possible',
                outputResultrealisticWithoutFirst: 'Realistic without first',
                outputResultpossibleWithoutFirst: 'Possible without first',
                outputResultSize: 'Size',
                outputResultFirstMeasured: 'First Measured'
            }
        }

    }
};
