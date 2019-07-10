import * as Api from '@/backend/Api';
import { ElementTypeEnum } from '@/util/enums';

export default {
    namespaced: true,
    state: {
        currentJSONTD: {},
        parsedTd: {},
        selectedInteractions: [],
        resultProps: [],
        resultActions: [],
        resultEvents: [],
        tdTabbar: [
            {
                tabId: 'editor',
                tabTitle: 'Editor',
                tabStyle: 'tab-container-in-tabbar',
                tabDropdownButton: {
                    btnKey: 'td-editor-upload',
                    btnSrc: 'upload',
                    btnDropdownOptions: [
                        // {
                        //     title: 'Load from pc',
                        //     key: 'td-machine',
                        //     icon: 'computer',
                        //     style: 'border-bottom'
                        // },
                        {
                            title: 'Load from url',
                            key: 'td-url',
                            icon: 'url'
                        }
                    ]
                },
                tabButtonStyle: 'tab-btn-right tab-button-container',
                tabLink: '/editor',
                tabIsActive: false
            },
            {
                tabId: 'requests',
                tabTitle: 'Requests',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/requests',
                tabIsActive: false
            },
            {
                tabId: 'performance',
                tabTitle: 'Performance',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/performance',
                tabIsActive: false
            }
        ],
        tdSelectionBtn: {
            btnClass: 'btn-invoke',
            btnLabel: 'Invoke Interactions',
            btnOnClick: 'invoke-interactions'
        },
        tdResultsBtn: {
            btnClass: 'btn-results',
            btnLabel: 'Status: No interaction selected.',
            btnOnClick: '-'
        },
        tdEditorPlaceholder: 'Paste your Thing Description here or press the upload button.'
    },
    actions: {
        async resetAll( { commit }) {
            await Api.resetAll();
        },
        async resetInteractions({ commit }) {
            commit('setParsedTd', []);
            commit('setSelectedInteractions', []);
        },
        async resetSelectedInteractions({ commit }) {
            commit('setSelectedInteractions', []);
            // TODO: unsubscribe
        },
        async resetResults({ commit }) {
            commit('removeResults', []);
        },
        // Return parsed & consumed TD
        async getParsedTd({ commit }, payload) {
            const parsedTd = await Api.getParsedTd(payload.jsonTd);
            if (parsedTd.error) {
                return parsedTd.error;
            } else {
                commit('setParsedTd', parsedTd);
                return parsedTd;
            }
        },
        // Add new interaction to interactions to be invoked
        async addToSelectedInteractions({ commit, state }, payload) {
            const selectedInteractions = state.selectedInteractions;
            selectedInteractions.push(payload.newInteraction);
            commit('setSelectedInteractions', selectedInteractions);
            return selectedInteractions;
        },
        // Remove specific interaction from interactions to be invoked
        async removeFromSelectedInteractions({ commit, state }, payload) {
            const selectedInteractions = state.selectedInteractions;
            selectedInteractions.splice(selectedInteractions.indexOf(payload.interactionToRemove), 1);
            commit('setSelectedInteractions', selectedInteractions);
            return selectedInteractions;
        },
        // Invoke all selected interaction
        async invokeInteractions({commit, state}) {
            const selectedInteractions = state.selectedInteractions;
            const results = await Api.invokeInteractions(selectedInteractions);
            commit('setResultProps', results.resultProps);
            commit('setResultActions', results.resultActions);
            commit('setResultEvents', results.resultEvents);
        }
    },
    mutations: {
        removeResults(state: any, payload: any) {
            state.resultProps = payload;
            state.resultActions = payload;
            state.resultEvents = payload;
        },
        setCurrentJSONTD(state: any, payload: any) {
            state.currentJSONTD = payload;
        },
        setParsedTd(state: any, payload: any) {
            if (!payload) {
                state.parsedTd = {};
            } else {
                state.parsedTd = payload;
            }
        },
        setSelectedInteractions(state: any, payload: any) {
            state.selectedInteractions = payload;
        },
        setResultProps(state: any, payload: any) {
            state.resultProps = payload;
        },
        setResultActions(state: any, payload: any) {
            state.resultActions = payload;
        },
        setResultEvents(state: any, payload: any) {
            state.resultEvents = payload;
        }
    },
    getters: {
        getTdTabbar(state: any) {
            return state.tdTabbar;
        },
        getParsedTd(state: any) {
            return state.parsedTd;
        },
        getCurrentJSONTD(state: any) {
            return state.currentJSONTD;
        },
        getSelectionBtn(state: any) {
            return state.tdSelectionBtn;
        },
        getResultsBtn(state: any) {
            return state.tdResultsBtn;
        },
        getEditorPlaceholder(state: any) {
            return state.tdEditorPlaceholder;
        },
        getSelectedInteractions(state: any) {
            return state.selectedInteractions;
        },
        getResultProps(state: any) {
            return state.resultProps;
        },
        getResultActions(state: any) {
            return state.resultActions;
        },
        getResultEvents(state: any) {
            return state.resultEvents;
        }
    }
};
