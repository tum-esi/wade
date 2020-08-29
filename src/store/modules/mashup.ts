import { Mashup, TD } from '@/lib/classes';
import generateMashups from "@/backend/MaGe/generator";
import generateCode from "@/backend/MaGe/codeGenerator";

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
        numberOfActiveTabs: 0,
        mashupTd: "",
        currentMashup: null as Mashup | null,
        inputs:     null as Array<TD|Mashup> | null,
        outputs:    null as Array<TD|Mashup> | null,
        ios:        null as Array<TD|Mashup> | null,
        propertyReads: null as {title: string, thingId: string, name: string, type: string}[] | null,
        propertyWrites: null as {title: string, thingId: string, name: string, type: string}[] | null,
        eventSubs: null as {title: string, thingId: string, name: string, type: string}[] | null,
        actionInvokes: null as {title: string, thingId: string, name: string, type: string}[] | null,
        forbiddenInteractions: {propertyReads: [], propertyWrites: [], eventSubs:[], actionInvokes: []},
        generationForm: null as MAGE.GenerationFormInterace | null,
        result: null as Object | null
    },
    getters: {
        getMashupTd(state: any): string {
            return state.mashupTd;
        },
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
        getResult(state) {
            return state.result;
        },
        getPropertyReads(state) {
            return state.propertyReads;
        },
        getPropertyWrites(state) {
            return state.propertyWrites;
        },
        getEventSubs(state) {
            return state.eventSubs;
        },
        getActionInvokes(state){
            return state.actionInvokes;
        },
        getForbiddenInteractions(state) {
            return state.forbiddenInteractions;
        },
        isResultReady(state) {
            return state.resultReady;
        },
        isMashupSelected(state): boolean {
            return state.isMashupSelected;
        },
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
            let forbiddenInteractions: {title: string, thingId: string, name: string, type: string}[] = [];
            for(let prop of state.forbiddenInteractions.propertyReads) forbiddenInteractions.push(prop);
            for(let prop of state.forbiddenInteractions.propertyWrites) forbiddenInteractions.push(prop);
            for(let event of state.forbiddenInteractions.eventSubs) forbiddenInteractions.push(event);
            for(let action of state.forbiddenInteractions.actionInvokes) forbiddenInteractions.push(action);

            generationForm.filters.forbiddenInteractions = forbiddenInteractions;
            commit('setResultReady', false);
            commit('setGenerationForm', generationForm);
            generateMashups(generationForm).then((result) => {
                commit('setResult', result);
                commit('toggleResultReady');
            });
        },
        async generateMashupCode({commit, state}, mashupNr: number) {
            let gen = {"mashup": state.result.mashups[mashupNr], "tds": {}};

            // get all relevant TDs for the selected mashup
            let idsUsed: string[] = []
            let outputs = state.generationForm.things.outputs;
            let inputs = state.generationForm.things.inputs;
            gen.mashup.forEach(element => {
                if (!idsUsed.includes(element.thingId)) idsUsed.push(element.thingId);
            });
            outputs.concat(inputs).forEach(td => {
                let parsedTd = JSON.parse((td as WADE.TDElementInterface).content);
                if (idsUsed.includes(parsedTd.id)) gen.tds[td.id] = td.content;
            });
            let mashupTd = generateCode(gen.mashup, Object.values(gen.tds));
            commit("setMashupTd", mashupTd);
            commit("setTabActive", "editor");


        }
    },
    mutations: {
        setMashupTd(state: any, mashupTd: string) {
            state.mashupTd = mashupTd;
        },
        setCurrentMashup(state: any, mashup: Mashup) {
            (state.currentMashup as Mashup) = mashup;
            (state.inputs as Array<TD|Mashup>) = [];
            (state.outputs as Array<TD|Mashup>) = [];
            (state.ios as Array<TD|Mashup>) = [];
            state.propertyReads = [];
            state.propertyWrites = [];
            state.eventSubs = [];
            state.actionInvokes = [];
            state.forbiddenInteractions = {
                propertyReads: [],
                propertyWrites: [],
                eventSubs: [],
                actionInvokes: []
            }
        },
        setGenerationForm(state: any, generationForm: MAGE.GenerationFormInterace){
            state.generationForm = generationForm;
        },
        setResult(state: any, result: object){
            state.result = result;
        },
        setResultReady(state: any, ready: boolean){
            state.resultReady = ready
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
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromOutputs", indexToDelete);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromIos", indexToDelete);
                (this as any).commit("MashupStore/categorizeTdInteractions", {element: element, io:"input"});
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
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromInputs", indexToDelete);
                indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromIos", indexToDelete);
                (this as any).commit("MashupStore/categorizeTdInteractions", {element: element, io:"output"});
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
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromInputs", indexToDelete);
                indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                if (indexToDelete !== -1) (this as any).commit("MashupStore/removeFromOutputs", indexToDelete);
                (this as any).commit("MashupStore/categorizeTdInteractions", {element: element, io:"io"});
            }
        },
        categorizeTdInteractions(state: any, payload: {element: TD|Mashup, io: string}){
            let parsedTd = JSON.parse(payload.element.content);
                for(let prop in parsedTd.properties){
                    let readInteractionToPush = {title: payload.element.title, thingId: parsedTd.id, name: prop, type: "property-read"}; 
                    let writeInteractionToPush = {title: payload.element.title, thingId: parsedTd.id, name: prop, type: "property-write"}; 
                    if(payload.io == "input" && !parsedTd.properties[prop].writeOnly && !state.propertyReads.includes(readInteractionToPush)) 
                        state.propertyReads.push(readInteractionToPush);
                    else if(payload.io == "output" && !parsedTd.properties[prop].readOnly && !state.propertyWrites.includes(writeInteractionToPush))
                        state.propertyWrites.push(writeInteractionToPush);
                    else if(payload.io == "io"){
                        if(!parsedTd.properties[prop].writeOnly && !state.propertyReads.includes(readInteractionToPush)) 
                            state.propertyReads.push(readInteractionToPush);
                        if(!parsedTd.properties[prop].readOnly && !state.propertyWrites.includes(writeInteractionToPush)) 
                            state.propertyWrites.push(writeInteractionToPush);
                    }
                }
                for(let event in parsedTd.events){
                    let interactionToPush = {title: payload.element.title, thingId: parsedTd.id, name: event, type: "event-subscribe"};
                    if(!state.eventSubs.includes(interactionToPush)) state.eventSubs.push(interactionToPush);
                }
                for(let action in parsedTd.actions){
                    let interactionToPush = {title: payload.element.title, thingId: parsedTd.id, name: action, type: "action-invoke"};
                    if(!state.actionInvokes.includes(interactionToPush)) state.actionInvokes.push(interactionToPush);
                }
        },
        addToForbiddenInteractions(state: any, interaction: {title: string, thingId: string, name: string, type: string}){
            switch(interaction.type) {
                case "property-write": 
                    if(!state.forbiddenInteractions.propertyWrites.some(inter => inter.thingId === interaction.thingId && inter.name === interaction.name)) 
                        state.forbiddenInteractions.propertyWrites.push(interaction); 
                    return;
                case "property-read":
                    if(!state.forbiddenInteractions.propertyReads.some(inter => inter.thingId === interaction.thingId && inter.name === interaction.name))
                        state.forbiddenInteractions.propertyReads.push(interaction);
                    return;
                case "event-subscribe":
                    if(!state.forbiddenInteractions.eventSubs.some(inter => inter.thingId === interaction.thingId && inter.name === interaction.name))
                        state.forbiddenInteractions.eventSubs.push(interaction);
                    return;
                case "action-invoke":
                    if(!state.forbiddenInteractions.actionInvokes.some(inter => inter.thingId === interaction.thingId && inter.name === interaction.name))
                        state.forbiddenInteractions.actionInvokes.push(interaction);
                    return;
            }
        },
        removeFromInputs(state: any, element: TD|Mashup|number) {
            if(typeof element === 'number') {
                (this as any).commit("MashupStore/removeInteractions", state.inputs[element]);
                (state.inputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                (this as any).commit("MashupStore/removeInteractions", element);
                const indexToDelete = (state.inputs as Array<TD|Mashup>).indexOf(element);
                (state.inputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeFromOutputs(state: any, element: TD|Mashup|number) {
            if(typeof element === 'number') {
                (this as any).commit("MashupStore/removeInteractions", state.inputs[element]);
                (state.outputs as Array<TD|Mashup>).splice(element, 1);
            } else {
                (this as any).commit("MashupStore/removeInteractions", element);
                const indexToDelete = (state.outputs as Array<TD|Mashup>).indexOf(element);
                (state.outputs as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeFromIos(state: any, element: TD|Mashup|number) {
            if(typeof element === 'number') {
                (this as any).commit("MashupStore/removeInteractions", state.inputs[element]);
                (state.ios as Array<TD|Mashup>).splice(element, 1);
            } else {
                (this as any).commit("MashupStore/removeInteractions", element);
                const indexToDelete = (state.ios as Array<TD|Mashup>).indexOf(element);
                (state.ios as Array<TD|Mashup>).splice(indexToDelete, 1);
            }
        },
        removeInteractions(state: any, element: TD|Mashup){
            let parsedTd = JSON.parse(element.content);
            let index = 0;
            for(index = 0; index < state.propertyReads.length; index++) {
                if(state.propertyReads[index].thingId === parsedTd.id) {
                    (this as any).commit('MashupStore/removeFromForbiddenInteractions', state.propertyReads[index]);
                    state.propertyReads.splice(index,1); 
                    index--
                };
            }
            for(index = 0; index < state.propertyWrites.length; index++) {
                if(state.propertyWrites[index].thingId === parsedTd.id) {
                    (this as any).commit('MashupStore/removeFromForbiddenInteractions', state.propertyWrites[index]);
                    state.propertyWrites.splice(index,1); 
                    index--;
                };
            }
            for(index = 0; index < state.eventSubs.length; index++) {
                if(state.eventSubs[index].thingId === parsedTd.id) {
                    (this as any).commit('MashupStore/removeFromForbiddenInteractions', state.eventSubs[index]);
                    state.eventSubs.splice(index,1);
                    index--;
                };
            }
            for(index = 0; index < state.actionInvokes.length; index++) {
                if(state.actionInvokes[index].thingId === parsedTd.id) {
                    (this as any).commit('MashupStore/removeFromForbiddenInteractions', state.actionInvokes[index]);
                    state.actionInvokes.splice(index,1);
                    index--;
                };
            }
        },
        removeFromForbiddenInteractions(state: any, interaction: {title: string, thingId: string, name: string, type: string}) {
            let index: number;
            switch(interaction.type) {
                case "property-write":
                    index = state.forbiddenInteractions.propertyWrites.findIndex(prop => prop.title === interaction.title && prop.name === interaction.name);
                    state.forbiddenInteractions.propertyWrites.splice(index, 1);
                    return;
                case "property-read": 
                    index = state.forbiddenInteractions.propertyReads.findIndex(prop => prop.title === interaction.title && prop.name === interaction.name);
                    state.forbiddenInteractions.propertyReads.splice(index, 1);
                    return;
                case "event-subscribe":
                    index = state.forbiddenInteractions.eventSubs.findIndex(event => event.title === interaction.title && event.name === interaction.name);
                    state.forbiddenInteractions.eventSubs.splice(index, 1);
                    return;
                case "action-invoke":
                    index = state.forbiddenInteractions.actionInvokes.findIndex(action => action.title === interaction.title && action.name === interaction.name);
                    state.forbiddenInteractions.actionInvokes.splice(index, 1);
                    return;
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
                if (tab.tabId === tabId){
                    if(tab.tabIsActive == true) return;
                    tab.tabIsActive = true;
                    ++state.numberOfActiveTabs;
                    break;
                }    
            }
        },
        setTabInactive(state: any, tabId: string) {
            for (const tab of state.mashupTabbar) {
                if (tab.tabId === tabId) {
                    if(tab.tabIsActive == false) return;
                    tab.tabIsActive = false;
                    --state.numberOfActiveTabs
                    break;
                }
            }
        }
    }
};
