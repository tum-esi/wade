import * as Api from '@/backend/Api';
import { RESULT_MESSAGES } from '@/util/texts';
import { InteractionStateEnum, TdStateEnum } from '@/util/enums';

export default {
    namespaced: true,
    state: {
        tdState: TdStateEnum.NO_TD,
        errorMsg: '',
        statusMessage: Api.updateStatusMessage(TdStateEnum.NO_TD, null, null),

        tdEditor: {},
        tdParsed: {},

        interactionState: null,

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
                tabId: 'config',
                tabTitle: 'Configuration File',
                tabStyle: 'tab-container-in-tabbar',
                tabLink: '/config',
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
        tdResetSelectionsBtn: {
            btnClass: 'btn-reset',
            btnLabel: 'Reset selections',
            btnOnClick: 'reset-selections'
        },
        tdResultsBtn: {
            btnClass: 'btn-results',
            btnLabel: 'Status: No interaction selected.',
            btnOnClick: '-'
        },
        tdEditorPlaceholder: 'Paste your Thing Description here or press the upload button.',
        defaultTdConfig: {
            servient: {
                _staticAddress: 'plugfest.thingweb.io',
                scriptDir: '.',
                scriptAction: true
            },
            http: {
                port: 8080,
                allowSelfSigned: true
            },
            coap: {
                port: 5683
            },
            mqtt: {
                broker: 'mqtt://test.mosquitto.org',
                _username: 'username',
                _password: 'password',
                _clientId: 'uniqueId',
                port: 1883
            },
            log: {
                level: 'info'
            },
            credentials: {
                'urn:dev:wot:org:eclipse:leshan': {
                    identity: 'node-wot',
                    psk: 'hello'
                },
                'urn:dev:wot:org:eclipse:cf-secure': {
                    identity: 'password',
                    psk: 'sesame'
                }
            }
        }
    },
    actions: {
        async processChangedTd({ commit, state }, payload: any) {
            if (!payload.td || payload.td.length <= 0) {
                commit('setTdState', payload.tdState ? payload.tdState : TdStateEnum.NO_TD);
                commit('setErrorMsg', payload.errorMsg ? payload.errorMsg : null);
                commit('setInteractionState', null);
                commit('setStatusMessage');
                return;
            }

            commit('setInteractions', []);
            commit('setSelections', []);
            commit('setResults', []);
            commit('setTdEditor', payload.td);

            const parsedTd = await Api.consumeAndParseTd(payload.td);
            let interactionState: InteractionStateEnum | null = null;
            // Store new parsed td
            if (
                parsedTd.tdState === TdStateEnum.VALID_TD
                || parsedTd.tdState === TdStateEnum.VALID_CONSUMED_TD
            ) {
                commit('setTdParsed', parsedTd.tdParsed);
                const hasInteractions = state.tdParsed.propertyInteractions.length > 0
                    || state.tdParsed.actionInteractions.length > 0
                    || state.tdParsed.eventInteractions.length > 0;
                interactionState = hasInteractions
                    ? InteractionStateEnum.NOT_SELECTED
                    : InteractionStateEnum.NO_INTERACTIONS;
            }

            // Set td status and error message
            commit('setTdState', parsedTd.tdState);
            commit('setErrorMsg', parsedTd.errorMsg);
            commit('setInteractionState', interactionState);
            commit('setStatusMessage');
        },

        async resetAll({ commit }) {
            // await Api.resetAll();
            commit('setInteractions', []);
            commit('setSelections', []);
            commit('setResults', []);
            commit('setStatusMessage');
        },
        async resetInteractions({ commit }) {
            commit('setInteractions', []);
        },
        async resetSelections({ commit }) {
            commit('setSelections', []);
            commit('setStatusMessage');
        },
        async resetResults({ commit }) {
            commit('setResults', []);
        },

        // Add new interaction or change interaction input (without changing the order of selected interactions).
        async addToSelectedInteractions({ commit, state }, payload) {
            if (!payload.changeInteraction && !payload.newInteraction) return;

            const selectedInteractions = await state.selections;

            const interaction = await payload.changeInteraction
                ? payload.changeInteraction
                : payload.newInteraction ? payload.newInteraction : null;
            const index = await selectedInteractions.indexOf(interaction);
            const isNew = await payload.newInteraction ? true : false;

            if (isNew) {
                // Remove interaction if it already exists
                if (index !== -1) await selectedInteractions.splice(index, 1);
                // Add to selected interactions
                selectedInteractions.push(interaction);
            } else {
                // Replace selected interaction when input changed
                selectedInteractions[index] = await interaction;
            }

            // if (payload.changeInteraction) {
            //     // find selectedInteraction and replace it with payload.changeInteraction
            //         const indexToReplace = await selectedInteractions.indexOf(payload.changeInteraction);
            //         selectedInteractions[indexToReplace] = await payload.changeInteraction;
            // } else {
            //         // Remove interaction if it already exists
            //         // const indexToReplace = await selectedInteractions.indexOf(payload.newInteraction);
            //         // if (indexToReplace !== -1)  await selectedInteractions.splice(indexToReplace, 1);
            //         selectedInteractions.push(payload.newInteraction);
            // }
            commit('setSelections', selectedInteractions);
            commit('setStatusMessage');
            return selectedInteractions;
        },
        // Remove specific interaction from interactions to be invoked
        async removeFromSelectedInteractions({ commit, state }, payload) {
            const selectedInteractions = state.selections;
            selectedInteractions.splice(selectedInteractions.indexOf(payload.interactionToRemove), 1);
            commit('setSelections', selectedInteractions);
            commit('setStatusMessage');
            return selectedInteractions;
        },
        // Invoke all selected interaction
        async invokeInteractions({ commit, state }) {
            commit('setInteractionState', InteractionStateEnum.INVOKED);
            commit('setStatusMessage');
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
            state.tdState = payload;
        },
        setInteractionState(state: any, payload: InteractionStateEnum | null) {
            state.interactionState = payload;
        },
        setStatusMessage(state: any) {
            state.statusMessage = Api.updateStatusMessage(state.tdState, state.errorMsg, state.interactionState);
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
            state.interactionState = Object.entries(payload).length > 0
                ? InteractionStateEnum.NOT_INVOKED
                : InteractionStateEnum.NOT_SELECTED;
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
        getConfig(state: any) {
            // TODO: search for save config with id (given as param) else return default config
            let config;
            try {
                config = JSON.stringify(state.defaultTdConfig);
                return config;
            } catch {
                return state.defaultTdConfig;
            }
        },
        getSelections(state: any) {
            return state.selections;
        },
        getInteractionState(state: any) {
            return state.interactionState;
        },
        isValidTd(state: any) {
            return state.tdState === TdStateEnum.VALID_TD || state.tdState === TdStateEnum.VALID_CONSUMED_TD;
        },
        getStatusMessage(state: any) {
            return state.statusMessage;
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
        getSelectionResetBtn(state: any) {
            return state.tdResetSelectionsBtn;
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
