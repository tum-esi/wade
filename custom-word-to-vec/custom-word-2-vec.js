const fs = require('fs')
const es = require('event-stream');

function findMyWords(word1, ...words){
    return new Promise( (res, rej) => {
        let isFirstLine = true;
        let myFirstLine = '';
        let lineNr = 0;
        let maxFileLine = 0;
        let maxLineSize = 0;
        let wordDict1 = undefined;
        let wordDict = [];

        words.push(word1);

        const s = fs.createReadStream('./cc.en.300.vec', {encoding: 'utf8'})
        .pipe(es.split())
        .pipe(es.mapSync( (line) => {

            // pause the readstream for performing manipulation
            s.pause();


            
            // Get the file length and length of number array for every word embedding
            if(isFirstLine){
                isFirstLine = false;

                let myFileMetrics = line.split(" ");
                maxFileLine =  + myFileMetrics.shift();
                maxLineSize =  + myFileMetrics.shift();
                console.log("FileSize: ",maxFileLine,"IDK:",maxLineSize);
            } else {
                // Search for the words given, in all further lines 
                words.forEach( (word) => {
                    if(line.startsWith(word + " ")){
                        let lineArray = line.split(" ");
                        wordDict.push( {id: lineArray.shift(),numbers: lineArray } );
                        console.log("LINE NR:", lineNr,"Found: ", word);
                    }
                });
            }

            //console.log({lineNr});

            // Quit the Readstream as soon as the last line is parsed (doesn't end automatically)
            // or all words where found 
            if ( (lineNr === maxFileLine) || (words.length === wordDict.length) ) {
                s.destroy();
                if (words.length === wordDict.length) {
                    res(wordDict);
                } else {
                    rej("Did not find all words in file");
                }
            } else {
                // resume the readstream
                s.resume();
            }

            lineNr += 1;

            })
            .on('error', (err) => {
                rej(new Error("Error while reading file." + err));
            })
        );

    });
}

// try different word pairs to evaluate whether closeness computation works
// TODO test this more into detail (computation is best guess approach, what is mentioned in literature i found)
findMyWords("Heat", /*"Heatpipe",*/ "China")
.then( (data) => {
    console.log("find words worked!");
    console.log({data});
    console.log(data[0].numbers[0]);
    let result = 0;
    data[0].numbers.forEach( (num, ind) => {
        result += (num - data[1].numbers[ind]) * (num - data[1].numbers[ind]);
    }); 
    result = Math.sqrt(result);
    result = 1/result;
    console.log({result});
}, (err) => {
    console.log("find words was not successfull", err);
});
