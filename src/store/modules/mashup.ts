import { Mashup, TD } from '@/lib/classes';
import generateMashups from "@/backend/MaGe/generator"

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
        numberOfActiveTabs: 0,
        currentMashup: null as Mashup | null,
        inputs:     null as Array<TD|Mashup> | null,
        outputs:    null as Array<TD|Mashup> | null,
        ios:        null as Array<TD|Mashup> | null,
        generationForm: null as MAGE.GenerationFormInterace | null,
        result: null as Object | null
    },
    getters: {
        getMashupTabbar(state: any) {
            return state.mashupTabbar;
        },
        getMashupChildren(state): Array<TD | Mashup> {
            return (state.currentMashup as Mashup).children;
        },
        getMashupChildrenForDropdown(state): Array<TD|Mashup> | null{
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
        isMashupSelected(state): boolean {
            return state.isMashupSelected;
        }
    },
    actions: {
        async generateMashups({commit, state}, generationForm: MAGE.GenerationFormInterace) {
            let inputs = state.inputs as (TD|Mashup)[];
            let outputs = state.outputs as (TD|Mashup)[];
            let ios = state.ios as (TD|Mashup)[];
            generationForm.things.inputs = inputs;
            generationForm.things.outputs = outputs;
            for (let io of ios){
                generationForm.things.inputs.push(io);
                generationForm.things.outputs.push(io);
            }
            generateMashups(generationForm).then((result) =>{
                commit('setResult', result);
            })
        }
    },
    mutations: {
        setCurrentMashup(state: any, mashup: Mashup) {
            (state.currentMashup as Mashup) = mashup;
            (state.inputs as Array<TD|Mashup>) = [];
            (state.outputs as Array<TD|Mashup>) = [];
            (state.ios as Array<TD|Mashup>) = [];
        },
        setGenerationForm(state: any, generationForm: MAGE.GenerationFormInterace){
            state.generationForm = generationForm;
        },
        setResult(state: any, result: object){
            state.result = result;
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
                if (indexToDelete !== -1)(state.outputs as Array<TD|Mashup>).splice(indexToDelete, 1);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1)(state.ios as Array<TD|Mashup>).splice(indexToDelete, 1);
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
                if (indexToDelete !== -1)(state.inputs as Array<TD|Mashup>).splice(indexToDelete, 1);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1)(state.ios as Array<TD|Mashup>).splice(indexToDelete, 1);
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
                if (indexToDelete !== -1)(state.inputs as Array<TD|Mashup>).splice(indexToDelete, 1);
                indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1)(state.outputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeFromInputs(state: any, element: TD|Mashup|number ) {
            if(typeof element === 'number') {
                (state.inputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                const indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                (state.inputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeFromOutputs(state: any, element: TD|Mashup|number) {
            if(typeof element === 'number') {
                (state.outputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                const indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                (state.outputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeFromIos(state: any, element: TD|Mashup|number) {
            if(typeof element === 'number') {
                (state.ios as Array<TD|Mashup>).splice(element, 1);
            } else {
                const indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                (state.ios as Array<TD|Mashup>).splice(indexToDelete, 1);
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
        setTabActive(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId){
                    tab.tabIsActive = true;
                    ++state.numberOfActiveTabs;
                    break;
                }    
            }
        },
        setTabInactive(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId) {
                    tab.tabIsActive = false;
                    --state.numberOfActiveTabs
                    break;
                }
            }
        }
    }
};
