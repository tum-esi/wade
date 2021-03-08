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
        allInteractions: {
            propertyReads: [] as MAGE.VueInteractionInterface[], 
            propertyWrites: [] as MAGE.VueInteractionInterface[],
            propertyObservations: [] as MAGE.VueInteractionInterface[],
            eventSubs: [] as MAGE.VueInteractionInterface[],
            actionReads: [] as MAGE.VueInteractionInterface[],
            actionInvokes: [] as MAGE.VueInteractionInterface[]
        },
        allAnnotations: {
            propertyReads: [] as MAGE.VueAnnotationInterface[],
            propertyWrites: [] as MAGE.VueAnnotationInterface[],
            propertyObservations: [] as MAGE.VueAnnotationInterface[],
            eventSubs: [] as MAGE.VueAnnotationInterface[],
            actionReads: [] as MAGE.VueAnnotationInterface[],
            actionInvokes: [] as MAGE.VueAnnotationInterface[]
        },
        allTdAnnotations: {
            inputs: [] as MAGE.VueAnnotationInterface[],
            outputs: [] as MAGE.VueAnnotationInterface[],
            ios: [] as MAGE.VueAnnotationInterface[]
        },
        storedVocabs: [] as MAGE.storedVocabInterface[],
        generationForm: null as MAGE.GenerationFormInterface | null,
        result: null as MAGE.MashupGenerationResult | null,
        mashupLogic: null as object | null,
        editorLanguage: 'json',
    },
    getters: {
        /** Getter for mashup code
         * 
         * @param state store state
         * @returns {string} mashup code
         */
        getMashupCode(state:any): string {
            return (state.currentMashup as Mashup).mashupCode;
        },
        /** Getter for SD
         * 
         * @param state store state
         * @returns {string} the SD
         */
        getMashupSd(state: any): string {
            return (state.currentMashup as Mashup).systemDescription;
        },
        /** Getter for mashup Children
         * 
         * @param state 
         * @returns {Array<TD | Mashup>} an array of mashup children
         */
        getMashupChildren(state: any): Array<TD | Mashup> {
            return (state.currentMashup as Mashup).children;
        },
        /** Getter for mashup children encapsulated for `DropdownOptions`
         * 
         * @param state store state
         * @returns {WADE.DropdownOptionInterface[]} an array of dropdown options
         */
        getMashupChildrenForDropdown(state: any): WADE.DropdownOptionInterface[] {
            const mashup = state.currentMashup as Mashup;
            const result: WADE.DropdownOptionInterface[] = [];
            for (const element of mashup.children) {
                result.push({title: element.id, key: element.id});
            }
            return result;
        },
        /** Getter for IDs of input TDs
         * 
         * @param state store state
         * @returns {string[]} an array containing the IDs
         */
        getInputsIds(state: any): string[] {
            const ids: string[] = [];
            for (const input of state.inputs as Array<TD|Mashup>) {
                ids.push(input.id);
            }
            return ids;
        },
        /** Getter for IDs of output TDs
         * 
         * @param state store state
         * @returns an array containing the IDs
         */
        getOutputsIds(state: any): string[] {
            const ids: string[] = [];
            for (const output of state.outputs as Array<TD|Mashup>) {
                ids.push(output.id);
            }
            return ids;
        },
        /** Getter for IDs of input/output TDs
         * 
         * @param state store state
         * @returns an array containing the IDs
         */
        getIosIds(state: any): string[] {
            const ids: string[] = [];
            for (const io of state.ios as Array<TD|Mashup>) {
                ids.push(io.id);
            }
            return ids;
        },
        /** Getter for property-read interactions
         * 
         * @param state store state
         * @returns {MAGE.VueInteractionInterface[]} array of all added property-read interactions
         */
        getPropertyReads(state: any): MAGE.VueInteractionInterface[] {
            return state.allInteractions.propertyReads;
        },
        /** Getter for property-write interactions
         * 
         * @param state store state
         * @returns {MAGE.VueInteractionInterface[]} array of all added property-write interactions
         */
        getPropertyWrites(state: any): MAGE.VueInteractionInterface[] {
            return state.allInteractions.propertyWrites;
        },
        /** Getter for event-subscription interactions
         * 
         * @param state store state
         * @returns {MAGE.VueInteractionInterface[]} array of all added event-subscription interactions
         */
        getEventSubs(state: any): MAGE.VueInteractionInterface[] {
            return state.allInteractions.eventSubs;
        },
        /**  Getter for action-invoke interactions considered as input interactions
         * 
         * @param state store state
         * @returns {MAGE.VueInteractionInterface[]} array of all input action-invoke interactions interactions
         */
        getActionReads(state: any): MAGE.VueInteractionInterface[] {
            return state.allInteractions.actionReads;
        },
        /**  Getter for action-invoke interactions considered as output interactions
         * 
         * @param state store state
         * @returns {MAGE.VueInteractionInterface[]} array of all output action-invoke interactions interactions
         */
        getActionInvokes(state: any) {
            return state.allInteractions.actionInvokes;
        },
        /** Getter for all annotations of property-read interactions
         * 
         * @param state store state
         * @returns {MAGE.VueAnnotationInterface[]} array of property-read interaction annotations
         */
        getPropertyReadAnnotations(state: any) {
            return state.allAnnotations.propertyReads;
        },
        /** Getter for all annotations of property-write interactions
         * 
         * @param state store state
         * @returns {MAGE.VueAnnotationInterface[]} array of property-write interaction annotations
         */
        getPropertyWriteAnnotations(state: any) {
            return state.allAnnotations.propertyWrites;
        },
        /** Getter for all annotations of event-subscribe interactions
         * 
         * @param state store state
         * @returns {MAGE.VueAnnotationInterface[]} array of event-subscribe interaction annotations
         */
        getEventSubAnnotations(state: any) {
            return state.allAnnotations.eventSubs;
        },
        /** Getter for all annotations of action-invoke interactions that are considered as input interactions
         * 
         * @param state store state
         * @returns {MAGE.VueAnnotationInterface[]} array of input action-invoke interaction annotations
         */
        getActionReadAnnotations(state: any) {
            return state.allAnnotations.actionReads;
        },
        /** Getter for all annotations of action-invoke interactions that are considered as output interactions
         * 
         * @param state store state
         * @returns {MAGE.VueAnnotationInterface[]} array of output action-invoke interaction annotations
         */
        getActionInvokeAnnotations(state: any) {
            return state.allAnnotations.actionInvokes;
        },
        /** Getter for all top-level annotations of input TDs
         * 
         * @param state store state
         * @returns {MAGE.VueAnnotationInterface[]} array of top-level input TDs annotations
         */
        getInputsTdAnnotations(state: any) {
            return state.allTdAnnotations.inputs;
        },
        /** Getter for all top-level annotations of output TDs
         * 
         * @param state store state
         * @returns {MAGE.VueAnnotationInterface[]} array of top-level output TDs annotations
         */
        getOutputsTdAnnotations(state: any) {
            return state.allTdAnnotations.outputs;
        },
        /** Getter for all top-level annotations of input/output TDs
         * 
         * @param state store state
         * @returns {MAGE.VueAnnotationInterface[]} array of top-level input/output TDs annotations
         */
        getIosTdAnnotations(state: any) {
            return state.allTdAnnotations.ios;
        },
        /** Converter of execution time in bigint format
         * 
         * @param state store state
         * @returns {number | bigint, string} an object that holds the execution time and its corresponding unit
         */
        getGenerationExecutionTimeBigInt(state: any) {
            let executionTime: bigint | number = state.result.executionTime;
            let numberOfConversions = 0;
            // Convert to microseconds
            if (executionTime > 1000) {
                // Convert to number if possible
                if (executionTime <= Number.MAX_SAFE_INTEGER) {
                    executionTime = Number(executionTime);
                    executionTime = executionTime / 1000;
                } else if (typeof executionTime === 'bigint') {
                    executionTime = executionTime / 1000n;
                }
                numberOfConversions++;
                // Convert to milliseconds
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
            // Get unit
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
        /** Converter of execution time in number format
         * 
         * @param state store state
         * @returns  
         */
        getGenerationExecutionTime(state: any) {
            const executionTime: [number, number] = state.result.executionTime;
            let fractionOfSeconds = executionTime[1];
            let multipleOfSeconds = executionTime[0];
            let numberOfConversionsNs = 0;
            let numberOfConversionsS = 0;
            let result = 0;
            // Convert to micro-seconds
            if (fractionOfSeconds > 1000) {
                fractionOfSeconds = fractionOfSeconds / 1000;
                numberOfConversionsNs++;
                // Convert to milliseconds
                if (fractionOfSeconds > 1000) {
                    // Convert to number if possible
                    fractionOfSeconds = fractionOfSeconds / 1000;
                    numberOfConversionsNs++;
                    // Convert to seconds
                    if (fractionOfSeconds > 1000) {
                        fractionOfSeconds = fractionOfSeconds / 1000;
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

            // Get unit
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

            //compose multiple seconds together
            if (multipleOfSeconds > 0) {
                result = multipleOfSeconds;
                if (numberOfConversionsS === 0 && numberOfConversionsNs === 2) {
                    result = result + (fractionOfSeconds / 1000);
                }
            } else {
                result = fractionOfSeconds;
            }

            return {result, stringUnit};
        }
    },

    actions: {
        /** An action that extracts all inputs from the store state and then starts the generation of mashups
         * 
         * @param {{generationForm: MAGE.GenerationFormInterface}} generationPayload an object that contain the generation form
         */
        async generateMashups({commit, state},
                              generationPayload: {
                generationForm: MAGE.GenerationFormInterface,
            }) {
                // Remove stored semantic vocabulary graphs
                for (let [index, vocab] of (state.storedVocabs as MAGE.storedVocabInterface[]).entries()) {
                    if (vocab.numberOfAccurances === 0) {
                        vocabStore.deleteGraph(new N3.NamedNode(vocab.vocabUrl));
                        state.storedVocabs.splice(index, 1);
                        index--;
                    }
                }

                 // add input and output devices to the form
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

                // add forbidden and must-have interactions to the form
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

                // add forbidden and must-have interaction level annotations to the form
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

                // add forbidden and must-have top-level annotations to the form 
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

                // set result-ready flag to false
                commit('setResultReady', false);
                // set the generation form
                commit('setGenerationForm', generationPayload.generationForm);
                // generate mashups
                generateMashups(generationPayload.generationForm).then((result) => {
                    // set result
                    commit('setResult', result);
                    // change result flag
                    commit('toggleResultReady');
                });
        },
        /** An action that generates the System Description out of the results
         * 
         * @param {number} mashupNr the index of the mashups in the results array
         */
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

            // validate sequence diagram of mashup
            checkSeqD(sdGenInput['mashup-uml'])
            .then(() => {
                let mashupLogic: SDSQ.mashupLogic;
                let outSD: string;
                // try to parse sequence diagram
                try {
                    mashupLogic = parseSeqD(sdGenInput['mashup-uml']);
                    state.mashupLogic = mashupLogic;
                } catch (error) {
                    return;
                }

                // try to generate SD
                try {
                    outSD = generateSD(mashupLogic, sdGenInput.tds);
                } catch (error) {
                    return;
                }
                // open editor
                commit('setTabActive', 'editor');
                // set SD as result
                commit('setMashupSd', outSD);
                // set editor language
                state.editorLanguage = 'json';
                // set flags for editor
                state.showSd = true; state.showCode = false;
            })
            .catch(() => {
                return;
            });
        },
        /** Generate SD code
         * 
         */
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
        /** an action that adds a TD into either inputs, outputs or io
         * 
         * @param {{element: TD|Mashup, io: 'input'|'output'|'io'}} payload an object that contains the TD and a string that identifies where to add the TD
         */
        async addTdToIo({dispatch, commit, state}: any, payload: {element: TD|Mashup, io: 'input'|'output'|'io'}) {
            await dispatch('addTdVocab', {element: payload.element});
            commit('addTdAnnotations', payload);
            switch (payload.io) {
                case 'input': commit('addToInputs', payload.element); break;
                case 'output': commit('addToOutputs', payload.element); break;
                case 'io': commit('addToIos', payload.element); break;
            }
        },
        /** An action that adds the TD semantic vocabularies to the store
         * 
         * @param payload an object containing the TD
         */
        async addTdVocab({state}: any, payload: {element: TD}) {
            const td = payload.element.content;
            const parsedTd = JSON.parse(td);
            const uris = parsedTd['@context'] as string | any[];
            // if string, then only the TD context is available, therefore ignore
            if (typeof uris === 'string') return;
            // check all item in array
            for (const vocabObject of uris) {
                // if only string, ignore
                if (typeof vocabObject === 'string') continue;
                // for objects
                for (const vocab in vocabObject) {
                    // ignore @language
                    // TODO: take this into consideration when using NLP!!
                    if (vocab === '@language') continue;
                    // get URI of vocab
                    const uri = vocabObject[vocab] as string;
                    // check if Vocab is already added
                    const index = (state.storedVocabs as MAGE.storedVocabInterface[]).findIndex(v => v.vocabUrl === uri);
                    // if available, add to number of accurance 
                    if (index !== -1) state.storedVocabs[index].numberOfAccurances++;
                    else {
                        // add vocab
                        (state.storedVocabs as MAGE.storedVocabInterface[]).push({vocabUrl: uri, numberOfAccurances: 1});
                        // fetch vocab and store it
                        await fetchAndStoreVocab(uri);
                    }
                }
            }
        },
        /** Remove TD from inputs, outputs or io
         * 
         * @param payload an object that contains the TD and a string that identifies from where the TD should be removed
         */
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
        /** Setter for mashup SD
         * 
         * @param state store state
         * @param {string} mashupSd SD in string format
         */
        setMashupSd(state: any, mashupSd: string) {
            (state.currentMashup as Mashup).systemDescription = mashupSd;
        },
        /** Setter for mashup code
         * 
         * @param state store state
         * @param code code in string format
         */
        setMashupCode(state: any, code: string) {
            (state.currentMashup as Mashup).mashupCode = code;
        },
        /** A mutation that resets the store state when a new mashup is opened
         * 
         * @param state store state
         * @param {Mashup} mashup the mashup object
         */
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
        /** Setter of the generation from
         * 
         * @param state store state
         * @param {MAGE.GenerationFormInterface} generationForm the generation form object
         */
        setGenerationForm(state: any, generationForm: MAGE.GenerationFormInterface) {
            state.generationForm = generationForm;
        },
        /** Setter for the generation result
         * 
         * @param state store state
         * @param {MAGE.MashupGenerationResult} result the result object
         */
        setResult(state: any, result: MAGE.MashupGenerationResult) {
            state.result = result;
        },
        /** Setter for the result-ready flag
         * 
         * @param state store state
         * @param {boolean} ready the value to set
         */
        setResultReady(state: any, ready: boolean) {
            state.resultReady = ready;
        },
        /** A mutation that adds TDs to input TDs array in the store
         * 
         * @param state store state
         * @param {Array<TD|Mashup>} elements an array containing the elements to be added
         */
        addToInputs(state: any, ...elements: Array<TD|Mashup>) {
            const elementsFiltered = elements;
            let index = 0;
            // filter out elements that are already in the inputs array.
            for (const element of elementsFiltered) {
                if ((state.inputs as Array<TD|Mashup>).includes(element)) elementsFiltered.splice(index, 1);
                index++;
            }
            // add to inputs array
            (state.inputs as Array<TD|Mashup>).push(...elementsFiltered);
            // remove from output and input/output arrays if found
            for (const element of elementsFiltered) {
                let indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromOutputs', indexToDelete);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromIos', indexToDelete);
                // categorize the TD interactions
                (this as any).commit('MashupStore/categorizeTdInteractions', {element, io: 'input'});
            }
        },
        /** A mutation that adds TDs to output TDs array in the store
         * 
         * @param state  store state
         * @param elements an array containing the elements to be added
         */
        addToOutputs(state: any, ...elements: Array<TD|Mashup>) {
            const elementsFiltered = elements;
            let index = 0;
            // filter out elements that are already in the outputs array.
            for (const element of elementsFiltered) {
                if ((state.outputs as Array<TD|Mashup>).includes(element)) elementsFiltered.splice(index, 1);
                index++;
            }
            // add to outputs array
            (state.outputs as Array<TD|Mashup>).push(...elementsFiltered);
            // remove from input and input/output arrays if found
            for (const element of elementsFiltered) {
                let indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromInputs', indexToDelete);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromIos', indexToDelete);
                // categorize the TD interactions
                (this as any).commit('MashupStore/categorizeTdInteractions', {element, io: 'output'});
            }
        },
        /** A mutation that adds TDs to output TDs array in the store
         * 
         * @param state store state
         * @param elements an array containing the elements to be added
         */
        addToIos(state: any, ...elements: Array<TD|Mashup>) {
            const elementsFiltered = elements;
            let index = 0;
            // filter out elements that are already in the input/output array.
            for (const element of elementsFiltered) {
                if ((state.ios as Array<TD|Mashup>).includes(element)) elementsFiltered.splice(index, 1);
                index++;
            }
            // add to input/output array
            (state.ios as Array<TD|Mashup>).push(...elementsFiltered);
            // remove from input and output arrays if found
            for (const element of elementsFiltered) {
                let indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromInputs', indexToDelete);
                indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit('MashupStore/removeFromOutputs', indexToDelete);
                // categorize the TD interactions
                (this as any).commit('MashupStore/categorizeTdInteractions', {element, io: 'io'});
            }
        },
        /** A mutation that categorizes the interactions of a TD
         * 
         * @param state store state
         * @param payload an object that contains the TD `element` and a string label `io` to identify if it is an input, output or input/output TD
         */
        categorizeTdInteractions(state: any, payload: {element: TD, io: string}) {
            const parsedTd = JSON.parse(payload.element.content);
            /** a function that fetches the description of an annotation if available
             * 
             * @param {string} annotation an annotation
             * @returns {string | null} returns the description of a string if found, else returns `null`
             */
            function getAnnotationDescription(annotation: string): string | null {
                // split annotation in context and annotation name
                const parts = annotation.split(':');
                // find the URI of the context
                for (const vocabObj of parsedTd['@context']) {
                    if (typeof vocabObj === 'string') continue;
                    for (const vocab in vocabObj) {
                        if (vocab === parts[0]) {
                            // when found, get the description from the corresponding graph
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

            // categorize properties
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

            // categorize events
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

            // categorize actions
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
        /** A mutation that adds the top-level annotation of the TD in input, output ot input/output array
         * 
         * @param state store state
         * @param payload an object containing the TD `element` and a string label `io` that must be `"input"`, `"output"` or `"io"`
         */
        addTdAnnotations(state: any, payload: {element: TD, io: 'input' | 'output' | 'io'}) {
            const td = payload.element.content;
            const parsedTd = JSON.parse(td);
            let annotations: string | string[] | undefined = parsedTd['@type'];
            if (!annotations) return;
            if (typeof annotations === 'string') annotations = [annotations];
            /** a function that generates annotation objects to add to the annotations array
             * 
             * @param annotations an array of annotation strings
             * @returns {MAGE.VueAnnotationInterface[]} an array of annotation objects
             */
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
        /** Setter for the interaction restriction
         * 
         * @param state store states
         * @param payload an object that contains an interaction object `interaction` and a restriction label `restriction` that must be either `"none"` or `"forbidden"` or `"mustHave"`
         */
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
        /** Setter for interaction-level annotation restriction
         * 
         * @param state store state
         * @param payload an object that contains an annotation object `annotation` and a restriction label `restriction` that must be either `"none"` or `"forbidden"` or `"mustHave"`
         */
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
        /** Setter for top-level annotation restriction
         * 
         * @param state store state
         * @param payload an object that contains an annotation object `annotation` and a restriction label `restriction` that must be either `"none"` or `"forbidden"` or `"mustHave"`
         */
        setTdAnnotationRestriction(state: any, payload: {annotation: MAGE.VueAnnotationInterface, restriction: 'none' | 'forbidden' | 'mustHave'}) {
            let index: number;
            const annotation = payload.annotation;
            const restriction = payload.restriction;
            const annotationArray: MAGE.VueAnnotationInterface[] = state.allTdAnnotations[`${annotation.type}s`];
            index = annotationArray.findIndex(a => a.annotation === annotation.annotation);
            if (index !== -1) state.allTdAnnotations[`${annotation.type}s`][index].restriction = restriction;
        },
        /** A mutation that removes a TD from inputs array
         * 
         * @param state store state
         * @param {TD|Mashup|number} element either a TD instance or a index of the TD in the array
         */
        removeFromInputs(state: any, element: TD|Mashup|number) {
            if (typeof element === 'number') {
                // remove associated interactions
                (this as any).commit('MashupStore/removeInteractions', state.inputs[element]);
                // remove associated semantic vocabularies
                (this as any).commit('MashupStore/removeVocabs', {element: state.inputs[element]});
                (state.inputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                // remove associated interactions
                (this as any).commit('MashupStore/removeInteractions', element);
                // remove associated semantic vocabularies
                (this as any).commit('MashupStore/removeVocabs', {element});
                const indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                (state.inputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        /** A mutation that removes a TD from outputs array
         * 
         * @param state store state
         * @param {TD|Mashup|number} element either a TD instance or a index of the TD in the array
         */
        removeFromOutputs(state: any, element: TD|Mashup|number) {
            if (typeof element === 'number') {
                // remove associated interactions
                (this as any).commit('MashupStore/removeInteractions', state.outputs[element]);
                // remove associated semantic vocabularies
                (this as any).commit('MashupStore/removeVocabs', {element: state.outputs[element]});
                (state.outputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                // remove associated interactions
                (this as any).commit('MashupStore/removeInteractions', element);
                // remove associated semantic vocabularies
                (this as any).commit('MashupStore/removeVocabs', {element});
                const indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                (state.outputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        /** A mutation that removes a TD from inputs/outputs array
         * 
         * @param state store state
         * @param {TD|Mashup|number} element either a TD instance or a index of the TD in the array
         */
        removeFromIos(state: any, element: TD|Mashup|number) {
            if (typeof element === 'number') {
                // remove associated interactions
                (this as any).commit('MashupStore/removeInteractions', state.ios[element]);
                // remove associated semantic vocabularies
                (this as any).commit('MashupStore/removeVocabs', {element: state.ios[element]});
                (state.ios as Array<TD|Mashup>).splice(element, 1);
            } else {
                // remove associated interactions
                (this as any).commit('MashupStore/removeInteractions', element);
                // remove associated semantic vocabularies
                (this as any).commit('MashupStore/removeVocabs', {element});
                const indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                (state.ios as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        /** A mutation that removes interactions associated with a TD
         * 
         * @param state store state
         * @param {TD} element a TD
         */
        removeInteractions(state: any, element: TD) {
            const parsedTd = JSON.parse(element.content);
            /** A function that removes all annotations associated with an interaction
             * 
             * @param {MAGE.VueInteractionInterface} interaction the interaction
             * @param {'properties' | 'events' | 'actions'} type the type of the interaction
             * @param {'propertyReads' | 'propertyWrites' | 'eventSubs' | 'actionReads' | 'actionInvokes' | 'propertyObservations'} category the category of the interaction
             */
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
        /** A mutation that removes the vocabularies associated with a TD
         * 
         * @param state store state
         * @param payload an object containing a TD instance `element`
         */
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
        /** A mutation that removes top-level TD annotations
         * 
         * @param state store state
         * @param payload an object that contains the index of the TD `element` in the array and the a string label identifying which array it is in. `io`  must be either `"input"`, `"output"` or `"io"`
         */
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
        /** A mutation that toggles a tab
         * 
         * @param state store state
         * @param {string} tabId the id of the tab
         */
        toggleTab(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId) {
                    tab.tabIsActive = !tab.tabIsActive;
                    state.numberOfActiveTabs = tab.tabIsActive ? ++state.numberOfActiveTabs : --state.numberOfActiveTabs;
                    break;
                }
            }
        },
        /** A mutation that toggles result-ready flag
         * 
         * @param state store state
         */
        toggleResultReady(state) {
            state.resultReady = !state.resultReady;
        },
        /** A mutation that sets a tab to active
         * 
         * @param state store state
         * @param {string} tabId the tab id
         */
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
        /** A mutation that sets a tab to inactive
         * 
         * @param state store state
         * @param {string} tabId the tab id
         */
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
