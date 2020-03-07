import { DelayTypeEnum, MeasurementTypeEnum, PossibleInteractionTypesEnum } from '@/util/enums';
import { ConfLevel } from '../util/helpers';
import SizeCalculator from '@/backend/SizeCalculator';

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
    private numClients: number; // Not utilized right now
    private delayType: DelayTypeEnum;
    private delayFirst: number;
    private delayBeforeEach: number;
    private measurementNum: number;
    private measuredDuration: number;
    private confidenceLevel: any;

    // Input determined by TD
    private interactions: any;

    constructor(
        interactions: any,
        measurementType: MeasurementTypeEnum,
        confidenceLevel: any,
        delayType: WADE.DelayTypeEnum,
        delayDuration?: number,
        iterations?: number,
        duration?: number,
        measurementNum?: number,
        numClients?: number
    ) {
        this.interactions = interactions;
        this.measurementType = measurementType;
        this.confidenceLevel = confidenceLevel;
        this.iterations = iterations || 0;
        this.duration = duration || 0;
        this.numClients = numClients || 1; // not used right now, always 1
        this.delayType = delayType;
        this.delayFirst = delayType === DelayTypeEnum.BEFORE_BEGIN && delayDuration ? delayDuration : 0;
        this.delayBeforeEach = delayType === DelayTypeEnum.BEFORE_EACH && delayDuration ? delayDuration : 0;
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
    private async execute(interaction: WADE.PerformanceInteraction) {
        // Result object
        const mainResult: WADE.PerformanceResult = {
            settingsMeasurementType: this.measurementType,
            settingsConfidenceLevel: this.confidenceLevel,
            settingsIterations: this.iterations,
            settingsDuration: this.duration,
            settingsDelayType: this.delayType,
            settingsDelayDuration: this.delayFirst ? this.delayFirst : this.delayBeforeEach ? this.delayBeforeEach : 0,
            settingsNumMeasurements: this.measurementNum,
            settingsNumClients: this.numClients,
            name: interaction.name,
            input: this.getInput(interaction.input),
            output: [] as WADE.PerformanceOutput[] | any[],
            type: interaction.type,
            numClients: this.numClients,
            firstMeasured: 0,
            delayFirst: this.delayFirst > 0 ? this.delayFirst : false,
            delayBeforeEach: this.delayBeforeEach > 0 ? this.delayBeforeEach : false,
            realistic: null,
            possible: null,
            realisticWithoutFirst: null,
            possibleWithoutFirst: null,
            measuredExecutions: null,
            measurementNum: this.measurementNum
        };

            let measuredExecutions: number[] = [];
            mainResult.iterations = 0;
            mainResult.measuredDuration = 0;

            // Check which kind of performance testing should be executed
            // TODO Auslagern num runs und duration in methode
            // TODO Auslagern set of possible / realistic inmethode
            switch (this.measurementType) {
                case MeasurementTypeEnum.NUM_CLIENTS_NUM_RUN:
                    // TODO: not yet implemented
                    break;
                case MeasurementTypeEnum.NUM_CLIENTS_DURATION_RUN:
                    // TODO: not yet implemented
                    break;
                // CASE ITERATION
                case MeasurementTypeEnum.NUM_RUNS:
                    for (let i = 0; i < this.measurementNum; i++) {
                        // execute performance measurements
                        const results = await this.executeWithiterations(interaction);

                        // Extract measured execution times
                        measuredExecutions = measuredExecutions.concat(results.executionTimes);
                        // Set output results
                        mainResult.output = this.getOutput(results.rawOutput);
                        // Set overall iterations
                        mainResult.iterations = + this.iterations + mainResult.iterations;
                        // Set overall duration
                        mainResult.measuredDuration =  + mainResult.measuredDuration + this.measuredDuration;
                    }
                    break;
                // CASE DURATION
                case MeasurementTypeEnum.DURATION_RUN:
                    for (let i = 0; i < this.measurementNum; i++) {
                        // execute performance measurements
                        measuredExecutions = measuredExecutions.concat(await this.executeWithDuration(interaction));
                        // Set overall iterations
                        mainResult.iterations = + this.iterations + mainResult.iterations;
                        // Set overall duration
                        mainResult.measuredDuration =  + mainResult.measuredDuration + this.measuredDuration;
                    }
                    break;
                default:
                    this.generateError();
                    break;
            }
            // Set measured executions without editing results
            mainResult.measuredExecutions = [...measuredExecutions]
            ;
            // Set first measured execution (will be removed later)
            mainResult.firstMeasured = mainResult.measuredExecutions[0];


            // TODO: Remove measurments realistic and possible
            // -> only keep realistic without first (but rename to realistc)
            // -> only keep possible without first (but rename to possible)
            // only return these results (2 instead of 4)
            // -> remove rest

            // Get POSSIBLE WCET, BCET, AET
            mainResult.possible = this.calculateExecutionTimes(measuredExecutions);

            // Get REALISTIC WCET, BCET, AET (remove outliers)
            mainResult.realistic = this.calculateExecutionTimes(this.findOutliers(measuredExecutions));

            // Remove first execution for calculations without first
            measuredExecutions.shift();

            // Get Possible WCET, BCET, AET without first execution
            mainResult.possibleWithoutFirst = this.calculateExecutionTimes(measuredExecutions);
            // Get Realistic WCET, BCET, AET without first execution (remove outliers)
            mainResult.realisticWithoutFirst = this.calculateExecutionTimes(this.findOutliers(measuredExecutions));

            return mainResult;
    }

    // CASE ITERATION = Execute the interaction for specific number of times
    private async executeWithiterations(interaction: any) {
        // Measured execution times
        const executionTimes: number[] = [];
        // Received outputs (must be formatted later)
        const rawOutput: any[] = [];

        const hasDelayBeforeEach = this.delayBeforeEach > 0 && typeof this.delayBeforeEach === 'number';
        const hasDelayFirst = this.delayFirst > 0 && typeof this.delayBeforeEach === 'number';
        const delay = hasDelayFirst ? this.delayFirst : hasDelayBeforeEach ? this.delayBeforeEach : 0;

        let startTime;
        let endTime;

        // CASE DELAY BEFORE BEGINNING:
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
                    if (result && result.res !== undefined) {
                        rawOutput.push(result.res);
                    }
                    iterations ++;
                    if (iterations >= this.iterations) startMeasurements = false;
                }
            }
            startTime = Date.now();
        }

        // CASE DELAY BEFORE EACH:
        // Execute with a delay each time before saving measurement
        if (hasDelayBeforeEach) {
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
                if (result && result.res !== undefined) {
                    rawOutput.push(result.res);
                }
                iterations++;
            }
            endTime = Date.now();
        }

        // CASE NO DELAY:
        // Just execute for a specific number of times (no delays)
        if (!hasDelayFirst && !hasDelayBeforeEach) {
            startTime = Date.now();
            for (let i = 0; i < this.iterations; i++) {
                const result = interaction.input ?
                    await interaction.interaction(interaction.input) :
                    await interaction.interaction();
                executionTimes.push(result.s * 1000 + result.ms);
                if (result && result.res !== undefined) {
                    rawOutput.push(result.res);
                }
            }
            endTime = Date.now();
        }
        this.measuredDuration = endTime - startTime;

        /**
         * TODO: Do this rounding only if chosen by user.
         * The following rounds the results to two places after the decimal.
         * Math.round is known to give the wrong rounded result.
         * This is due to floating number error in js known in the V8 engine.
         * Therefor the rounded results could contain errors.
         */
        // return executionTimes.map((element) => Math.round(element * 100) / 100);

        return { executionTimes, rawOutput };
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
    {       WCET: number,
            BCET: number,
            AET: number,
            all: number[],
            confidenceResults: any
    } {
        const executions = [...executionTimes];
        const all = [...executions];
        const dataSize = executions.length;
        executions.sort();
        const getAverage = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
        const AET = getAverage(executions);
        let WCET = executions[0]; // Initial value
        let BCET = executions[0]; // Initial value
        // Confirm correctness of BCET, WCET, AET
        for (let i = 0; i < dataSize; i++) {
            if (executions[i] < BCET) BCET = executions[i];
            if (executions[i] > WCET) WCET = executions[i];
        }

        // Confidence interval variables
        let mean: number;
        let stDev: number; // Standard deviation
        let stErr: number; // Standard error
        let errMargin: number; // Error margin
        let confMin: number = 0; // Confidence interval min value
        let confMax: number = 0; // Confidence interval max value

        if (dataSize > 0) {
            mean = [...executions].reduce((a, b) => a + b) / dataSize;
            stDev = Math.sqrt([...executions].map(x => Math.pow( x - mean, 2)).reduce((a, b) => a + b) / dataSize);
            stErr = stDev / Math.sqrt(dataSize);
            const confLevel = ConfLevel.get(this.confidenceLevel) || 3.291;
            errMargin = stErr * confLevel;
            confMin = mean - errMargin;
            confMax = mean + errMargin;
        }

        return {
            WCET,
            BCET,
            AET,
            all,
            confidenceResults: {
                confMin,
                confMax
            }
        };
    }

    // Puts input into correct format (WADE.PerformanceInput)
    private getInput(input: any): WADE.PerformanceInput {
        return {
            size: input
                ? new SizeCalculator().getSize(input)
                : 'n.a.',
            value: input ?  input : 'No input'
        };
    }

    // Puts output into correct format (WADE.PerformanceOutput)
    private getOutput(output: any[]): WADE.PerformanceOutput[] {
        const resultOutput = [] as WADE.PerformanceOutput[];
        const resultMap = new Map(); // entry key = value & entry value = amount

        // Sort output results in Map
        output.forEach(element => {
            if (resultMap.has(element)) {
                const newAmount = resultMap.get(element) + 1;
                resultMap.set(element, newAmount);
            } else {
                resultMap.set(element, 1);
            }
        });

        // Get output sizes & bring in correct format
        for (const [key, value] of resultMap) {
            // 'Success' indicates there was no output
            if (key === 'success' || key === 'Success') {
                resultOutput.push({ size: 'n.a.', value: 'No Output', amount: value});
            } else {
                resultOutput.push({size: new SizeCalculator().getSize(key), value: key, amount: value});
            }
        }
        return resultOutput;
    }

    private generateError() {
        // TODO: Generate Error
    }
}
