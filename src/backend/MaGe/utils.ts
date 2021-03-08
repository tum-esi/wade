// ------------------ MATH & STATISTICS ------------------

/** Coding magic that I have no idea what it does :)
 * To me, this is little piece of code is coding magic as I really have no idea how this calculates the cartesian product.
 * The editor cannot even infer what types are used
 * But, given that it works, I would say that maybe it is science so advanced that it is considered as magic :P
 * @param a an array
 * @param b an array
 * @returns an array of arrays
 */
const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
/** A function that calculates the cartesian of arrays using the above-mentioned coding magic :D
 * 
 * @param a an array
 * @param b an array
 * @param c an array of array
 * @returns the cartesian product 
 */
const cartesian = (a?, b?, ...c) => (b ? cartesian(f(a, b), ...c) : a);

/** Calculates mashups using the cartesian product and removes duplicate mashups
 * 
 * @param {MAGE.InteractionInterface} params a 3-dimensional array of interactions
 * @returns {MAGE.InteractionInterface[][]} a 2-dimensional array with cartesian product 
 */
const noDuplicatesCartesian = (...params: MAGE.InteractionInterface[][][]): MAGE.InteractionInterface[][] => {
    const product = cartesian(...params);

    const hashes: string[] = [];
    const newArray: MAGE.InteractionInterface[][] = [];

    product.forEach((element: any[]) => {
        // make sure that combination does not contain same output twice
        const ids: string[] = [];
        const newElement: MAGE.InteractionInterface[] = [];
        element.forEach(o => {
            if (!ids.includes(o.id)) {
                ids.push(o.id);
                newElement.push(o);
            }
        });

        // make sure that combination does not get added twice in different orders
        let elementHash = '';
        newElement.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
        newElement.forEach(e => elementHash += e.id);

        if (!hashes.includes(elementHash)) {
            newArray.push(newElement);
            hashes.push(elementHash);
        }
    });

    return newArray;
};

/** Calculates the factorial of `num`
 * 
 * @param {number} num the factorial number
 * @returns {number} the factorial of `num`
 */
export let factorial = (num: number): number => {
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
};

export let modifiedCartesianProduct = noDuplicatesCartesian;
