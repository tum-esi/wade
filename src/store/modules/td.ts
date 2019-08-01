import * as Api from '@/backend/Api';
import { RESULT_MESSAGES } from '@/util/texts';
import { InteractionStateEnum, TdStateEnum } from '@/util/enums';
import MessageHandler from '@/backend/MessageHandler';

export default {
    namespaced: true,
    state: {
        tdState: TdStateEnum.NO_TD,
        errorMsg: '',

        tdEditor: {},
        tdParsed: {},

        interactionState: InteractionStateEnum.NO_INTERACTIONS,

        interactions: [],
        selections: [],
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
        async processChangedTd({ commit }, payload: any) {
            if (!payload.td || payload.td.length <= 0) {
                commit('setTdState', payload.tdState ? payload.tdState : TdStateEnum.NO_TD);
                commit('setErrorMsg', payload.errorMsg ? payload.errorMsg : null);
                return;
            }

            commit('setInteractions', []);
            commit('setSelections', []);
            commit('setResults', []);
            commit('setTdEditor', payload.td);

            const parsedTd = await Api.consumeAndParseTd(payload.td);

            // Store new parsed td
            if (parsedTd.tdState === TdStateEnum.VALID_TD) commit('setTdParsed', parsedTd.tdParsed);

            // Set td status and error message
            commit('setTdState', parsedTd.tdState);
            commit('setErrorMsg', parsedTd.errorMsg);
        },

        async resetAll({ commit }) {
            // await Api.resetAll();
            commit('setInteractions', []);
            commit('setSelections', []);
            commit('setResults', []);
        },
        async resetInteractions({ commit }) {
            commit('setInteractions', []);
        },
        async resetSelections({ commit }) {
            commit('setSelections', []);
        },
        async resetResults({ commit }) {
            commit('setResults', []);
        },

        // TODO: can be deleted??
        // Return parsed & consumed TD
        async getParsedTd({ commit }, payload) {
            const parsedTd = await Api.getParsedTd(payload.jsonTd);
            if (parsedTd.error) {
                commit('setTdState', TdStateEnum.INVALID_TD);
                return parsedTd.error;
            } else {
                commit('setTdState', TdStateEnum.VALID_TD);
                return parsedTd;
            }
        },
        // Add new interaction to interactions to be invoked
        async addToSelectedInteractions({ commit, state }, payload) {
            const selectedInteractions = state.selections;
            selectedInteractions.push(payload.newInteraction);
            commit('setSelections', selectedInteractions);
            return selectedInteractions;
        },
        // Remove specific interaction from interactions to be invoked
        async removeFromSelectedInteractions({ commit, state }, payload) {
            const selectedInteractions = state.selections;
            selectedInteractions.splice(selectedInteractions.indexOf(payload.interactionToRemove), 1);
            commit('setSelections', selectedInteractions);
            return selectedInteractions;
        },
        // Invoke all selected interaction
        async invokeInteractions({ commit, state }) {
            const selectedInteractions = state.selections;
            const results = await Api.invokeInteractions(selectedInteractions);
            commit('setResultProps', results.resultProps);
            commit('setResultActions', results.resultActions);
            commit('setResultEvents', results.resultEvents);
        }
    },
    mutations: {
        setErrorMsg(state: any, payload: string) {
            state.errorMsg = payload;
        },
        setTdState(state: any, payload: TdStateEnum | null) {
            if (payload) state.tdState = payload;
        },
        setTdEditor(state: any, payload: string) {
            if (payload) state.tdEditor = payload;
        },
        setTdParsed(state: any, payload: string) {
            if (payload) state.tdParsed = payload;
        },

        setResults(state: any, payload: any) {
            state.resultProps = payload;
            state.resultActions = payload;
            state.resultEvents = payload;
        },
        setInteractions(state: any, payload: any) {
            state.interactions = payload;
        },
        setSelections(state: any, payload: any) {
            state.selections = payload;
        },
        setResultProps(state: any, payload: any) {
            state.resultProps = payload;
        },
        setResultActions(state: any, payload: any) {
            state.resultActions = payload;
        },
        setResultEvents(state: any, payload: any) {
            state.resultEvents = payload;
        },
        setValidTd(state: any, payload: boolean) {
            state.isValidTd = payload;
        }
    },
    getters: {
        isValidTd(state: any) {
            return state.tdState === TdStateEnum.VALID_TD;
        },
        getTdState(state: any) {
            return state.tdState;
        },
        getErrorMsg(state: any) {
            return state.errorMsg;
        },
        getTdEditor(state: any) {
            return state.jsonTd;
        },
        getTdParsed(state: any) {
            return state.tdParsed;
        },
        areInteractionsInvoked(state: any) {
            return state.areInteractionsInvoked;
        },
        getTdTabbar(state: any) {
            return state.tdTabbar;
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
        },
        getResultText(state: any) {
            if (!state.isValidTd) {
                return '';
            }
            if (!state.areInteractionsSelected) {
                return RESULT_MESSAGES.NO_INTERACTIONS_SELECTED;
            }
            if (!state.areInteractionsInvoked) {
                return RESULT_MESSAGES.NO_INTERACTIONS_INVOKED;
            }
        }
    }
};
