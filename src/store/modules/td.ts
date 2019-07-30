import * as Api from '@/backend/Api';
import { RESULT_MESSAGES } from '@/util/texts';
import { InteractionStateEnum, TdStateEnum } from '@/util/enums';
import MessageHandler from '@/backend/MessageHandler';

export default {
    namespaced: true,
    state: {
        tdState: TdStateEnum.NO_TD,
        tdEditor: {},
        tdParsed: {},

        interactionState: InteractionStateEnum.NO_INTERACTIONS,

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
        async processChangedTd({ commit }, payload: { td: string }) {
            commit('setTdEditor', payload.td);

            const parsedTd = await Api.consumeAndParseTd(payload.td);
            commit('setTdState', parsedTd.tdState);

            if (parsedTd.tdState !== TdStateEnum.VALID_TD) {
                // TODO: activate message handler
                const messageHandler = new MessageHandler(parsedTd.tdState, parsedTd.errorMsg).returnAccordingMessage();
                return;
            }
            commit('setTdParsed', parsedTd.tdParsed);
        },
        async resetAll({ commit }) {
            await Api.resetAll();
        },
        async resetInteractions({ commit }) {
            commit('setSelectedInteractions', []);
        },
        async resetSelectedInteractions({ commit }) {
            commit('setSelectedInteractions', []);
        },
        async resetResults({ commit }) {
            commit('removeResults', []);
        },
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
        async invokeInteractions({ commit, state }) {
            const selectedInteractions = state.selectedInteractions;
            const results = await Api.invokeInteractions(selectedInteractions);
            commit('setResultProps', results.resultProps);
            commit('setResultActions', results.resultActions);
            commit('setResultEvents', results.resultEvents);
        }
    },
    mutations: {
        setTdState(state: any, payload: string) {
            if (payload) state.tdState = payload;
        },
        setTdEditor(state: any, payload: string) {
            if (payload) state.tdEditor = payload;
        },
        setTdParsed(state: any, payload: string) {
            if (payload) state.tdParsed = payload;
        },

        removeResults(state: any, payload: any) {
            state.resultProps = payload;
            state.resultActions = payload;
            state.resultEvents = payload;
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
        },
        setValidTd(state: any, payload: boolean) {
            state.isValidTd = payload;
        }
    },
    getters: {
        isValidTd(state: any) {
            console.log('state: ', state.tdState);
            return state.tdState === TdStateEnum.VALID_TD;
        },
        getTdState(state: any) {
            return state.tdState;
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
