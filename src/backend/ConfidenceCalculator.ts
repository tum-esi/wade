import { confidenceLevel } from '@/util/helpers';

export default class ConfidenceCalculator {

    private data: any; // WADE.PerformanceResult[];
    private confLevel: number;
    private precisionFactor: undefined | number;

    constructor(data: any, confLevel: any, precisionFactor?: number) {
        this.data = data;
        this.confLevel = confLevel;
        this.precisionFactor = precisionFactor || undefined;
    }

    /**
     * Calculate confidence intervals for all measured data.
     */
    public calculateAll() {
        // Iterate over each timing measurement result and calculate the confidence interval for them all yeah
        for (let i = 0, l = this.data.length; i < l; i++) {
            this.data[i] = this.calculate(this.data[i]);
        }

        // Return the timing measurements results, enhanced with the calculation of confidence interval + other info
        return this.data;
    }

    /**
     * Calculate the confidence interval for each result element
     * (possible, possibleWithoutFirst, realistic, realisticWithoutFirst)
     * @param data
     */
    private calculate(resultElement: WADE.PerformanceResult): WADE.PerformanceResult {
        const resultElementMeasurements = ['possible', 'possibleWithoutFirst', 'realistic', 'realisticWithoutFirst'];

        // Calculate confidence for each result element
        resultElementMeasurements.forEach((element) => {
            if (resultElement[element] && resultElement[element].all) {
                // TODO
                // this.data[element].confidenceResults =
                // this.calculateConfInterval(this.data[element], this.confLevel, this.precisionFactor);
                resultElement[element].confidenceResults = { WHAT: 'THE FUCK'};
            }
        });
        return resultElement;
    }

    /**
     * Calculate the confidence interval for specific set of data
     * @param data <number[]> A set of numbers
     * @param confLevel <ConfidenceLevel> The chosen confidence level
     * @param precisionFactor <number|undefined> validate precision factor
     */
    private calculateConfInterval(data: number[], confLevel: number, precisionFactor: number | undefined):
    WADE.ConfidenceLevelResults {
        const dataSize = data.length;
        let BCET = data[0]; // Initial value
        let WCET = data[0]; // Initial value

        // Confidence interval variables
        let mean: number;
        let stDev: number; // Standard deviation
        let stErr: number; // Standard error
        let errMargin: number; // Error margin
        let confMin: number; // Confidence interval min value
        let confMax: number; // Confidence interval max value

        // Precision variables
        let precVal; // Precision value (calculated with precisionFactor)
        let precMinVal; // Precision min value
        let precMaxVal; // Precision max value

        // Actually calculate confidence interval
        mean = data.reduce((a, b) => a + b) / dataSize;
        stDev = Math.sqrt(data.map(x => Math.pow( x - mean, 2)).reduce((a, b) => a + b) / dataSize);
        stErr = stDev / Math.sqrt(dataSize);
        errMargin = stErr * confLevel;
        confMin = mean - errMargin;
        confMax = mean - errMargin;

         // Confirm correctness of BCET, WCET, AET
         for (let i = 0; i < dataSize; i++) {
            if (data[i] < BCET) BCET = data[i];
            if (data[i] > WCET) WCET = data[i];
        }

        // Calculate precision
        if (!precisionFactor) {
            precisionFactor = 0;
            // TODO calculate precision factor
        } else {
            precVal = mean * precisionFactor;
            precMinVal = mean - precVal;
            precMaxVal = mean + precVal;
        }

        return {
            confidenceFactor: this.confLevel,
            mean,
            standardDeviation: stDev,
            standardError: stErr,
            errorMargin: errMargin,
            confidenceIntervalMin: confMin,
            confidenceIntervalMax: confMax,
            confidenceInterval: `${confMin}-${confMax}`,
            precisionFactor,
            precisionMinVal: precMinVal,
            precisionMaxVal: precMaxVal,
            precisionRange: `${precMinVal}-${precMaxVal}`,
            resultsWithinRange: precMinVal < confMin && precMaxVal > confMax,
            resultsWithinRangeMin: precMinVal < confMin,
            resultsWithinRangeMax: precMaxVal > confMax,
        };
    }
}
