import { ElementTypeEnum, ElementTitleEnum, ProtocolEnum, VtStatus, TdStateEnum, StatusEnum } from '@/util/enums';
import * as Api from '@/backend/Api';
import * as stream from 'stream';
import { loggingError } from '@/util/helpers';
import { virtualConfigDefault, testbenchConfigDefault } from '@/util/defaults';
import { TD, Folder, Mashup } from '@/backend/Td';


export default {
    namespaced: true,
    state: {
        // ===== STATIC STORE STATE ===== //
        headerTab: {
            tabId: 'homeButton',
            tabTitle: 'W-ADE',
            tabStyle: 'border-bottom',
            tabIconButtonHide: {
                iconBtnSrcPath: 'arrow_double_left',
                iconBtnOnClick: 'settings'
            },
            tabIconButtonShow: {
                iconBtnSrcPath: 'arrow_double_left',
                iconBtnOnClick: 'settings'
            },
            tabButtonStyle: 'tab-btn-right tab-btn-20 tab-btn-header',
            tabLabelStyle: 'tab-label-80 font-bold',
            tabLink: 'settings'
        },
        sidebarAddNewButton: {
            btnKey: 'add-new',
            btnSrc: 'add',
            btnDropdownOptions: [
                {
                    title: ElementTitleEnum.FOLDER,
                    key: ElementTypeEnum.FOLDER,
                    icon: 'folder',
                    style: 'border-bottom'
                },
                {
                    title: ElementTitleEnum.TD,
                    key: ElementTypeEnum.TD,
                    icon: 'td',
                    style: 'border-bottom'
                },
                {
                    title: ElementTitleEnum.MASHUP,
                    key: ElementTypeEnum.MASHUP,
                    icon: 'mashup'
                }
            ] as WADE.DropdownOptionInterface[]
        } as WADE.ADropdowButtonInterface,
        sidebarElementDropdown: {
            btnKey: 'add-new-from-sidebar-element',
            btnStyle: 'dropdown-container-sidebar-element',
            btnIconStyle: 'sidebar-element-icon-options',
            btnDropdownOptions: [
                {
                    title: `Add new ${ElementTitleEnum.FOLDER}`,
                    key: ElementTypeEnum.FOLDER,
                    icon: 'folder',
                    style: 'border-bottom'
                },
                {
                    title: 'Add new TD',
                    key: ElementTypeEnum.TD,
                    icon: 'td',
                    style: 'border-bottom'
                },
                {
                    title: `Add new ${ElementTitleEnum.MASHUP}`,
                    key: ElementTypeEnum.MASHUP,
                    icon: 'mashup'
                }
            ] as WADE.DropdownOptionInterface[]
        } as WADE.ADropdowButtonInterface,
        configDefault: {
            // http: {
            //     allowSelfSigned: true
            // },
            // coap: {
            // },
            // mqtt: {
            //     broker: 'mqtt://broker.org',
            //     username: 'username',
            //     password: 'password',
            //     clientId: 'uniqueId'
            // },
            credentials: {
                'test-thing': {
                    username: 'username',
                    password: 'password'
                }
            }
        },
        // ===== DYNAMIC STORE STATE ===== //
        sidebarElements: [],
        folders: [],
        mashups: [],
        tds: [],
        activeElementId: null,
        isSidebarActive: true
    },
    actions: {
        async setActiveElement({ commit }, payload) {
            commit('setActiveElement', payload);
        },
        async addNewElement({ state, commit }, payload: WADE.NewStoreElementInterface) {
            let newElement;
            switch (payload.type) {
                case ElementTypeEnum.TD:
                    newElement = {
                        parentId: payload.parentId ? payload.parentId : 'parent',
                        type: payload.type,
                        title: payload.title,
                        id: payload.id,
                        hasChildren: false,
                        iconSrcPath: ElementTypeEnum.TD,
                        numOfParents: 0,
                    };
                    const tdInterface: WADE.TDElementInterface = {
                        parentId: payload.parentId ? payload.parentId : 'parent',
                        type: payload.type,
                        title: payload.title,
                        id: payload.id,
                        hasChildren: false,
                        content: '',
                        config: state.configDefault,
                        vconfig: virtualConfigDefault,
                        virtualthing: {
                            status: VtStatus.NOT_CREATED,
                            outMsg: [],
                            vt: undefined // not necessary, but used to remember that property is used
                        }
                    };
                    const newTD = new TD(tdInterface);
                    commit('addElementToStore', newTD);
                    return newElement;
                case ElementTypeEnum.FOLDER:
                    newElement = {
                        parentId: payload.parentId ? payload.parentId : 'parent',
                        type: payload.type,
                        title: payload.title,
                        description: payload.description || '',
                        id: payload.id,
                        hasChildren: true,
                        iconSrcPath: ElementTypeEnum.FOLDER,
                        numOfParents: 0,
                        children: []
                    };
                    const folderInterface: WADE.FolderElementInterface = {
                        parentId: payload.parentId ? payload.parentId : 'parent',
                        type: payload.type,
                        title: payload.title,
                        description: payload.description || '',
                        id: payload.id,
                        hasChildren: true,
                        children: []
                    };
                    const newFolder = new Folder(folderInterface);
                    commit('addElementToStore', newFolder);
                    return newElement;
                case ElementTypeEnum.MASHUP:
                    newElement = {
                        parentId: payload.parentId ? payload.parentId : 'parent',
                        type: payload.type,
                        title: payload.title,
                        description: payload.description || '',
                        id: payload.id,
                        hasChildren: true,
                        iconSrcPath: ElementTypeEnum.MASHUP,
                        mashup: {},
                        numOfParents: 0,
                        children: []
                    };
                    const mashupInterface: WADE.MashupElementInterface = {
                        parentId: payload.parentId ? payload.parentId : 'parent',
                        type: payload.type,
                        title: payload.title,
                        description: payload.description || '',
                        id: payload.id,
                        hasChildren: true,
                        children: [],
                        systemDescription: '',
                        mashupCode: '',
                    };
                    const newMashup = new Mashup(mashupInterface);
                    commit('addElementToStore', newMashup);
                    return newElement;
                default:
                    break;
            }
        },
        async addVt({ commit, state },
                    payload: {id: string, VtConfig: string, GivenTd: string, TdState: TdStateEnum}) {
            for (const element of state.tds) {
                if (element.id === payload.id) {

                    commit('setVtStatus', {id: payload.id, vtStatus: VtStatus.STARTUP});

                    // Check if there is already a Vt-process attached to the Td element
                    if (!element.virtualthing.vt ) {
                        const virtTd = payload.GivenTd;

                        // create new Writable streams for error and std output
                        const stdStream = new stream.Writable();
                        stdStream._write = (chunk, encoding, done) => {
                            const cont = chunk.toString();
                            commit('setVtOutputMsg', {
                                id: payload.id, outMsg: {content: cont, isProgram: true}
                            });
                            done();
                        };
                        const errStream = new stream.Writable();
                        errStream._write = (chunk, encoding, done) => {
                            const cont = chunk.toString();
                            commit('setVtOutputMsg', {
                                id: payload.id, outMsg: {content: cont, isError: true, isProgram: true}
                            });
                            done();
                        };

                        // check if Td is okay, give error message elsewise
                         if (   payload.TdState === TdStateEnum.VALID_TD ||
                                payload.TdState === TdStateEnum.VALID_CONSUMED_TD ) {

                            // create new Vt
                            Api.createNewVt(payload.VtConfig, stdStream, errStream, virtTd)
                            .then( (createdVt) => {
                                commit('setVirtualThing', {id: payload.id, vt: createdVt});
                                commit('setVtStatus', {id: payload.id, vtStatus: VtStatus.RUNNING});
                            }, (err) => {
                                const errMSG = 'cannot virtualize the thing, there has been an error';
                                commit('setVtOutputMsg', {
                                    id: payload.id, outMsg: {content: errMSG, isError: true, isProgram: false}
                                });
                                element.virtualthing.status = VtStatus.ERROR;
                                setTimeout( () => {
                                    element.virtualthing.status = VtStatus.NOT_CREATED;
                                }, 2000);
                                loggingError(new Error('internal error:' + err));
                            });
                        } else {
                            const errMSG = 'cannot virtualize the thing,' +
                            ' because the saved TD is not valid or no TD is saved';
                            commit('setVtOutputMsg', {
                                id: payload.id, outMsg: {content: errMSG, isError: true, isProgram: false}
                            });
                            element.virtualthing.status = VtStatus.ERROR;
                            setTimeout( () => {
                                element.virtualthing.status = VtStatus.NOT_CREATED;
                            }, 2000);
                        }

                    } else {
                        const errMSG = 'cannot virtualize the td, because Virtual Thing is already running on this thing';
                        commit('setVtOutputMsg', {
                            id: payload.id, outMsg: {content: errMSG, isError: true, isProgram: false}
                        });
                        element.virtualthing.status = VtStatus.ERROR;
                        setTimeout( () => {
                            element.virtualthing.status = VtStatus.NOT_CREATED;
                        }, 2000);
                    }
                    break;
                }
            }
        },
        async remVt({commit, state }, payload: {id: string}) {
            let tdElement: { id: string, type: string, content: any, config: any , vconfig: any, virtualthing: any};
            let index: number;
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    tdElement = element;
                    if (tdElement.virtualthing.vt) {
                        commit('setVtStatus', {id: payload.id, vtStatus: VtStatus.STOPPED});
                        Api.removeVt(element.virtualthing.vt)
                        .then( () => {
                            tdElement.virtualthing = {
                                status: VtStatus.NOT_CREATED,
                                outMsg: element.virtualthing.outMsg,
                                vt: undefined
                            };
                            index = state.tds.indexOf(element);
                            state.tds[index] = tdElement;
                            commit('setVtOutputMsg', {id: payload.id, outMsg: {
                                content: 'Virtual Thing was stopped!',
                                isError: false
                            }});
                        }, (err) => {
                            loggingError('could not stop virtual thing: ' + err);
                            commit('setVtOutputMsg', {id: payload.id, outMsg: {
                                content: 'Virtual Thing could not be stopped properly' ,
                                isError: true
                            }});
                            commit('setVtStatus', {id: payload.id, vtStatus: VtStatus.ERROR});
                            setTimeout( () => {
                                element.virtualthing.status = VtStatus.RUNNING;
                            }, 2000);
                        });
                    } else {
                        loggingError(new Error('found no vt on the td'));
                    }
                    break;
                }
            }
        },
        async deleteElementAndChildren({state, commit, dispatch}, payload: {id: string, type: string}) {
            const elementList: any[] = state[`${payload.type}s`];
            let elementToDelete: TD | Mashup | Folder | undefined;
            elementToDelete = elementList.find(element => element.id === payload.id);
            if (elementToDelete && elementToDelete.hasChildren) {
                while (elementToDelete.children.length > 0) {
                    const child = elementToDelete.children[0];
                    await dispatch('deleteElementAndChildren', {id: child.id, type: child.type});
                }
            }
            commit('deleteElementFromStore', payload);
        },
        async renameElement({ commit }, payload: {id: string, type: string, newId: string}) {
            commit('renameElement', payload);
        },
        setConformanceResults({ commit, state }, payload: { id: string, results: any }) {
            let index = -1
            for (const td of state.tds) {
                if (td.id === payload.id) {
                    index = state.tds.indexOf(td);
                    break;
                }
            }

            if (index === -1) {
                return;
            }

            commit('setConformanceResults', { index, results: payload.results })
        },
        setVulnerabilityResults({ commit, state }, payload: { id: string, results: any }) {
            let index = -1
            for (const td of state.tds) {
                if (td.id === payload.id) {
                    index = state.tds.indexOf(td);
                    break;
                }
            }

            if (index === -1) {
                return;
            }

            commit('setVulnerabilityResults', { index, results: payload.results })
        },
        setCoverageResults({ commit, state }, payload: { id: string, results: any }) {
            let index = -1
            for (const td of state.tds) {
                if (td.id === payload.id) {
                    index = state.tds.indexOf(td);
                    break;
                }
            }

            if (index === -1) {
                return;
            }

            commit('setCoverageResults', { index, results: payload.results })
        },
        setTestbenchConfig({ commit, state }, payload: { id: string, config: object }) {
            let index = -1
            for (const td of state.tds) {
                if (td.id === payload.id) {
                    index = state.tds.indexOf(td);
                    break;
                }
            }

            if (index === -1) {
                return;
            }

            commit('setTestbenchConfig', { index, config: payload.config });
        }   
    },
    mutations: {
        saveTdConfig(state: any, payload: { config: any, id: string }) {
            let tdElement: { id: string, type: string, config: any, content?: any };
            let index: number;
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    tdElement = element;
                    tdElement.config = payload.config;
                    index = state.tds.indexOf(element);
                    state.tds[index] = tdElement;
                    break;
                }
            }
        },
        saveTdVirtualConfig(state: any, payload: { vconfig: any, id: string }) {
            let tdElement: { id: string, type: string, vconfig: any, content?: any };
            let index: number;
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    tdElement = element;
                    tdElement.vconfig = payload.vconfig;
                    index = state.tds.indexOf(element);
                    state.tds[index] = tdElement;
                    break;
                }
            }
        },
        // Saves the protocols available in a td to the td element
        saveTdProtocols(state: any, payload: { id: string, td: any }) {
            let tdElement: {
                id: string,
                type: string,
                config: any,
                vconfig: any,
                content?: any,
                protocols?: ProtocolEnum[] | null,
                virtualthing: any
            };
            const protocols: ProtocolEnum[] | null = Api.retrieveProtocols(payload.td);
            for (const td of state.tds) {
                if (td.id === payload.id) {
                    tdElement = td;
                    tdElement.protocols = protocols;
                    state.tds[state.tds.indexOf(td)] = tdElement;
                    break;
                }
            }
        },
        // Find td element and save content to it
        saveTd(state: any, payload: { content: any, id: string }) {
            let tdElement: { id: string, type: string, content: any, config: any , vconfig: any, virtualthing: any};
            let index: number;
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    tdElement = element;
                    tdElement.content = payload.content;
                    index = state.tds.indexOf(element);
                    state.tds[index] = tdElement;
                    break;
                }
            }
            const element = (state.tds as any[]).find(td => td.id === payload.id);
            if (element.parentId !== 'parent') {
                for (const mashup of state.mashups as any[]) {
                    const childIndex = mashup.children.findIndex(child => child.id === element.id);
                    if (childIndex !== -1) {
                        mashup.children[childIndex].content = payload.content;
                    }
                }
            }

        },
        // Adds a new td / mashup / folder to tds / mashups / folders
        // TODO: Resolve conflicts for payload type
        // addElementToStore(state: any, payload: TD | Mashup | Folder) {
        addElementToStore(state: any, payload: any) {
            state[`${payload.type}s`].push(payload);
            let finished = false;
            if (payload.parentId !== 'parent') {
                for (const mashup of state.mashups as Mashup[]) {
                    if (mashup.id === payload.parentId ) {
                        mashup[`${payload.type}s`].push(payload);
                        mashup.children.push(payload as TD | Mashup);
                        finished = true;
                        break;
                    }
                }
                if (!finished) for (const folder of state.folders as Folder[]) {
                    if (folder.id === payload.parentId ) {
                        folder[`${payload.type}s`].push(payload);
                        folder.children.push(payload);
                        finished = true;
                        break;
                    }
                }
            }
        },
        // Delete td/ mashup/ folder from tds/ mashups/ folders
        deleteElementFromStore(state: any, payload: {id: string, type: string}) {
            const elementList = state[`${payload.type}s`];
            let elementToDelete: TD | Mashup | Folder | undefined;
            for (const element of elementList as (TD[] | Mashup[] | Folder[])) {
                if (element.id === payload.id) {
                    elementToDelete = element;
                    elementList.splice(elementList.indexOf(element), 1);
                    break;
                }
            }
            if (elementToDelete && elementToDelete.parentId !== 'parent') {
                let finished = false;
                for (const mashup of state.mashups as Mashup[]) {
                    if (mashup.id === elementToDelete.parentId) {
                        const index = mashup.children.findIndex(child => {if (elementToDelete) return child.id === elementToDelete.id; });
                        if (index !== -1) mashup.children.splice(index, 1);
                        finished = true;
                        break;
                    }
                }
                if (!finished) for (const folder of state.folders as Folder[]) {
                    if (folder.id === elementToDelete.parentId) {
                        const index = folder.children.findIndex(child => {if (elementToDelete) return child.id === elementToDelete.id; });
                        if (index !== -1) folder.children.splice(index, 1);
                        finished = true;
                        break;
                    }
                }
            }
        },
        addSidebarElement(state: any, payload: any) {
            if (payload.parentId === 'parent') {
                state.sidebarElements.push(payload);
                return;
            }

            function findParentElement(elements: WADE.SidebarElement[], parentId: string) {
                for (const element of elements) {
                    if (element.id === parentId && element.children) {
                        payload.numOfParents = element.numOfParents + 1;
                        element.children.push(payload);
                        break;
                    }
                    if (element.children && element.children.length > 0) {
                        findParentElement(element.children, parentId);
                    }
                }
                state.sidebarElements = elements;
            }
            findParentElement(state.sidebarElements, payload.parentId);
        },
        // Search sidebar elements and children recursive and delete element
        deleteSidebarElement(state: any, payload: any) {
            function getElement(elements: WADE.SidebarElement[], id: string) {
                for (const element of elements) {
                    if (element.id === id) {
                        // Delete element
                        elements.splice(elements.indexOf(element), 1);
                        break;
                    }
                    if (element.hasChildren && element.children && element.children.length > 0) {
                        getElement(element.children, id);
                    }
                }
                state.sidebarElements = elements;
            }
            getElement(state.sidebarElements, payload.id);
        },
        // Sets active sidebar element (shown in UI)
        setActiveElement(state: any, payload: any) {
            state.activeElementId = payload;
        },
        setSidebarActiveStatus(state: any, payload: boolean) {
            state.isSidebarActive = payload;
        },
        setVirtualThing(state: any, payload: {id: string, vt: any}) {
            let tdElement: { id: string, type: string, content: any, config: any , vconfig: any, virtualthing: any};
            let index: number;
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    tdElement = element;
                    tdElement.virtualthing.vt = payload.vt;
                    index = state.tds.indexOf(element);
                    state.tds[index] = tdElement;
                    break;
                }
            }
        },
        /**
         * Adds the given outMsg to the output field in the
         * virtual thing tab. In addition to that, the function
         * also adds the current time to the message and checks
         * whether the maximum array size of the output field is
         * reached
         *
         *  @         param state given vuex state
         * @param payload id of the td, outMsg to add:
         *                              - content The message to display
         *                              - isError Is it an Error message?
         *                              - isProgram Is it output of a Program? (listening to stdout of a cli)
         */
        setVtOutputMsg(state: any, payload: {
                                id: string, outMsg: {
                                    content: string,
                                    isError?: boolean,
                                    isProgram?: boolean
                                }}) {
            let tdElement: { id: string, type: string, content: any, config: any , vconfig: any, virtualthing: any};
            let index: number;
            const maxOutMsg = 200;

            for (const element of state.tds) {
                if (element.id === payload.id) {
                    const daytime = new Date(Date.now());
                    tdElement = element;
                    let provContent: string;
                    let newContent: string[];

                    if (payload.outMsg.content.slice(0, 15) === '[32minfo[39m:') {
                        provContent = payload.outMsg.content.slice(15);
                    } else {
                        provContent = payload.outMsg.content;
                    }

                    newContent = provContent.split('[32minfo[39m:');


                    newContent.forEach((msg, ind) => {
                        let checkAction = false;
                        let checkPropertyRead = false;
                        let checkPropertyWrite = false;
                        let checkEvent = false;
                        let message = msg;

                        while (message.slice(0, 1) === ' ') {
                            message = message.slice(1);
                        }

                        if (payload.outMsg.isProgram === true) {
                            const checkType = message.slice(0, 3);

                            if (checkType === 'A: ') {
                                checkAction = true;
                                message = message.slice(2);
                            } else if (checkType === 'PR:') {
                                checkPropertyRead = true;
                                message = message.slice(3);
                            } else if (checkType === 'PW:') {
                                checkPropertyWrite = true;
                                message = message.slice(3);
                            } else if (checkType === 'E: ') {
                                checkEvent = true;
                                message = message.slice(2);
                            }
                        }


                        const newMsg = {
                            time: {
                                // "full" to be used as vue-key attribute (-> has to be unique)
                                full: daytime.getDate().toString() +
                                daytime.getHours().toString() +
                                daytime.getMinutes().toString() +
                                daytime.getSeconds().toString() +
                                daytime.getMilliseconds().toString() +
                                message + ind.toString(),
                                h: ('0' + daytime.getHours()).slice(-2),
                                m: ('0' + daytime.getMinutes()).slice(-2),
                                s: ('0' + daytime.getSeconds()).slice(-2)
                            },
                            content: message,
                            isError: payload.outMsg.isError ? true : false,
                            isProgram: payload.outMsg.isProgram ? true : false,
                            isVtAction: checkAction,
                            isVtPropertyRead: checkPropertyRead,
                            isVtPropertyWrite: checkPropertyWrite,
                            isVtEvent: checkEvent
                        };
                        tdElement.virtualthing.outMsg.unshift(newMsg);
                        if (tdElement.virtualthing.outMsg.length > maxOutMsg) {
                            tdElement.virtualthing.outMsg.pop();
                        }
                    });
                    // write to the state element
                    index = state.tds.indexOf(element);
                    state.tds[index] = tdElement;
                    break;
                }
            }
        },
        setVtStatus(state: any, payload: {id: string, vtStatus: VtStatus}) {
            let tdElement: { id: string, type: string, content: any, config: any , vconfig: any, virtualthing: any};
            let index: number;
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    tdElement = element;
                    tdElement.virtualthing.status = payload.vtStatus;
                    index = state.tds.indexOf(element);
                    state.tds[index] = tdElement;
                    break;
                }
            }
        },
        renameElement(state: any, payload: {id: string, type: string, newId: string}) {
            for (const element of state.sidebarElements) {
                if (element.id === payload.id) {
                    element.id = payload.newId;
                    element.title = payload.newId;
                    break;
                }
            }

            for (const element of state[`${payload.type}s`]) {
                if (element.id === payload.id) {
                    element.id = payload.newId;
                    element.title = payload.newId;
                    return;
                }
            }
        },
        setConformanceResults(state: any, payload: {index: number, results: any}) {
            state.tds[payload.index].conformanceResults = payload.results;
        },
        setVulnerabilityResults(state: any, payload: {index: number, results: any}) {
            state.tds[payload.index].vulnerabilityResults = payload.results;
        },
        setCoverageResults(state: any, payload: {index: number, results: any}) {
            state.tds[payload.index].coverageResults = payload.results;
        },
        setTestbenchConfig(state: any, payload: {index: number, config: object}) {
            state.tds[payload.index].testbenchConfig = payload.config;
        }
    },
    getters: {
        getSidebarActive(state: any) {
            return state.isSidebarActive;
        },
        getDefaultConfig(state: any) {
            return JSON.stringify(state.configDefault);
        },
        getDefaultVirtualConfig(state: any) {
            return JSON.stringify(virtualConfigDefault);
        },
        getTestbenchDefaultConfig() {
            return JSON.stringify(testbenchConfigDefault);
        },
        getConfig(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        if (!td.config || td.config.length <= 0) {
                            return JSON.stringify(state.configDefault);
                        } else {
                            let config;
                            try {
                                config = JSON.stringify(td.config);
                            } catch (error) {
                                config = td.config.toString();
                            }
                            return config;
                        }
                    }
                }
                return '';
            };
        },
        getVirtualConfig(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        if (!td.vconfig || td.vconfig.length <= 0) {
                            return JSON.stringify(virtualConfigDefault);
                        } else {
                            let vconfig;
                            try {
                                vconfig = JSON.stringify(td.vconfig);
                            } catch (error) {
                                vconfig = td.vconfig.toString();
                            }
                            return vconfig;
                        }
                    }
                }
                return '';
            };
        },
        getTestbenchConfig(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        if (td.testbenchConfig) {
                            let testbenchConfig = '';

                            try {
                                testbenchConfig = JSON.stringify(td.testbenchConfig);
                            } catch (error) {
                                testbenchConfig = td.testbenchConfig.toString();
                            }

                            return testbenchConfig;
                        } else {
                            return JSON.stringify(testbenchConfigDefault);
                        }
                    }
                }
            }
        },
        getProtocols(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id && td.protocols) {
                        return td.protocols;
                    }
                }
                return [];
            };
        },
        getSavedTd(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        return td.content || '';
                    }
                }
                return '';
            };
        },
        getHeaderTab(state: any) {
            return state.headerTab;
        },
        getAddNewButton(state: any) {
            return state.sidebarAddNewButton;
        },
        sidebarElementDropdown(state: any) {
            return state.sidebarElementDropdown;
        },
        getSidebarElements(state: any) {
            return state.sidebarElements;
        },
        isActiveElement(state: any) {
            return (id: any) => {
                return state.activeElementId === id;
            };
        },
        /**
         * Returns either a specific sidebar element when param has 'id'
         * or an array of sidebar elements, when param has 'type'
         *  @          param state store state
         */
        getSidebarElement(state: any) {
            return (elToFind) => {
                let sidebarElement: null | any | any[] = elToFind.id ? null : [];
                function findElement(elToProve: { id?: string, type?: string }, elements: any) {
                    for (const element of elements) {
                        if (elToProve.id && element.id === elToFind.id) {
                            sidebarElement = element;
                            break;
                        }
                        if (elToProve.type && element.type === elToProve.type) {
                            sidebarElement.push(element);
                        }
                        if (element.children && element.children.length > 0) {
                            findElement(elToProve, element.children);
                        }
                    }
                }
                findElement(elToFind, state.sidebarElements);
                return sidebarElement;
            };
        },
        getTd(state: any, id: string): TD | null {
            for (const td of state.tds) {
                if (td.id === id) return td;
            }
            return null;
        },
        getMashup(state: any) {
            return (id: string) => {
                for (const mashup of state.mashups) {
                    if (mashup.id === id) return mashup;
                }
                return null;
            };
        },
        getFolder(state: any, id: string): Folder | null {
            for (const folder of state.folders) {
                if (folder.id === id) return folder;
            }
            return null;
        },
        doesIdAlreadyExist(state: any) {
            return (id: string) => {
                let doesExist = false;
                function checkId(idToProve: string, elements: any) {
                    for (const element of elements) {
                        if (element.id === idToProve) {
                            doesExist = true;
                            break;
                        }
                        if (element.children && element.children.length > 0) {
                            checkId(idToProve, element.children);
                        }
                    }
                }
                checkId(id, state.sidebarElements);
                return doesExist;
            };
        },
        getVtStatus(state: any) {
            return (id: string) => {
                let retStatus = VtStatus.NOT_CREATED;
                let retError = false;
                let retActive = false;
                for (const td of state.tds) {
                    if (td.id === id) {
                        // return td.content || '';
                        if ( td.virtualthing.status ) {
                            retStatus = td.virtualthing.status;
                            if ( retStatus === VtStatus.ERROR ) {
                                retError = true;
                            } else if ( retStatus === VtStatus.STARTUP ||
                                        retStatus === VtStatus.STOPPED ||
                                        retStatus === VtStatus.RUNNING) {
                                retActive = true;
                            }
                        } else {
                            loggingError(new Error('virtual thing status does not exist'));
                        }
                        return {msg: retStatus, err: retError, active: retActive};
                    }
                }
                return '';
            };
        },
        getVtLink(state: any) {
            return (id: string) => {
                let retLink: string;
                let retCopy: string[];
                for (const td of state.tds) {
                    if (td.id === id) {
                        if (td.virtualthing.vt) {
                            if ( td.virtualthing.vt.link ) {
                                retLink = td.virtualthing.vt.link;
                            } else {
                                retLink = '';
                            }
                            if (td.virtualthing.vt.copyLinks) {
                                retCopy = td.virtualthing.vt.copyLinks;
                            } else {
                                retCopy = [];
                            }
                            return {link: retLink, copyLinks: retCopy};
                        }
                    }
                }
                return {link: '', copyLinks: []};
            };
        },
        getVtOutputMsg(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        return td.virtualthing.outMsg || [];
                    }
                }
                return '';
            };
        },
        getConformanceResults(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        return td.conformanceResults;
                    }
                }
            }
        },
        getVulnerabilityResults(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        return td.vulnerabilityResults;
                    }
                }
            }
        },
        getCoverageResults(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        return td.coverageResults;
                    }
                }
            }
        }
    }
};
