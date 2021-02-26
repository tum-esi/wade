import parseSeqD from '@/backend/SD/parseSeqD';
import generateSD from '@/backend/SD/generateSD';
import checkSeqD from '@/backend/SD/validateSeqD';
import { Mashup, TD } from '@/backend/Td';
import generateMashups from '@/backend/MaGe/generator';
import codeGenerator from '@/backend/SD/codeGen';
import * as N3 from 'n3';
import { fetchAndStoreVocab, vocabStore } from '@/backend/MaGe/semantics';

export default {
    namespaced: true,
    state: {
        // ===== STATIC STORE STATE ===== //
        mashupTabbar: [
            {
                tabId: 'editor',
                tabTitle: 'Editor',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/editor',
                tabIsActive: false
            },
            {
                tabId: 'mage',
                tabTitle: 'MaGe',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/mage',
                iconSrcPath: 'mage',
                tabIsActive: false
            }
        ],
        // ===== DYNAMIC STORE STATE ===== //
        isTabSelected: false,
        resultReady: false,
        showCode: false,
        showSd: true,
        numberOfActiveTabs: 0,
        currentMashup: null as Mashup | null,
        inputs:     null as Array<TD|Mashup> | null,
        outputs:    null as Array<TD|Mashup> | null,
        ios:        null as Array<TD|Mashup> | null,
        allInteractions: {propertyReads: [], propertyWrites: [], propertyObservations: [], eventSubs: [], actionReads: [], actionInvokes: []},
        allAnnotations: {propertyReads: [], propertyWrites: [], propertyObservations: [], eventSubs: [], actionReads: [], actionInvokes: []},
        allTdAnnotations: {inputs: [], outputs: [], ios: []},
        storedVocabs: [] as MAGE.storedVocabInterface[],
        generationForm: null as MAGE.GenerationFormInterace | null,
        result: null as MAGE.MashupGenerationResult | null,
        mashupLogic: null as object | null,
        editorLanguage: 'json',
    },
    getters: {
        getMashupCode(state): string {
            return (state.currentMashup as Mashup).mashupCode;
        },
        getMashupSd(state): string {
            return (state.currentMashup as Mashup).systemDescription;
        },
        getMashupChildren(state): Array<TD | Mashup> {
            return (state.currentMashup as Mashup).children;
        },
        getMashupChildrenForDropdown(state): Array<TD|Mashup> | null {
            const mashup = state.currentMashup as Mashup;
            const result = [] as any;
            for (const element of mashup.children) {
                result.push({title: element.id, key: element.id});
            }
            return result;
        },
        getInputsIds(state): string[] {
            const ids: string[] = [];
            for (const input of state.inputs as Array<TD|Mashup>) {
                ids.push(input.id);
            }
            return ids;
        },
        getOutputsIds(state): string[] {
            const ids: string[] = [];
            for (const output of state.outputs as Array<TD|Mashup>) {
                ids.push(output.id);
            }
            return ids;
        },
        getIosIds(state): string[] {
            const ids: string[] = [];
            for (const io of state.ios as Array<TD|Mashup>) {
                ids.push(io.id);
            }
            return ids;
        },
        getPropertyReads(state) {
            return state.allInteractions.propertyReads;
        },
        getPropertyWrites(state) {
            return state.allInteractions.propertyWrites;
        },
        getEventSubs(state) {
            return state.allInteractions.eventSubs;
        },
        getActionReads(state) {
            return state.allInteractions.actionReads;
        },
        getActionInvokes(state) {
            return state.allInteractions.actionInvokes;
        },
        getPropertyReadAnnotations(state) {
            return state.allAnnotations.propertyReads;
        },
        getPropertyWriteAnnotations(state) {
            return state.allAnnotations.propertyWrites;
        },
        getEventSubAnnotations(state) {
            return state.allAnnotations.eventSubs;
        },
        getActionReadAnnotations(state) {
            return state.allAnnotations.actionReads;
        },
        getActionInvokeAnnotations(state) {
            return state.allAnnotations.actionInvokes;
        },
        getInputsTdAnnotations(state) {
            return state.allTdAnnotations.inputs;
        },
        getOutputsTdAnnotations(state) {
            return state.allTdAnnotations.outputs;
        },
        getIosTdAnnotations(state) {
            return state.allTdAnnotations.ios;
        },
        getGenerationExecutionTimeBigInt(state) {
            let executionTime: bigint | number = state.result.executionTime;
            let numberOfConversions = 0;
            // Convert to micro-seconds
            if (executionTime > 1000) {
                // Convert to number if possible
                if (executionTime <= Number.MAX_SAFE_INTEGER) {
                    executionTime = Number(executionTime);
                    executionTime = executionTime / 1000;
                } else if (typeof executionTime === 'bigint') {
                    executionTime = executionTime / 1000n;
                }
                numberOfConversions++;
                // Convert to milli-seconds
                if (executionTime > 1000) {
                    // Convert to number if possible
                    if (typeof executionTime === 'number') {
                        executionTime = executionTime / 1000;
                    // Convert to number if possible
                    } else if (typeof executionTime === 'bigint') {
                        if (executionTime <= Number.MAX_SAFE_INTEGER) {
                            executionTime = Number(executionTime);
                            executionTime = executionTime / 1000;
                        } else if (typeof executionTime === 'bigint') {
                            executionTime = executionTime / 1000n;
                        }
                    }
                    numberOfConversions++;
                    // Convert to seconds
                    if (executionTime > 1000) {
                        if (typeof executionTime === 'number') {
                            executionTime = executionTime / 1000;
                        // Convert to number if possible
                        } else if (typeof executionTime === 'bigint') {
                            if (executionTime <= Number.MAX_SAFE_INTEGER) {
                                executionTime = Number(executionTime);
                                executionTime = executionTime / 1000;
                            } else if (typeof executionTime === 'bigint') {
                                executionTime = executionTime / 1000n;
                            }
                        }
                        numberOfConversions++;
                        // Convert to minutes
                        if (executionTime > 60) {
                            if (typeof executionTime === 'number') {
                                executionTime = executionTime / 60;
                            // Convert to number if possible
                            } else if (typeof executionTime === 'bigint') {
                                if (executionTime <= Number.MAX_SAFE_INTEGER) {
                                    executionTime = Number(executionTime);
                                    executionTime = executionTime / 60;
                                } else if (typeof executionTime === 'bigint') {
                                    executionTime = executionTime / 60n;
                                }
                            }
                            numberOfConversions++;
                            // Convert to hours
                            if (executionTime > 60) {
                                if (typeof executionTime === 'number') {
                                    executionTime = executionTime / 60;
                                // Convert to number if possible
                                } else if (typeof executionTime === 'bigint') {
                                    if (executionTime <= Number.MAX_SAFE_INTEGER) {
                                        executionTime = Number(executionTime);
                                        executionTime = executionTime / 60;
                                    } else if (typeof executionTime === 'bigint') {
                                        executionTime = executionTime / 60n;
                                    }
                                }
                                numberOfConversions++;
                                // Convert to days
                                if (executionTime > 24) {
                                    if (typeof executionTime === 'number') {
                                        executionTime = executionTime / 24;
                                    // Convert to number if possible
                                    } else if (typeof executionTime === 'bigint') {
                                        if (executionTime <= Number.MAX_SAFE_INTEGER) {
                                            executionTime = Number(executionTime);
                                            executionTime = executionTime / 24;
                                        } else if (typeof executionTime === 'bigint') {
                                            executionTime = executionTime / 24n;
                                        }
                                    }
                                    numberOfConversions++;
                                }
                            }
                        }
                    }
                }
            }
            let stringUnit: string = '';
            switch (numberOfConversions) {
                case 0:
                    stringUnit = 'ns';
                    break;
                case 1:
                    stringUnit = 'µs';
                    break;
                case 2:
                    stringUnit = 'ms';
                    break;
                case 3:
                    stringUnit = 's';
                    break;
                case 4:
                    stringUnit = 'min';
                    break;
                case 5:
                    stringUnit = 'h';
                    break;
                case 6:
                    stringUnit = 'd';
                    break;
                case 7:
                    stringUnit = 'a';
                    break;
            }

            return {executionTime, stringUnit};
        },
        getGenerationExecutionTime(state) {
            const executionTime: [number, number] = state.result.executionTime;
            let fractionOfseconds = executionTime[1];
            let multipleOfSeconds = executionTime[0];
            let numberOfConversionsNs = 0;
            let numberOfConversionsS = 0;
            let result = 0;
            // Convert to micro-seconds
            if (fractionOfseconds > 1000) {
                fractionOfseconds = fractionOfseconds / 1000;
                numberOfConversionsNs++;
                // Convert to milli-seconds
                if (fractionOfseconds > 1000) {
                    // Convert to number if possible
                    fractionOfseconds = fractionOfseconds / 1000;
                    numberOfConversionsNs++;
                    // Convert to seconds
                    if (fractionOfseconds > 1000) {
                        fractionOfseconds = fractionOfseconds / 1000;
                        numberOfConversionsNs++;
                    }
                }
            }
            // Convert to minutes
            if (multipleOfSeconds > 60) {
                    multipleOfSeconds = multipleOfSeconds / 60;
                    numberOfConversionsS++;
                // Convert to hours
                if (multipleOfSeconds > 60) {
                    multipleOfSeconds = multipleOfSeconds / 60;
                    numberOfConversionsS++;
                    // Convert to days
                    if (multipleOfSeconds > 24) {
                        multipleOfSeconds = multipleOfSeconds / 24;
                        numberOfConversionsS++;
                    }
                }
            }

            let stringUnit: string = '';
            if (multipleOfSeconds > 0) {
                switch (numberOfConversionsS) {
                    case 0:
                        stringUnit = 's';
                        break;
                    case 1:
                        stringUnit = 'min';
                        break;
                    case 2:
                        stringUnit = 'h';
                        break;
                    case 3:
                        stringUnit = 'd';
                        break;
                }
            } else if (numberOfConversionsS === 0) {
                switch (numberOfConversionsNs) {
                    case 0:
                        stringUnit = 'ns';
                        break;
                    case 1:
                        stringUnit = 'µs';
                        break;
                    case 2:
                        stringUnit = 'ms';
                        break;
                    case 3:
                        stringUnit = 's';
                        break;
                }
            }

            if (multipleOfSeconds > 0) {
                result = multipleOfSeconds;
                if (numberOfConversionsS === 0 && numberOfConversionsNs === 2) {
                    result = result + (fractionOfseconds / 1000);
                }
            } else {
                result = fractionOfseconds;
            }

            return {result, stringUnit};
        }
    },
    actions: {
        async generateMashups({commit, state},
                              generationPayload: {
                generationForm: MAGE.GenerationFormInterace,
            }) {
                for (let [index, vocab] of (state.storedVocabs as MAGE.storedVocabInterface[]).entries()) {
                    if (vocab.numberOfAccurances === 0) {
                        vocabStore.deleteGraph(new N3.NamedNode(vocab.vocabUrl));
                        state.storedVocabs.splice(index, 1);
                        index--;
                    }
                }

                const inputs: TD[] = [];
                const outputs: TD[] = [];
                inputs.push(...state.inputs);
                outputs.push(...state.outputs);

                generationPayload.generationForm.things.inputs = inputs;
                generationPayload.generationForm.things.outputs = outputs;
                for (const io of state.ios) {
                    generationPayload.generationForm.things.inputs.push(io);
                    generationPayload.generationForm.things.outputs.push(io);
                }
                const forbiddenInteractions: MAGE.VueInteractionInterface[] = [];
                const mustHaveInteractions: MAGE.VueInteractionInterface[] = [];
                for (const interactionType in state.allInteractions) {
                    for (const interaction of state.allInteractions[interactionType]) {
                        switch (interaction.restriction) {
                            case 'forbidden':
                                forbiddenInteractions.push(interaction);
                                break;
                            case 'mustHave':
                                mustHaveInteractions.push(interaction);
                                break;
                            case 'none':
                                continue;
                            default:
                                break;
                        }
                    }
                }
                const forbiddenAnnotations: MAGE.VueAnnotationInterface[] = [];
                const mustHaveAnnotations: MAGE.VueAnnotationInterface[] = [];
                for (const interactionType in state.allAnnotations) {
                    for (const annotation of state.allAnnotations[interactionType]) {
                        switch (annotation.restriction) {
                            case 'forbidden':
                                forbiddenAnnotations.push(annotation);
                                break;
                            case 'mustHave':
                                mustHaveAnnotations.push(annotation);
                                break;
                            case 'none':
                                continue;
                            default:
                                break;
                        }
                    }
                }
                const forbiddenTdAnnotations: MAGE.VueAnnotationInterface[] = [];
                const mustHaveTdAnnotations: MAGE.VueAnnotationInterface[] = [];
                for (const tdType in state.allTdAnnotations) {
                    for (const annotation of state.allTdAnnotations[tdType]) {
                        switch (annotation.restriction) {
                            case 'forbidden':
                                forbiddenTdAnnotations.push(annotation);
                                break;
                            case 'mustHave':
                                mustHaveTdAnnotations.push(annotation);
                                break;
                            case 'none':
                                continue;
                            default:
                                break;
                        }
                    }
                }
                generationPayload.generationForm.mashupName = (state.currentMashup as Mashup).title;
                generationPayload.generationForm.filters.forbiddenInteractions = forbiddenInteractions;
                generationPayload.generationForm.filters.mustHaveInteractions = mustHaveInteractions;
                generationPayload.generationForm.filters.forbiddenAnnotations = forbiddenAnnotations;
                generationPayload.generationForm.filters.mustHaveAnnotations = mustHaveAnnotations;
                generationPayload.generationForm.filters.forbiddenTdAnnotations = forbiddenTdAnnotations;
                generationPayload.generationForm.filters.mustHaveTdAnnotations = mustHaveTdAnnotations;
                commit('setResultReady', false);
                commit('setGenerationForm', generationPayload.generationForm);
                generateMashups(generationPayload.generationForm).then((result) => {
                    commit('setResult', result);
                    commit('toggleResultReady');
                });
        },
        async generateSystemDescription({state, commit}, mashupNr: number) {
            const mashupGenerationResult =  state.result as MAGE.MashupGenerationResult;
            const sdGenInput: {'mashup-uml': string, tds: string} = {'mashup-uml': mashupGenerationResult.plantUmls[mashupNr], 'tds': '['};
            // get all relevant TDs for the selected mashup
            const idsUsed: string[] = [];
            const outputs = state.generationForm.things.outputs as WADE.TDElementInterface[];
            const inputs = state.generationForm.things.inputs as WADE.TDElementInterface[];
            mashupGenerationResult.mashups[mashupNr].forEach(element => {
                if (!idsUsed.includes(element.thingId)) idsUsed.push(element.thingId);
            });
            outputs.concat(inputs).forEach(td => {
                const parsedTd = JSON.parse((td as WADE.TDElementInterface).content);
                if (idsUsed.includes(parsedTd.id)) {
                    sdGenInput.tds += td.content;
                    sdGenInput.tds += ',';
                }
            });
            sdGenInput.tds = sdGenInput.tds.slice(0, -1);
            sdGenInput.tds += ']';


            checkSeqD(sdGenInput['mashup-uml'])
            .then(() => {
                let mashupLogic: SDSQ.mashupLogic;
                let outSD: string;
                try {
                    mashupLogic = parseSeqD(sdGenInput['mashup-uml']);
                    state.mashupLogic = mashupLogic;
                } catch (error) {
                    return;
                }

                try {
                    outSD = generateSD(mashupLogic, sdGenInput.tds);
                } catch (error) {
                    return;
                }
                commit('setTabActive', 'editor');
                commit('setMashupSd', outSD);
                state.editorLanguage = 'json';
                state.showSd = true; state.showCode = false;
            })
            .catch(() => {
                return;
            });
        },
        async generateMashupCode({getters, commit, state}) {
            const sd = getters.getMashupSd;
            const mashupCodeParts = codeGenerator(JSON.parse(sd), state.mashupLogic);
            let mashupCode =
`/**************************************************
Base
**************************************************/
`;
            mashupCode += mashupCodeParts.base;
            mashupCode +=
`

/**************************************************
Code
**************************************************/
`;
            mashupCode += mashupCodeParts.code;
            commit('setTabActive', 'editor');
            commit('setMashupCode', mashupCode);
            state.editorLanguage = 'typescript';
            state.showSd = false; state.showCode = true;

        },
        async addTdToIo({dispatch, commit, state}: any, payload: {element: TD|Mashup, io: 'input'|'output'|'io'}) {
            await dispatch('addTdVocab', {element: payload.element});
            commit('addTdAnnotations', payload);
            switch (payload.io) {
                case 'input': commit('addToInputs', payload.element); break;
                case 'output': commit('addToOutputs', payload.element); break;
                case 'io': commit('addToIos', payload.element); break;
            }
        },
        async addTdVocab({state}: any, payload: {element: TD}) {
            const td = payload.element.content;
            const parsedTd = JSON.parse(td);
            const uris = parsedTd['@context'] as string | any[];
            if (typeof uris === 'string') return;
            for (const vocabObject of uris) {
                if (typeof vocabObject === 'string') continue;
                for (const vocab in vocabObject) {
                    if (vocab === '@language') continue;
                    const uri = vocabObject[vocab] as string;
                    const index = (state.storedVocabs as MAGE.storedVocabInterface[]).findIndex(v => v.vocabUrl === uri);
                    if (index !== -1) state.storedVocabs[index].numberOfAccurances++;
                    else {
                        (state.storedVocabs as MAGE.storedVocabInterface[]).push({vocabUrl: uri, numberOfAccurances: 1});
                        await fetchAndStoreVocab(uri);
                    }
                }
            }
        },
        removeTdFromIo({dispatch, commit, state}: any, payload: {element: number, io: 'input'|'output'|'io'}) {
            commit('removeTdAnnotations', payload);
            switch (payload.io) {
                case 'input': commit('removeFromInputs', payload.element); break;
                case 'output': commit('removeFromOutputs', payload.element); break;
                case 'io': commit('removeFromIos', payload.element); break;
            }
        }
    },
    mutations: {
        setMashupSd(state: any, mashupSd: string) {
            (state.currentMashup as Mashup).systemDescription = mashupSd;
        },
        setMashupCode(state: any, code: string) {
            (state.currentMashup as Mashup).mashupCode = code;
        },
        setCurrentMashup(state: any, mashup: Mashup) {
            (state.currentMashup as Mashup) = mashup;
            (state.inputs as Array<TD|Mashup>) = [];
            (state.outputs as Array<TD|Mashup>) = [];
            (state.ios as Array<TD|Mashup>) = [];
            state.allInteractions = {
                propertyReads: [],
                propertyWrites: [],
                propertyObservations: [],
                eventSubs: [],
                actionInvokes: [],
                actionReads: []
            };
            state.allAnnotations = {
                propertyReads: [],
                propertyWrites: [],
                propertyObservations: [],
                eventSubs: [],
                actionInvokes: [],
                actionReads: []
            };
            state.allTdAnnotations = {inputs: [], outputs: [], ios: []};
            state.storedVocabs = [];
            state.result = null;
            state.resultReady = false;
            state.showCode = false;
            state.showSd = true;
        },
        setGenerationForm(state: any, generationForm: MAGE.GenerationFormInterace) {
            state.generationForm = generationForm;
        },
        setResult(state: any, result: object) {
            state.result = result;
        },
        setResultReady(state: any, ready: boolean) {
            state.resultReady = ready;
        },
        addToInputs(state: any, ...elements: Array<TD|Mashup>) {
            const elementsFiltered = elements;
            let index = 0;
            for (const element of elementsFiltered) {
                if ((state.inputs as Array<TD|Mashup>).includes(element)) elementsFiltered.splice(index, 1);
                index++;
            }
            (state.inputs as Array<TD|Mashup>).push(...elementsFiltered);
            for (const element of elementsFiltered) {
                let indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromOutputs', indexToDelete);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromIos', indexToDelete);
                (this as any).commit('MashupStore/categorizeTdInteractions', {element, io: 'input'});
            }
        },
        addToOutputs(state: any, ...elements: Array<TD|Mashup>) {
            const elementsFiltered = elements;
            let index = 0;
            for (const element of elementsFiltered) {
                if ((state.outputs as Array<TD|Mashup>).includes(element)) elementsFiltered.splice(index, 1);
                index++;
            }
            (state.outputs as Array<TD|Mashup>).push(...elementsFiltered);
            for (const element of elementsFiltered) {
                let indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromInputs', indexToDelete);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromIos', indexToDelete);
                (this as any).commit('MashupStore/categorizeTdInteractions', {element, io: 'output'});
            }
        },
        addToIos(state: any, ...elements: Array<TD|Mashup>) {
            const elementsFiltered = elements;
            let index = 0;
            for (const element of elementsFiltered) {
                if ((state.ios as Array<TD|Mashup>).includes(element)) elementsFiltered.splice(index, 1);
                index++;
            }
            (state.ios as Array<TD|Mashup>).push(...elementsFiltered);
            for (const element of elementsFiltered) {
                let indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromInputs', indexToDelete);
                indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromOutputs', indexToDelete);
                (this as any).commit('MashupStore/categorizeTdInteractions', {element, io: 'io'});
            }
        },
        categorizeTdInteractions(state: any, payload: {element: TD, io: string}) {
            const parsedTd = JSON.parse(payload.element.content);

            function getAnnotationDescription(annotation: string): string | null {
                const parts = annotation.split(':');
                for (const vocabObj of parsedTd['@context']) {
                    if (typeof vocabObj === 'string') continue;
                    for (const vocab in vocabObj) {
                        if (vocab === parts[0]) {
                            const uri = vocabObj[vocab];
                            const tmp = vocabStore.getObjects(
                                new N3.NamedNode(`${uri}${parts[1]}`),
                                new N3.NamedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
                                new N3.NamedNode(uri));
                            if (tmp.length > 0) return tmp[0].id;
                            return null;
                        }
                    }
                }
                return null;
            }

            for (const prop in parsedTd.properties) {
                const description = parsedTd.properties[prop].description ? parsedTd.properties[prop].description : null;
                let annotations = parsedTd.properties[prop]['@type'] as string | string[] | undefined;
                // put all annotations in string array
                if (!annotations) annotations = [];
                if (typeof annotations === 'string') annotations = [annotations];
                // construct VueAnnotation objects
                const readAnnotationsToPush: MAGE.VueAnnotationInterface[] = [];
                const observeAnnotationsToPush: MAGE.VueAnnotationInterface[] = [];
                const writeAnnotationsToPush: MAGE.VueAnnotationInterface[] = [];
                for (const annotation of annotations) {
                    let comment: string | null = null;
                    comment = getAnnotationDescription(annotation);

                    readAnnotationsToPush.push({
                        annotation,
                        type: 'property-read',
                        numberOfAccurance: 1,
                        description: comment,
                        restriction: 'none'
                    });
                    if (parsedTd.properties[prop].observable) {
                        observeAnnotationsToPush.push({
                            annotation,
                            type: 'property-observe',
                            numberOfAccurance: 1,
                            description: comment,
                            restriction: 'none'
                        });
                    }
                    writeAnnotationsToPush.push({
                        annotation,
                        type: 'property-write',
                        numberOfAccurance: 1,
                        description: comment,
                        restriction: 'none'
                    });
                }
                const dataType = parsedTd.properties[prop].type ? parsedTd.properties[prop].type : 'null';
                // construct VueInteraction objects
                const readInteractionToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title,
                    thingId: parsedTd.id,
                    name: prop,
                    description,
                    annotations,
                    dataType,
                    type: 'property-read',
                    restriction: 'none'
                };
                const writeInteractionToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title,
                    thingId: parsedTd.id,
                    name: prop,
                    description,
                    annotations,
                    dataType,
                    type: 'property-write',
                    restriction: 'none'
                };
                const observeInteractionToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title,
                    thingId: parsedTd.id,
                    name: prop,
                    description,
                    annotations,
                    dataType,
                    type: 'property-observe',
                    restriction: 'none'
                };
                if (payload.io === 'input' && !parsedTd.properties[prop].writeOnly) {
                    // push interaction
                    state.allInteractions.propertyReads.push(readInteractionToPush);
                    if (parsedTd.properties[prop].observable) state.allInteractions.propertyObservations.push(observeInteractionToPush);
                    // push annotations if not already present
                    for (const annotation of readAnnotationsToPush) {
                        const index = state.allAnnotations.propertyReads.findIndex(a => a.annotation === annotation.annotation);
                        if (index !== -1) {
                            state.allAnnotations.propertyReads[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.propertyReads.push(annotation);
                        }
                    }
                    if (parsedTd.properties[prop].observable) {
                        for (const annotation of observeAnnotationsToPush) {
                            const index = state.allAnnotations.propertyObservations.findIndex(a => a.annotation === annotation.annotation);
                            if (index !== -1) {
                                state.allAnnotations.propertyObservations[index].numberOfAccurance++;
                            } else {
                                state.allAnnotations.propertyObservations.push(annotation);
                            }
                        }
                    }
                } else if (payload.io === 'output' && !parsedTd.properties[prop].readOnly) {
                    // push interaction
                    state.allInteractions.propertyWrites.push(writeInteractionToPush);
                    // push annotations if not already present
                    for (const annotation of writeAnnotationsToPush) {
                        const index = state.allAnnotations.propertyWrites.findIndex(a => a.annotation === annotation.annotation);
                        if (index !== -1) {
                            state.allAnnotations.propertyWrites[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.propertyWrites.push(annotation);
                        }
                    }
                } else if (payload.io === 'io') {
                    if (!parsedTd.properties[prop].writeOnly) {
                        // push interaction
                        state.allInteractions.propertyReads.push(readInteractionToPush);
                        if (parsedTd.properties[prop].observable) state.allInteractions.propertyObservations.push(observeInteractionToPush);
                        // push annotations if not already present
                        for (const annotation of readAnnotationsToPush) {
                            const index = state.allAnnotations.propertyReads.findIndex(a => a.annotation === annotation.annotation);
                            if (index !== -1) {
                                state.allAnnotations.propertyReads[index].numberOfAccurance++;
                            } else {
                                state.allAnnotations.propertyReads.push(annotation);
                            }
                        }
                        if (parsedTd.properties[prop].observable) {
                            for (const annotation of readAnnotationsToPush) {
                                const index = state.allAnnotations.propertyObservations.findIndex(a => a.annotation === annotation.annotation);
                                if (index !== -1) {
                                    state.allAnnotations.propertyObservations[index].numberOfAccurance++;
                                } else {
                                    state.allAnnotations.propertyObservations.push(annotation);
                                }
                            }
                        }
                    }
                    if (!parsedTd.properties[prop].readOnly) {
                        // push interaction
                        state.allInteractions.propertyWrites.push(writeInteractionToPush);
                        // push annotations if not already present
                        for (const annotation of writeAnnotationsToPush) {
                            const index = state.allAnnotations.propertyWrites.findIndex(a => a.annotation === annotation.annotation);
                            if (index !== -1) {
                                state.allAnnotations.propertyWrites[index].numberOfAccurance++;
                            } else {
                                state.allAnnotations.propertyWrites.push(annotation);
                            }
                        }
                    }
                }
            }
            for (const event in parsedTd.events) {
                const description = parsedTd.events[event].description ? parsedTd.events[event].description : null;
                let annotations = parsedTd.events[event]['@type'] as string | string[] | undefined;
                // put all annotations in string array
                if (!annotations) annotations = [];
                if (typeof annotations === 'string') annotations = [annotations];
                // construct VueAnnotation objects
                const annotationsToPush: MAGE.VueAnnotationInterface[] = [];
                for (const annotation of annotations) {
                    let comment: string | null = null;
                    comment = getAnnotationDescription(annotation);

                    annotationsToPush.push({
                        annotation,
                        type: 'event-subscribe',
                        numberOfAccurance: 1,
                        description: comment,
                        restriction: 'none'
                    });
                }
                let dataType: any = 'null';
                if (parsedTd.events[event].data) dataType = parsedTd.events[event].data.type ? parsedTd.events[event].data.type : 'null';
                // construct VueInteraction objects
                const interactionToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title,
                    thingId: parsedTd.id, name: event,
                    description,
                    annotations,
                    dataType,
                    type: 'event-subscribe',
                    restriction: 'none'
                };

                if (payload.io === 'input' ||  payload.io === 'io') {
                    // push interaction
                    state.allInteractions.eventSubs.push(interactionToPush);
                    // push annotations if not already present
                    for (const annotation of annotationsToPush) {
                        const index = state.allAnnotations.eventSubs.findIndex(a => a.annotation === annotation.annotation);
                        if (index !== -1) {
                            state.allAnnotations.eventSubs[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.eventSubs.push(annotation);
                        }
                    }
                }
            }
            for (const action in parsedTd.actions) {
                const description = parsedTd.actions[action].description ? parsedTd.actions[action].description : null;
                let annotations = parsedTd.actions[action]['@type'] as string | string[] | undefined;
                // put all annotations in string array
                if (!annotations) annotations = [];
                if (typeof annotations === 'string') annotations = [annotations];
                // construct VueAnnotation objects
                const readAnnotationsToPush: MAGE.VueAnnotationInterface[] = [];
                const writeAnnotationsToPush: MAGE.VueAnnotationInterface[] = [];
                if (annotations) for (const annotation of annotations) {
                    let comment: string | null = null;
                    comment = getAnnotationDescription(annotation);

                    readAnnotationsToPush.push({
                        annotation,
                        type: 'action-read',
                        numberOfAccurance: 1,
                        description: comment,
                        restriction: 'none'
                    });
                    writeAnnotationsToPush.push({
                        annotation,
                        type: 'action-invoke',
                        numberOfAccurance: 1,
                        description: comment,
                        restriction: 'none'
                    });
                }
                let dataTypeRead: any = 'null';
                let dataTypeInvoke: any = 'null';
                if (parsedTd.actions[action].output) dataTypeRead = parsedTd.actions[action].output.type ? parsedTd.actions[action].output.type : 'null';
                if (parsedTd.actions[action].input) dataTypeInvoke = parsedTd.actions[action].input.type ? parsedTd.actions[action].input.type : 'null';
                // construct VueInteraction objects
                const actionInvokeToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title,
                    thingId: parsedTd.id,
                    name: action,
                    description,
                    annotations,
                    dataType: dataTypeInvoke,
                    type: 'action-invoke',
                    restriction: 'none'
                };
                const actionReadToPush: MAGE.VueInteractionInterface = {
                    title: payload.element.title,
                    thingId: parsedTd.id,
                    name: action,
                    description,
                    annotations,
                    dataType: dataTypeRead,
                    type: 'action-read',
                    restriction: 'none'
                };
                if (payload.io === 'input') {
                    // push interaction
                    state.allInteractions.actionReads.push(actionReadToPush);
                    // push annotations if not already present
                    for (const annotation of readAnnotationsToPush) {
                        const index = state.allAnnotations.actionReads.findIndex(a => a.annotation === annotation.annotation);
                        if (index !== -1) {
                            state.allAnnotations.actionReads[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.actionReads.push(annotation);
                        }
                    }
                } else if (payload.io === 'output') {
                    // push interaction
                    state.allInteractions.actionInvokes.push(actionInvokeToPush);
                    // push annotations if not already present
                    for (const annotation of writeAnnotationsToPush) {
                        const index = state.allAnnotations.actionInvokes.findIndex(a => a.annotation === annotation.annotation);
                        if (index !== -1) {
                            state.allAnnotations.actionInvokes[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.actionInvokes.push(annotation);
                        }
                    }
                } else if (payload.io === 'io') {
                    // push interaction
                    state.allInteractions.actionReads.push(actionReadToPush);
                    // push interaction
                    state.allInteractions.actionInvokes.push(actionInvokeToPush);
                    // push annotations if not already present
                    for (const annotation of readAnnotationsToPush) {
                        const index = state.allAnnotations.actionReads.findIndex(a => a.annotation === annotation.annotation);
                        if (index !== -1) {
                            state.allAnnotations.actionReads[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.actionReads.push(annotation);
                        }
                    }

                    for (const annotation of writeAnnotationsToPush) {
                        const index = state.allAnnotations.actionInvokes.findIndex(a => a.annotation === annotation.annotation);
                        if (index !== -1) {
                            state.allAnnotations.actionInvokes[index].numberOfAccurance++;
                        } else {
                            state.allAnnotations.actionInvokes.push(annotation);
                        }
                    }
                }
            }
        },
        addTdAnnotations(state: any, payload: {element: TD, io: 'input' | 'output' | 'io'}) {
            const td = payload.element.content;
            const parsedTd = JSON.parse(td);
            let annotations: string | string[] | undefined = parsedTd['@type'];
            if (!annotations) return;
            if (typeof annotations === 'string') annotations = [annotations];

            function getAnnotationObjects(annotations: string[]): MAGE.VueAnnotationInterface[] {
                let description: string | null = null;
                const resultAnnotation: MAGE.VueAnnotationInterface[] = [];

                for (const annotation of annotations) {
                    const annotationsArray: MAGE.VueAnnotationInterface[] = state.allTdAnnotations[`${payload.io}s`];
                    const annotationIndex = annotationsArray.findIndex( a => a.annotation === annotation);
                    // If a VueAnnotation Object is already there, just increment number of accurances
                    if (annotationIndex !== -1) annotationsArray[annotationIndex].numberOfAccurance++;
                    else {
                    // Make a new VueAnnotation Object
                    // Search for description first
                        const annotationParts = annotation.split(':');
                        // make sure annotation is based on a vocab
                        if (annotationParts.length > 1) {
                            // get all contexts in TD
                            const tdContexts = parsedTd['@context'];
                            // make sure context is an array
                            if (typeof tdContexts === 'object') {
                                for (const context of tdContexts) {
                                    // skip string context
                                    if (typeof context === 'string') continue;
                                    // get vocab uri
                                    const vocabUri = context[annotationParts[0]];
                                    // search store for comment
                                    const tmp = vocabStore.getObjects(
                                        new N3.NamedNode(`${vocabUri}${annotationParts[1]}`),
                                        new N3.NamedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
                                        new N3.NamedNode(vocabUri))[0];
                                    if (tmp) description = tmp.value;
                                }
                            }
                        }
                        // make new object with the found description
                        const annotationToPush: MAGE.VueAnnotationInterface = {
                            annotation,
                            numberOfAccurance: 1,
                            description,
                            restriction: 'none',
                            type: payload.io
                        };
                        // push to results
                        resultAnnotation.push(annotationToPush);
                    }
                }
                return resultAnnotation;
            }
            state.allTdAnnotations[`${payload.io}s`].push(...getAnnotationObjects(annotations));
        },
        setInteractionRestriction(state: any, payload: {interaction: MAGE.VueInteractionInterface, restriction: 'none' | 'forbidden' | 'mustHave'}) {
            let index: number;
            const interaction = payload.interaction;
            const restriction = payload.restriction;
            switch (interaction.type) {
                case 'property-read':
                    index = (state.allInteractions.propertyReads as MAGE.VueInteractionInterface[]).findIndex(prop => prop.thingId === interaction.thingId &&
                        prop.name === interaction.name);
                    if (index !== -1) (state.allInteractions.propertyReads as MAGE.VueInteractionInterface[])[index].restriction = restriction; break;
                case 'property-write':
                    index = (state.allInteractions.propertyWrites as MAGE.VueInteractionInterface[]).findIndex(prop => prop.thingId === interaction.thingId &&
                        prop.name === interaction.name);
                    if (index !== -1) (state.allInteractions.propertyWrites as MAGE.VueInteractionInterface[])[index].restriction = restriction; break;
                case 'event-subscribe':
                    index = (state.allInteractions.eventSubs as MAGE.VueInteractionInterface[]).findIndex(event => event.thingId === interaction.thingId &&
                        event.name === interaction.name);
                    if (index !== -1) (state.allInteractions.eventSubs as MAGE.VueInteractionInterface[])[index].restriction = restriction; break;
                case 'action-invoke':
                    index = (state.allInteractions.actionInvokes as MAGE.VueInteractionInterface[]).findIndex(action => action.thingId === interaction.thingId &&
                        action.name === interaction.name);
                    if (index !== -1) (state.allInteractions.actionInvokes as MAGE.VueInteractionInterface[])[index].restriction = restriction; break;
                case 'action-read':
                        index = (state.allInteractions.actionReads as MAGE.VueInteractionInterface[]).findIndex(action => action.thingId === interaction.thingId &&
                            action.name === interaction.name);
                        if (index !== -1) (state.allInteractions.actionReads as MAGE.VueInteractionInterface[])[index].restriction = restriction; break;
                case 'property-observe':
                    index = (state.allInteractions.propertyObservations as MAGE.VueInteractionInterface[]).findIndex(action => action.thingId === interaction.thingId &&
                        action.name === interaction.name);
                    if (index !== -1) (state.allInteractions.propertyObservations as MAGE.VueInteractionInterface[])[index].restriction = restriction; break;
            }

        },
        setAnnotationRestriction(state: any, payload: {annotation: MAGE.VueAnnotationInterface, restriction: 'none' | 'forbidden' | 'mustHave'}) {
            let index: number;
            const annotation = payload.annotation;
            const restriction = payload.restriction;
            switch (annotation.type) {
                case 'property-read':
                    index = (state.allAnnotations.propertyReads as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if (index !== -1) (state.allAnnotations.propertyReads as MAGE.VueAnnotationInterface[])[index].restriction = restriction; break;
                case 'property-write':
                    index = (state.allAnnotations.propertyWrites as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if (index !== -1) (state.allAnnotations.propertyWrites as MAGE.VueAnnotationInterface[])[index].restriction = restriction; break;
                case 'event-subscribe':
                    index = (state.allAnnotations.eventSubs as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if (index !== -1) (state.allAnnotations.eventSubs as MAGE.VueAnnotationInterface[])[index].restriction = restriction; break;
                case 'action-invoke':
                    index = (state.allAnnotations.actionInvokes as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if (index !== -1) (state.allAnnotations.actionInvokes as MAGE.VueAnnotationInterface[])[index].restriction = restriction; break;
                case 'action-read':
                    index = (state.allAnnotations.actionReads as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if (index !== -1) (state.allAnnotations.actionReads as MAGE.VueAnnotationInterface[])[index].restriction = restriction;  break;
                case 'property-observe':
                    index = (state.allAnnotations.propertyObservations as MAGE.VueAnnotationInterface[]).findIndex(a => a.annotation === annotation.annotation);
                    if (index !== -1) (state.allAnnotations.propertyObservations as MAGE.VueAnnotationInterface[])[index].restriction = restriction;  break;
            }
        },
        setTdAnnotationRestriction(state: any, payload: {annotation: MAGE.VueAnnotationInterface, restriction: 'none' | 'forbidden' | 'mustHave'}) {
            let index: number;
            const annotation = payload.annotation;
            const restriction = payload.restriction;
            const annotationArray: MAGE.VueAnnotationInterface[] = state.allTdAnnotations[`${annotation.type}s`];
            index = annotationArray.findIndex(a => a.annotation === annotation.annotation);
            if (index !== -1) state.allTdAnnotations[`${annotation.type}s`][index].restriction = restriction;
        },
        removeFromInputs(state: any, element: TD|Mashup|number) {
            if (typeof element === 'number') {
                (this as any).commit('MashupStore/removeInteractions', state.inputs[element]);
                (this as any).commit('MashupStore/removeVocabs', {element: state.inputs[element]});
                (state.inputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                (this as any).commit('MashupStore/removeInteractions', element);
                (this as any).commit('MashupStore/removeVocabs', {element});
                const indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                (state.inputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeFromOutputs(state: any, element: TD|Mashup|number) {
            if (typeof element === 'number') {
                (this as any).commit('MashupStore/removeInteractions', state.outputs[element]);
                (this as any).commit('MashupStore/removeVocabs', {element: state.outputs[element]});
                (state.outputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                (this as any).commit('MashupStore/removeInteractions', element);
                (this as any).commit('MashupStore/removeVocabs', {element});
                const indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                (state.outputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeFromIos(state: any, element: TD|Mashup|number) {
            if (typeof element === 'number') {
                (this as any).commit('MashupStore/removeInteractions', state.ios[element]);
                (this as any).commit('MashupStore/removeVocabs', {element: state.ios[element]});
                (state.ios as Array<TD|Mashup>).splice(element, 1);
            } else {
                (this as any).commit('MashupStore/removeInteractions', element);
                (this as any).commit('MashupStore/removeVocabs', {element});
                const indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                (state.ios as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeInteractions(state: any, element: TD) {
            const parsedTd = JSON.parse(element.content);
            function removeAnnotations(
                interaction: MAGE.VueInteractionInterface,
                type: 'properties' | 'events' | 'actions',
                category: 'propertyReads' | 'propertyWrites' | 'eventSubs' | 'actionReads' | 'actionInvokes' | 'propertyObservations') {
                    const interactionName = interaction.name;
                    let annotations = parsedTd[type][interactionName]['@type'] as string | string[] | undefined;
                    // put all annotations in string array
                    if (typeof annotations === 'string') annotations = [annotations];
                    if (annotations) {
                        for (const annotation of annotations) {
                            const aIndex = state.allAnnotations[category].findIndex(a => a.annotation === annotation);
                            if (aIndex !== -1) {
                                state.allAnnotations[category][aIndex].numberOfAccurance = --state.allAnnotations[category][aIndex].numberOfAccurance;
                                if (state.allAnnotations[category][aIndex].numberOfAccurance === 0) state.allAnnotations[category].splice(aIndex, 1);
                            }

                        }
                    }
            }
            let index = 0;
            for (index = 0; index < state.allInteractions.propertyReads.length; index++) {
                if (state.allInteractions.propertyReads[index].thingId === parsedTd.id &&
                    state.allInteractions.propertyReads[index].title === element.title) {
                    const prop = state.allInteractions.propertyReads[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(prop, 'properties', 'propertyReads');
                    state.allInteractions.propertyReads.splice(index, 1);
                    index--;
                }
            }
            for (index = 0; index < state.allInteractions.propertyWrites.length; index++) {
                if (state.allInteractions.propertyWrites[index].thingId === parsedTd.id &&
                    state.allInteractions.propertyWrites[index].title === element.title) {
                    const prop = state.allInteractions.propertyWrites[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(prop, 'properties', 'propertyWrites');
                    state.allInteractions.propertyWrites.splice(index, 1);
                    index--;
                }
            }
            for (index = 0; index < state.allInteractions.eventSubs.length; index++) {
                if (state.allInteractions.eventSubs[index].thingId === parsedTd.id &&
                    state.allInteractions.eventSubs[index].title === element.title) {
                    const event = state.allInteractions.eventSubs[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(event, 'events', 'eventSubs');
                    state.allInteractions.eventSubs.splice(index, 1);
                    index--;
                }
            }
            for (index = 0; index < state.allInteractions.actionInvokes.length; index++) {
                if (state.allInteractions.actionInvokes[index].thingId === parsedTd.id &&
                    state.allInteractions.actionInvokes[index].title === element.title) {
                    const action = state.allInteractions.actionInvokes[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(action, 'actions', 'actionInvokes');
                    state.allInteractions.actionInvokes.splice(index, 1);
                    index--;
                }
            }
            for (index = 0; index < state.allInteractions.actionReads.length; index++) {
                if (state.allInteractions.actionReads[index].thingId === parsedTd.id &&
                    state.allInteractions.actionReads[index].title === element.title) {
                    const action = state.allInteractions.actionReads[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(action, 'actions', 'actionReads');
                    state.allInteractions.actionReads.splice(index, 1);
                    index--;
                }
            }
            for (index = 0; index < state.allInteractions.propertyObservations.length; index++) {
                if (state.allInteractions.propertyObservations[index].thingId === parsedTd.id &&
                    state.allInteractions.propertyObservations[index].title === element.title) {
                    const action = state.allInteractions.propertyObservations[index] as MAGE.VueInteractionInterface;
                    removeAnnotations(action, 'properties', 'propertyObservations');
                    state.allInteractions.propertyObservations.splice(index, 1);
                    index--;
                }
            }
        },
        removeVocabs(state: any, payload: {element: TD}) {
            const td = payload.element.content;
            const parsedTd = JSON.parse(td);
            const uris = parsedTd['@context'] as string | any[];
            if (typeof uris === 'string') return;
            for (const vocabObject of uris) {
                if (typeof vocabObject === 'string') continue;
                for (const vocab in vocabObject) {
                    const uri = vocabObject[vocab] as string;
                    const index = (state.storedVocabs as MAGE.storedVocabInterface[]).findIndex(v => v.vocabUrl === uri);
                    if (index !== -1 && state.storedVocabs[index].numberOfAccurances > 0) state.storedVocabs[index].numberOfAccurances--;
                }
            }
        },
        removeTdAnnotations(state: any, payload: {element: number, io: 'input' | 'output' | 'io'}) {
            const tdObject: TD = state[`${payload.io}s`][payload.element];
            const td = tdObject.content;
            const parsedTd = JSON.parse(td);
            let tdAnnotations: string | string[] | undefined = parsedTd['@type'];
            if (!tdAnnotations) return;
            if (typeof tdAnnotations === 'string') tdAnnotations = [tdAnnotations];
            for (const annotation of tdAnnotations) {
                const annotationsArray: MAGE.VueAnnotationInterface[] = state.allTdAnnotations[`${payload.io}s`];
                const annotationIndex = annotationsArray.findIndex(a => a.annotation === annotation);
                if (annotationIndex !== -1) annotationsArray.splice(annotationIndex, 1);
            }
        },
        toggleTab(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId) {
                    tab.tabIsActive = !tab.tabIsActive;
                    state.numberOfActiveTabs = tab.tabIsActive ? ++state.numberOfActiveTabs : --state.numberOfActiveTabs;
                    break;
                }
            }
        },
        toggleResultReady(state) {
            state.resultReady = !state.resultReady;
        },
        setTabActive(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId) {
                    if (tab.tabIsActive === true) return;
                    tab.tabIsActive = true;
                    ++state.numberOfActiveTabs;
                    break;
                }
            }
        },
        setTabInactive(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId) {
                    if (tab.tabIsActive === false) return;
                    tab.tabIsActive = false;
                    --state.numberOfActiveTabs;
                    break;
                }
            }
        }
    }
};
