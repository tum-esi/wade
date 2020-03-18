const fs = require("fs"); 
const path = require("path");
const ConfidenceCalculator = require("./confidence_calculator");

const folderPath = process.argv.slice(2)[0];
if (!folderPath) { 
    console.info("Missing file path. Exit process.")
    process.exit(0);
}

// Create dir for results
const resultPath = path.join(__dirname, 'results');
if (!fs.existsSync(resultPath)) fs.mkdirSync(resultPath);

// Compute results
fs.readdirSync(folderPath).forEach((filePath) => {
    let file = fs.readFileSync(`${folderPath}/${filePath}`, "utf-8");
    if (!file) {
        console.info(`Unable to read file: ${folderPath}/${filePath}`);
    } else {
        const calc = new ConfidenceCalculator(file);
        const results = JSON.stringify(calc.calculateAll());
        const resultFileName = filePath.replace(/.json/i, '');
        fs.writeFileSync(path.join(resultPath, `${resultFileName}_results.json`), results);
    }
});

