module.exports = class ConfidenceCalculator {

    // confidenceFactor99 = 2.576;

    constructor(jsonData) {
        this.jsonData = JSON.parse(jsonData);
        // this.confidenceFactor = this.confidenceFactor99;
        this.confidenceFactor = 2.576;
        this.percentageFactor = 0.05;
    }

    calculateAll() {
        let possibleResults = this.calculate(this.jsonData.possible.all, this.confidenceFactor, this.percentageFactor);

        let possibleWithoutFirstResults = this.calculate(this.jsonData.possibleWithoutFirst.all, this.confidenceFactor, this.percentageFactor);

        let realisticResults = this.calculate(this.jsonData.realistic.all, this.confidenceFactor, this.percentageFactor);

        let realisticWithoutFirstResults = this.calculate(this.jsonData.realisticWithoutFirst.all, this.confidenceFactor, this.percentageFactor);

        return { possibleResults, possibleWithoutFirstResults, realisticResults, realisticWithoutFirstResults };
    }

    calculate(data, confidenceFactor, percentageFactor) {
        let size = data.length;
        let BCET = data[0];
        let WCET = data[0];
        
        // Confidence interval variables
        let mean;
        let stDev;
        let stErr;
        let errMargin;
        let confMin;
        let confMax;
        
        // Percentage variables
        let percentageVal;
        let minPercentage;
        let maxPercentage;  
        
        // Calculate confidence interval
        mean = data.reduce((a,b) => a+b)/ size;
        stDev = Math.sqrt(data.map(x => Math.pow(x-mean,2)).reduce((a,b) => a+b)/size);
        stErr = stDev / Math.sqrt(size);
        errMargin = stErr * confidenceFactor;
        confMax = errMargin + mean;
        confMin = mean - errMargin;

        // Confirm correctness of BCET, WCET, AET
        for (let i = 0; i < size; i++) {
            if (data[i] < BCET) BCET = data[i];
            if (data[i] > WCET) WCET = data[i];
        }

        // Calculate correctness up to +/-x %
        percentageVal = mean * percentageFactor;
        minPercentage = mean - percentageVal;
        maxPercentage = mean + percentageVal;

        return {
            confidenceFactor: confidenceFactor,
            mean,
            standardDeviation: stDev,
            standardError: stErr,
            errorMargin: errMargin,
            confidenceIntervalMin: confMin,
            confidenceIntervalMin: confMax,
            confidenceInterval: `${confMin} - ${confMax}`,
            accuracyFactor: percentageFactor,
            accuracyPercentageValue: percentageVal,
            minPercentageValue: minPercentage,
            maxPercentageValue: maxPercentage,
            accuracyRange: `${minPercentage} - ${maxPercentage}`,
            resultsWithinRange: confMin > minPercentage && maxPercentage > confMin,
            resultsWithinRangeMin: confMin > minPercentage, 
            resultsWithinRangeMax: maxPercentage > confMin
        }
    }
}
