import { ProtocolEnum, MeasurementTypeEnum, PossibleInteractionTypesEnum } from '@/util/enums';

// TODO: Add timing for events
// TODO: Caching on device or client side?
// TODO: Add a delay for first request (user input)
// TODO: Add a delay for every request (user input)
// TODO: Mind first request
// TODO: Standard Deviation

// Test with implemented virtual thing (add delay of x sec)
// Test with real implented devices with 2 (controlled by us)
// -> Methodology proven?!
// Test with all protocols and several clients from third parties

    // Outputs
    // private PWCET: number | undefined; // Possible worst case execution time (including outliers)
    // private PBCET: number | undefined; // Possible best case execution time (including outliers)
    // private PAET: number | undefined; // Possible average executiontime (including outliers)
    // private RWCET: number | undefined; // Realistic worst case execution time (excluding outliers)
    // private RBCET: number | undefined; // Realistic best case execution time (excluding outliers)
    // private RAET: number | undefined; // Realistic average executiontime (excluding outliers)

    // private inputSize: number | undefined;
    // private outputSize: number | undefined;
    // private protocol: ProtocolEnum | undefined;

export default class PerformancePrediction {

    // Inputs determined by user
    private numRuns: number;
    private durationRuns: number;
    private numClients: number;
    private delayFirst: number;
    private delayBeforeEach: number;
    private measurementType: MeasurementTypeEnum;
    private measureMultipleTimes: number;

    // Input determined by TD
    private interactions: any;

    constructor(
        interactions: any,
        measurementType: MeasurementTypeEnum,
        numRuns?: number,
        durationsRuns?: number,
        numClients?: number,
        delayFirst?: number,
        delayBeforeEach?: number,
        measureMultipleTimes?: number
    ) {
        this.interactions = interactions;
        this.measurementType = measurementType;
        this.numRuns = numRuns || 0;
        this.durationRuns = durationsRuns || 0;
        this.numClients = numClients || 1;
        this.delayFirst = delayFirst || 0;
        this.delayBeforeEach = delayBeforeEach || 0;
        this.measureMultipleTimes = measureMultipleTimes || 1;
    }

    // Get performance measurements for all interactions
    public async getPerformance() {
        const results: any = [];
        this.interactions.forEach(async interaction => {
            results.push(await this.execute(interaction));
        });
        return results;
    }

    // Execute timing performance for each interaction
    private async execute(interaction: {
        name: string,
        type: PossibleInteractionTypesEnum,
        size: string,
        interaction: any
    }) {
        // Result object
        const mainResult: {
            name: string,
            size: string,
            type: PossibleInteractionTypesEnum,
            numClients: number,
            firstMeasured: number,
            delayFirst: number | boolean,
            delayBeforeEach: number | boolean,
            realistic: { WCET: number, BCET: number, AET: number } | null,
            possible: { WCET: number, BCET: number, AET: number } | null,
            realisticWithoutFirst: { WCET: number, BCET: number, AET: number } | null,
            possibleWithoutFirst: { WCET: number, BCET: number, AET: number } | null,
            measuredExecutions: number[] | null,
            numRuns?: number,
            durationRuns?: number
        } = {
            name: interaction.name,
            size: interaction.size,
            type: interaction.type,
            numClients: this.numClients,
            firstMeasured: 0,
            delayFirst: this.delayFirst > 0 ? this.delayFirst : false,
            delayBeforeEach: this.delayBeforeEach > 0 ? this.delayBeforeEach : false,
            realistic: null,
            possible: null,
            realisticWithoutFirst: null,
            possibleWithoutFirst: null,
            measuredExecutions: null
        };

        const mainResults: any[] = [];

        // If it should be executed more than once
        for (let i = 0; i < this.measureMultipleTimes; i++) {
            // Measured executions for interaction
            let measuredExecutions: number[] = [];

            // Check which kind of performance testing should be executed
            switch (this.measurementType) {
                case MeasurementTypeEnum.NUM_CLIENTS_NUM_RUN:
                    break;
                case MeasurementTypeEnum.NUM_CLIENTS_DURATION_RUN:
                    break;
                case MeasurementTypeEnum.NUM_RUNS:
                    measuredExecutions = await this.executeWithNumRuns(interaction);
                    mainResult.numRuns = this.numRuns;
                    break;
                case MeasurementTypeEnum.DURATION_RUN:
                    measuredExecutions = await this.executeWithDuration(interaction);
                    mainResult.numRuns = this.numRuns;
                    break;
                default:
                    this.generateError();
                    break;
            }
            // Set default measured executions without editing
            mainResult.measuredExecutions = [...measuredExecutions]
            ;
            // Set first measured execution
            mainResult.firstMeasured = mainResult.measuredExecutions[0];

            // Get Possible WCET, BCET, AET
            mainResult.possible = this.calculateExecutionTimes(measuredExecutions);

            // Get Realistic WCET, BCET, AET (remove outliers)
            mainResult.realistic = this.calculateExecutionTimes(this.findOutliers(measuredExecutions));

            // Remove first execution for calculations without first
            measuredExecutions.shift();
            // Get Possible WCET, BCET, AET without first execution
            mainResult.possibleWithoutFirst = this.calculateExecutionTimes(measuredExecutions);
            // Get Realistic WCET, BCET, AET without first execution (remove outliers)
            mainResult.realisticWithoutFirst = this.calculateExecutionTimes(measuredExecutions);

            console.log('=== in Performance Prediction', mainResult);
            mainResults.push(mainResult);
        }
        if (mainResults.length >= 1) return mainResults[0];
    }

    // Execute the interaction a specific number of times
    private async executeWithNumRuns(interaction: any): Promise<number[]> {
        const executionTimes: number[] = [];

        const hasDelayBeforeEach = this.delayBeforeEach > 0 && typeof this.delayBeforeEach === 'number';

        const hasDelayFirst = this.delayFirst > 0 && typeof this.delayBeforeEach === 'number';

        const delay = hasDelayFirst ? this.delayFirst : hasDelayBeforeEach ? this.delayBeforeEach : 0;
        for (let i = 0; i < this.numRuns; i++) {
            if (hasDelayBeforeEach || (hasDelayFirst && i === 0)) {
                setTimeout(async () => {
                    const result = await interaction.interaction();
                    executionTimes.push(result.s * 1000 + result.ms);
                }, delay);
            } else {
                const result = await interaction.interaction();
                executionTimes.push(result.s * 1000 + result.ms);
            }
        }
        return executionTimes;
    }

    // Execute the interaction for a specific duration of time
    private async executeWithDuration(interaction: any) {
        let numRuns = 0;
        const executionTimes: number[] = [];
        const startTime = Date.now();
        const endTime = startTime + this.durationRuns;
        while (Date.now() < endTime) {
            numRuns++;
            const result = await interaction.interaction();
            executionTimes.push(result.s * 1000 + result.ms);
        }
        this.numRuns = numRuns;
        return await executionTimes;
    }

    private executeWithClients() {
        // TODO: add many clients
    }

    // Inspired by : https://gist.github.com/ogun/f19dc055e6b84d57e8186cbc9eaa8e45
    private findOutliers(executionTimes: number[]): number[] {
        let realistic: number[] = [...executionTimes];
        if (executionTimes.length > 4) {
            let values: number[];
            let q1: number;
            let q3: number;
            let iqr: number;
            let maxValue: number;
            let minValue: number;
            // copy array fast and sort
            values = executionTimes.slice().sort( (a, b) => a - b);

            // find quartiles
            if ((values.length / 4) % 1 === 0) {
                q1 = 1 / 2 * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
                q3 = 1 / 2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
            } else {
                q1 = values[Math.floor(values.length / 4 + 1)];
                q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
            }

            iqr = q3 - q1;
            maxValue = q3 + iqr * 1.5;
            minValue = q1 - iqr * 1.5;

            realistic = values.filter((x) => (x >= minValue) && (x <= maxValue));
        }

        return realistic;
    }

    private calculateExecutionTimes(executionTimes: number[]): { WCET: number, BCET: number, AET: number} {
        const executions = [...executionTimes];
        executions.sort();
        const getAverage = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
        const WCET = executions[executions.length - 1];
        const BCET = executions[0];
        const AET = getAverage(executions);
        return {
            WCET,
            BCET,
            AET,
        };
    }

    private generateError() {
        // TODO: generate Error
    }
}

// Don't execute when there's an error to begin with

// Case #1 specific number: Execute n times (n is given by the user)

// Case #2 amount of time: Execute as often as possible in a given time n

// Addition: Do one of the above with x clients (== stress test)

// (Remove Complete outliers (may have another reason))


// Number of runs: || Number of runs in x time
// Input: none || loadsize
// Protocol:


// Edge cases: input -> check with different inputs? or at least show size of input