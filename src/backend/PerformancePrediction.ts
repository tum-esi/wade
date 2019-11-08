import { ProtocolEnum, MeasurementTypeEnum, PossibleInteractionTypesEnum } from '@/util/enums';

/**
 * TODOS:
 * Loading state for UI (while computing)
 * Save performance measurements in jsons to store
 * Export / Save results
 * Add timing for events
 * Caching on device or client side?
 *
 */


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
    private measurementType: MeasurementTypeEnum;
    private iterations: number;
    private duration: number;
    private numClients: number;
    private delayFirst: number;
    private delayBeforeEach: number;
    private measurementNum: number;
    private measuredDuration: number; // in ms

    // Input determined by TD
    private interactions: any;

    constructor(
        interactions: any,
        measurementType: MeasurementTypeEnum,
        iterations?: number,
        duration?: number,
        numClients?: number,
        delayFirst?: number,
        delayBeforeEach?: number,
        measurementNum?: number
    ) {
        this.interactions = interactions;
        this.measurementType = measurementType;
        this.iterations = iterations || 0;
        this.duration = duration || 0;
        this.numClients = numClients || 1;
        this.delayFirst = delayFirst || 0;
        this.delayBeforeEach = delayBeforeEach || 0;
        this.measurementNum = measurementNum || 1;
        this.measuredDuration = 0;
    }

    // Get performance measurements for all interactions
    public async getPerformance() {
        const results: any = [];
        this.interactions.forEach(async interaction => {
            results.push(await this.execute(interaction));

        });
        return await results;
    }

    // Execute timing performance for each interaction
    private async execute(interaction: {
        name: string,
        type: PossibleInteractionTypesEnum,
        size: string,
        interaction: any
    }) {
        // Result object
        const mainResult: WADE.PerformanceResult = {
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

            let measuredExecutions: number[] = [];
            mainResult.iterations = 0;
            mainResult.measuredDuration = 0;

            // Check which kind of performance testing should be executed
            switch (this.measurementType) {
                case MeasurementTypeEnum.NUM_CLIENTS_NUM_RUN:
                    break;
                case MeasurementTypeEnum.NUM_CLIENTS_DURATION_RUN:
                    break;
                case MeasurementTypeEnum.NUM_RUNS:
                    for (let i = 0; i < this.measurementNum; i++) {
                        measuredExecutions = measuredExecutions.concat(await this.executeWithiterations(interaction));
                        mainResult.iterations = + this.iterations + mainResult.iterations;
                        mainResult.measuredDuration =  + mainResult.measuredDuration + this.measuredDuration;
                    }
                    break;
                case MeasurementTypeEnum.DURATION_RUN:
                    for (let i = 0; i < this.measurementNum; i++) {
                        measuredExecutions = measuredExecutions.concat(await this.executeWithDuration(interaction));
                        mainResult.iterations = + this.iterations + mainResult.iterations;
                        mainResult.measuredDuration =  + mainResult.measuredDuration + this.measuredDuration;
                    }
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

            return mainResult;
    }

    // Execute the interaction a specific number of times
    private async executeWithiterations(interaction: any): Promise<number[]> {
        const executionTimes: number[] = [];

        const hasDelayBeforeEach = this.delayBeforeEach > 0 && typeof this.delayBeforeEach === 'number';

        const hasDelayFirst = this.delayFirst > 0 && typeof this.delayBeforeEach === 'number';

        const delay = hasDelayFirst ? this.delayFirst : hasDelayBeforeEach ? this.delayBeforeEach : 0;

        let startTime;
        let endTime;

        // Execute with a delay duration before saving measurements
        if (hasDelayFirst) {
            let keepExecuting = true;
            let startMeasurements = false;
            let iterations = 0;
            setTimeout(() => { keepExecuting = false; startMeasurements = true; }, delay);
            startTime = Date.now();
            while (keepExecuting || startMeasurements) {
                const result = interaction.input ?
                await interaction.interaction(interaction.input) :
                await interaction.interaction();
                if (startMeasurements) {
                    executionTimes.push(result.s * 1000 + result.ms);
                    iterations ++;
                    if (iterations >= this.iterations) startMeasurements = false;
                }
            }
            startTime = Date.now();
        // Execute with a delay each time before saving measurement
        } else if (hasDelayBeforeEach) {
            let result;
            let iterations = 0;
            startTime = Date.now();
            while (iterations <= this.iterations) {
                // Execute the desired amount of duration without measuring
                let keepExecuting = true;
                setTimeout(() => {
                    keepExecuting = false;
                }, this.delayBeforeEach);
                while (keepExecuting) {
                    result = interaction.input ?
                    await interaction.interaction(interaction.input) :
                    await interaction.interaction();
                }

                result = interaction.input ?
                    await interaction.interaction(interaction.input) :
                    await interaction.interaction();
                executionTimes.push(result.s * 1000 + result.ms);
                iterations++;
            }
            endTime = Date.now();
        // Just execute for a specific number of times
        } else {
            startTime = Date.now();
            for (let i = 0; i < this.iterations; i++) {
                const result = interaction.input ?
                    await interaction.interaction(interaction.input) :
                    await interaction.interaction();
                executionTimes.push(result.s * 1000 + result.ms);
            }
            endTime = Date.now();
        }
        this.measuredDuration = endTime - startTime;
        return executionTimes;
    }

    // Execute the interaction for a specific duration of time
    private async executeWithDuration(interaction: any) {
        const hasDelayBeforeEach = this.delayBeforeEach > 0 && typeof this.delayBeforeEach === 'number';
        const hasDelayFirst = this.delayFirst > 0 && typeof this.delayFirst === 'number';
        const delay = hasDelayFirst ? this.delayFirst : hasDelayBeforeEach ? this.delayBeforeEach : 0;

        if (hasDelayFirst) this.duration = + this.duration + delay;

        let iterations = 0;
        const executionTimes: number[] = [];
        let keepExecuting = true;
        let startTime: any;
        let endTime: any;

        // Stops executing after desired duration
        setTimeout(() => {
            keepExecuting = false;
        }, this.duration);

        // If a delay in the beginning is selected, only save measurements after this delay duration.
        if (hasDelayFirst) {
            startTime = Date.now();
            while (keepExecuting) {
                const result = interaction.input ?
                await interaction.interaction(interaction.input) :
                await interaction.interaction();
                if (Date.now() >= (startTime + delay)) {
                    executionTimes.push(result.s * 1000 + result.ms);
                    iterations++;
                }
            }
            endTime = Date.now();
        // If a delay before each is selected, before each measurement is
        // measured it needs to be executed for a specific duration.
        } else if (hasDelayBeforeEach) {
            let result;
            let loopEnd = + this.duration + Date.now();
            startTime = Date.now();
            while (Date.now() < loopEnd) {
                // Execute the desired amount of duration without measuring
                keepExecuting = true;
                setTimeout(() => {
                    keepExecuting = false;
                }, this.delayBeforeEach);
                const loopStartTime = Date.now();
                while (keepExecuting) {
                    result = interaction.input ?
                    await interaction.interaction(interaction.input) :
                    await interaction.interaction();
                }
                // Add the delay duration time to overall duration time
                loopEnd = + loopEnd + (Date.now() - loopStartTime);

                result = interaction.input ?
                await interaction.interaction(interaction.input) :
                await interaction.interaction();
                executionTimes.push(result.s * 1000 + result.ms);
                iterations++;
            }
            endTime = Date.now();
        } else {
            startTime = Date.now();
            while (keepExecuting) {
                iterations++;
                const result = interaction.input ?
                await interaction.interaction(interaction.input) :
                await interaction.interaction();
                executionTimes.push(result.s * 1000 + result.ms);
            }
            endTime = Date.now();
        }
        this.iterations = iterations;
        this.measuredDuration = endTime - startTime;
        return await executionTimes;
    }

    private executeWithClients() {
        // TODO: add multiple clients
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
            // TODO: do this with JS Set
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

    private calculateExecutionTimes(executionTimes: number[]):
        { WCET: number, BCET: number, AET: number, all: number[]} {
        const executions = [...executionTimes];
        const all = [...executions];
        executions.sort();
        const getAverage = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
        const WCET = executions[executions.length - 1];
        const BCET = executions[0];
        const AET = getAverage(executions);
        return {
            WCET,
            BCET,
            AET,
            all
        };
    }

    private generateError() {
        // TODO: generate Error
    }
}
