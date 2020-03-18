import { DelayTypeEnum, MeasurementTypeEnum, PossibleInteractionTypesEnum } from '@/util/enums';
import { ConfLevel } from '../util/helpers';
import SizeCalculator from '@/backend/SizeCalculator';

// TODO: Refactor: remove duplicate code

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
        this.numClients = numClients || 1; // TODO: not used right now, always 1
        this.delayType = delayType;
        this.delayFirst = delayType === DelayTypeEnum.BEFORE_BEGIN && delayDuration ? delayDuration : 0;
        this.delayBeforeEach = delayType === DelayTypeEnum.BEFORE_EACH && delayDuration ? delayDuration : 0;
        this.measurementNum = measurementNum || 1;
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
            measuredExecutions: null,
            measurementNum: this.measurementNum,
            overallDuration: 0,
            overallIterations: 0
        };

        // Measured execution-times
        let measuredExecutions: number[] = [];

        // Delay variables
        const hasDelayBeforeEach = this.delayBeforeEach > 0
            && (typeof this.delayBeforeEach === 'number'
            || !isNaN(parseInt(this.delayBeforeEach, 10)));
        const hasDelayFirst = this.delayFirst > 0
            && (typeof this.delayFirst === 'number'
            || !isNaN(parseInt(this.delayFirst, 10)));
        const delay = hasDelayFirst ? this.delayFirst : hasDelayBeforeEach ? this.delayBeforeEach : 0;

        // Check which kind of performance testing should be executed
        switch (this.measurementType) {
            case MeasurementTypeEnum.NUM_CLIENTS_NUM_RUN:
                // TODO: not yet implemented
                break;
            case MeasurementTypeEnum.NUM_CLIENTS_DURATION_RUN:
                // TODO: not yet implemented
                break;
            case MeasurementTypeEnum.NUM_RUNS:
            case MeasurementTypeEnum.DURATION_RUN:
                for (let i = 0; i < this.measurementNum; i++) {
                    let results;
                    // execute performance measurements (either case iteration or duration)
                    if (this.measurementType === MeasurementTypeEnum.NUM_RUNS) {
                        // CASE ITERATION
                        results = await this.executeWithIterations(
                            interaction, hasDelayBeforeEach, hasDelayFirst, delay);
                    } else if (this.measurementType === MeasurementTypeEnum.DURATION_RUN) {
                        // CASE DURATION
                        results = await this.executeWithDuration(
                            interaction, hasDelayBeforeEach, hasDelayFirst, delay);
                    }
                    // TODO: Maybe compute result stuff right here
                    measuredExecutions = measuredExecutions.concat(results.executionTimes);
                    mainResult.output = this.getOutput(results.rawOutput);
                    mainResult.overallIterations += results.overallIterations;
                    mainResult.overallDuration += results.overallDuration;
                }
                break;
            default:
                this.generateError();
                break;
            }
            // Set measured executions without editing results
            mainResult.measuredExecutions = [...measuredExecutions]
            ;
            // Set first measured execution
            mainResult.firstMeasured = mainResult.measuredExecutions[0];
            // Remove first execution to not include it in calculations
            measuredExecutions.shift();
            // Get POSSIBLE WCET, BCET, AET
            mainResult.possible = this.calculateExecutionTimes(measuredExecutions);
            // Get REALISTIC WCET, BCET, AET (remove outliers)
            mainResult.realistic = this.calculateExecutionTimes(this.findOutliers(measuredExecutions));

            return mainResult;
    }

    // CASE ITERATION = Execute the interaction for specific number of times
    private async executeWithIterations(
        interaction: any,
        hasDelayBeforeEach: boolean,
        hasDelayFirst: boolean,
        delay: number
    ) {
        // Measured execution times
        const executionTimes: number[] = [];
        // Received outputs (must be formatted later)
        const rawOutput: any[] = [];

        let startTime: number = Date.now(); // Needed for overall duration
        let endTime: number = Date.now(); // Needed for overall duration
        let overallIterations = 0;
        let overallDuration = 0;

        // CASE DELAY BEFORE BEGINNING:
        // Execute with a delay duration before saving measurements
        if (hasDelayFirst) {
            let keepExecuting = true;
            let saveMeasurements = false;
            let iterations = 0;

            // Set delay timeout
            setTimeout(() => { keepExecuting = false; saveMeasurements = true; }, delay);

            // Start overall duration measurement
            startTime = Date.now();
            while (keepExecuting || saveMeasurements) {
                // Execute interaction
                const result = interaction.input ?
                    await interaction.interaction(interaction.input) :
                    await interaction.interaction();
                // Increase overall iterations
                overallIterations++;
                // If delay is over, save measurements
                if (saveMeasurements) {
                    executionTimes.push(result.s * 1000 + result.ms);
                    if (result && result.res !== undefined) {
                        rawOutput.push(result.res);
                    }
                    iterations ++;
                    if (iterations >= this.iterations) saveMeasurements = false;
                }
            }
            // End overall duration measurement
            endTime = Date.now();
        }

        // CASE DELAY BEFORE EACH:
        // Execute with a delay each time before saving measurement
        if (hasDelayBeforeEach) {
            let iterations = 0;

            startTime = Date.now();
            while (iterations <= this.iterations) {
                let keepExecuting = true;
                let saveMeasurements = false;

                // Set delay timeout
                setTimeout(() => {
                    keepExecuting = false;
                    saveMeasurements = true;
                }, delay);

                while (keepExecuting || saveMeasurements) {
                    // Execute interaction
                    const result = interaction.input ?
                    await interaction.interaction(interaction.input) :
                    await interaction.interaction();
                    // Increase overall iterations
                    overallIterations++;
                    // If delay is over save measurements
                    if (saveMeasurements) {
                        executionTimes.push(result.s * 1000 + result.ms);
                        if (result && result.res !== undefined) {
                            rawOutput.push(result.res);
                        }
                        iterations++;
                        if (iterations >= this.iterations) saveMeasurements = false;
                    }
                }
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
            overallIterations = this.iterations;
        }

        /**
         * TODO: Do this rounding only if chosen by user.
         * The following rounds the results to two places after the decimal.
         * Math.round is known to give the wrong rounded result.
         * This is due to floating number error in js known in the V8 engine.
         * Therefor the rounded results could contain errors.
         */
        // return executionTimes.map((element) => Math.round(element * 100) / 100);

        overallDuration = endTime - startTime;

        return { executionTimes, rawOutput, overallIterations, overallDuration };
    }

    // Execute the interaction for a specific duration of time
    private async executeWithDuration(
        interaction: any,
        hasDelayBeforeEach: boolean,
        hasDelayFirst: boolean,
        delay: number
    ) {

        // Measured execution times
        const executionTimes: number[] = [];
        // Received outputs (must be formatted later)
        const rawOutput: any[] = [];

        let startTime: number = Date.now(); // Needed for overall duration
        let endTime: number = Date.now(); // Needed for overall duration
        let overallIterations = 0;
        let overallDuration = 0;
        let iterations: number = 0;
        let keepExecuting: boolean;
        let saveMeasurements: boolean;

        // CASE DELAY BEFORE BEGINNING:
        // Execute with a delay duration before saving measurements
        if (hasDelayFirst) {
            saveMeasurements = false;
            keepExecuting = true;

            // Set delay timeout
            setTimeout(() => {
                keepExecuting = false;
                saveMeasurements = true;
                // Stops executing after desired duration
                setTimeout(() => { saveMeasurements = false; }, this.duration);
            }, delay);

            // Start overall duration measurement
            startTime = Date.now();
            while (keepExecuting || saveMeasurements) {
                const result = interaction.input ?
                    await interaction.interaction(interaction.input) :
                    await interaction.interaction();
                overallIterations++;
                if (saveMeasurements) {
                    executionTimes.push(result.s * 1000 + result.ms);
                    if (result && result.res !== undefined) {
                        rawOutput.push(result.res);
                    }
                    iterations++;
                }
            }
            // End overall duration measurement
            endTime = Date.now();
        }

        // CASE DELAY BEFORE EACH:
        // Execute with a delay each time before saving measurement
        if (hasDelayBeforeEach) {
            keepExecuting = false;
            let restDuration = this.duration;
            let durationStart: number;
            let durationEnd: number;

            startTime = Date.now();
            while (restDuration > 0) {
                keepExecuting = true;
                saveMeasurements = false;

                setTimeout(() => {
                    keepExecuting = false;
                    saveMeasurements = true;
                }, delay);

                while (keepExecuting || saveMeasurements) {
                    durationStart = Date.now();
                    const result = interaction.input ?
                        await interaction.interaction(interaction.input) :
                        await interaction.interaction();
                    durationEnd = Date.now();
                    overallIterations++;
                    if (saveMeasurements) {
                        executionTimes.push(result.s * 1000 + result.ms);
                        if (result && result.res !== undefined) {
                            rawOutput.push(result.res);
                        }
                        iterations++;
                        saveMeasurements = false;
                        restDuration -= (durationEnd - durationStart);
                    }
                }
            }
            endTime = Date.now();
        }
        // CASE NO DELAY:
        // Just execute for a specific duration
        if (!hasDelayFirst && !hasDelayBeforeEach) {
            keepExecuting = true;
            iterations = 0;

            setTimeout(() => { keepExecuting = false; }, this.duration);

            startTime = Date.now();
            while (keepExecuting) {
                const result = interaction.input ?
                    await interaction.interaction(interaction.input) :
                    await interaction.interaction();
                iterations++;
                executionTimes.push(result.s * 1000 + result.ms);
                if (result && result.res !== undefined) {
                    rawOutput.push(result.res);
                }
            }
            // End overall duration measurement
            endTime = Date.now();
            // In this case overall & measured iterations are the same
            overallIterations = iterations;
        }

        overallDuration = endTime - startTime;

        return { executionTimes, rawOutput, overallIterations, overallDuration };
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
