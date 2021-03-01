// ------------------ MATH & STATISTICS ------------------

// calculates the cartesian product from two array
function cartesianProduct<T>(...allEntries: T[][]): T[][] {
    return allEntries.reduce<T[][]>(
      (results, entries) =>
        results
          .map(result => entries.map(entry => result.concat([entry])))
          .reduce((subResults, result) => subResults.concat(result), []),
      [[]]
    );
}

const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a?, b?, ...c) => (b ? cartesian(f(a, b), ...c) : a);

// remove duplicates mashups from cartesian product
const noDuplicatesCartesian = (...params: MAGE.InteractionInterface[][][]) => {
    // let product = cartesianProduct(...params);
    const product = cartesian(...params);

    const hashes: string[] = [];
    const new_array: MAGE.InteractionInterface[][] = [];

    product.forEach(element => {
        // make sure that combination doesnt contain same output twice
        const ids: string[] = [];
        const newElement: MAGE.InteractionInterface[] = [];
        element.forEach(o => {
            if (!ids.includes(o.id)) {
                ids.push(o.id);
                newElement.push(o);
            }
        });

        // make sure that combination doesnt get added twice in different orders
        let elementHash = '';
        newElement.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
        newElement.forEach(e => elementHash += e.id);

        if (!hashes.includes(elementHash)) {
            new_array.push(newElement);
            hashes.push(elementHash);
        }
    });

    return new_array;
};

export let factorial = (num: number) => {
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
};

export let modifiedCartesianProduct = noDuplicatesCartesian;
