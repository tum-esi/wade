import { ElementTypeEnum, ElementTitleEnum, ProtocolEnum, VtStatus } from '@/util/enums';
import * as Api from '@/backend/Api';
import * as stream from 'stream';


export default {
    namespaced: true,
    state: {
        // ===== STATIC STORE STATE ===== //
        sidebarHeaderTab: {
            tabId: 'homeButton',
            tabTitle: 'W-ADE',
            tabStyle: 'border-bottom',
            tabIconButton: {
                iconBtnSrcPath: 'settings',
                iconBtnOnClick: 'settings'
            },
            tabButtonStyle: 'btn-left tab-btn-small tab-btn-header',
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
        /* the same as in virtual thing EDIT: changed address and port to avoid conflicts */
        virtualConfigDefault: {
            servient: {
                staticAddress: '127.0.0.90',
                http: {
                    port: 89
                }
            },
            log: {
                level: 2
            },
            things: {
                'de:tum:ei:esi:fp:coffee': {
                    eventIntervals: {
                        maintenance: 15,
                        error: 15
                    }
                }
            }
        },
        // ===== DYNAMIC STORE STATE ===== //
        sidebarElements: [],
        folders: [],
        mashups: [],
        tds: [],
        activeElementId: null
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
                    commit('addElementToStore', {
                        id: newElement.id,
                        type: newElement.type,
                        content: '',
                        config: state.configDefault,
                        vconfig: state.virtualConfigDefault,
                        virtualthing: {
                            status: VtStatus.NOT_CREATED,
                            outStd: 'a: ',
                            outErr: 'b: ',
                            vt: []
                        }
                    });
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
                    commit('addElementToStore', { id: newElement.id, type: newElement.type });
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
                    commit('addElementToStore', { id: newElement.id, type: newElement.type });
                    return newElement;
                default:
                    break;
            }
        },
        async addVt({ commit, state }, payload: {id: string, VtConfig: string, GivenTd?: string}) {
            console.debug('in addVt : id:',payload.id,' vtconf:',payload.VtConfig, ' TD:',payload.GivenTd);
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    console.debug( ' in main addVt loop');
                    let virtTd = payload.GivenTd;

                    console.debug('virtual thing: ', element);

                    // create new Writable streams for error and std output
                    const stdStream = new stream.Writable();
                    stdStream._write = (chunk, encoding, done) => {
                        const maxStringStd = 2000;
                        const content = chunk.toString();
                        const oldString = element.virtualthing.outStd;
                        const estimatedlength = oldString.length + content.length;
                        let newString: string;

                        if ( estimatedlength > maxStringStd) {
                            newString = oldString.slice(estimatedlength - maxStringStd) + content;
                        } else {
                            newString = oldString + content;
                        }
                        commit('setVtOutputStd', {id: payload.id, vtOut: newString});
                        console.debug('--stdStream: ', newString);
                        done();
                    };
                    const errStream = new stream.Writable();
                    errStream._write = (chunk, encoding, done) => {
                        const maxStringStd = 1000;
                        let content: string;
                        content = chunk.toString();
                        const oldString = element.virtualthing.outErr;
                        const estimatedlength = oldString.length + content.length;
                        let newString: string;

                        if ( estimatedlength > maxStringStd) {
                            newString = oldString.slice(estimatedlength - maxStringStd) + content;
                        } else {
                            newString = oldString + content;
                        }
                        commit('setVtOutputErr', {id: payload.id, vtErr: newString});
                        console.debug('--errStream: ', newString);
                        done();
                    };

                    // check if Td is okay, give undefined elsewise, to trigger use of default TD
                    // if ( state.tdState === TdStateEnum.VALID_TD || state.tdState === TdStateEnum.VALID_CONSUMED_TD ) {
                    //     payload.GivenTd = undefined;
                    // }
                    // DEBUG
                    virtTd = undefined;

                    // create new Vt
                    const createdVt = await Api.createNewVt(payload.VtConfig, stdStream, errStream, virtTd);
                    // TODO add Thing description
                    commit('setVirtualThing', {id: payload.id, vt: createdVt});
                }
            }
        },
        async remVt({commit, state }, payload: {id: string}) {
            let tdElement: { id: string, type: string, content: any, config: any , vconfig: any, virtualthing: any};
            let index: number;
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    await Api.removeVt(element.virtualthing.vt);
                    tdElement = element;
                    tdElement.virtualthing = {
                                                status: VtStatus.NOT_CREATED,
                                                outStd: element.virtualthing.outStd,
                                                outErr: element.virtualthing.errStd,
                                                vt: []
                                            };
                    index = state.tds.indexOf(element);
                    state.tds[index] = tdElement;
                    break;
                }
            }
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
        // Saves the protocols avauílable in a td to the td element
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
        },
        // Adds a new td / mashup / folder to tds / mashups / folders
        addElementToStore(state: any, payload: { id: string, type: string }) {
            state[`${payload.type}s`].push(payload);
        },
        // Delete td/ mashup/ folder from tds/ mashups/ folders
        deleteElementFromStore(state: any, payload: any) {
            const elementList = state[`${payload.type}s`];
            for (const element of elementList) {
                if (element.id === payload.id) {
                    elementList.splice(elementList.indexOf(element), 1);
                    return;
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
        setVtOutputStd(state: any, payload: {id: string, vtOut: any}) {
            let tdElement: { id: string, type: string, content: any, config: any , vconfig: any, virtualthing: any};
            let index: number;
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    tdElement = element;
                    tdElement.virtualthing.outStd = payload.vtOut;
                    index = state.tds.indexOf(element);
                    state.tds[index] = tdElement;
                    break;
                }
            }
        },
        setVtOutputErr(state: any, payload: {id: string, vtErr: any}) {
            let tdElement: { id: string, type: string, content: any, config: any , vconfig: any, virtualthing: any};
            let index: number;
            for (const element of state.tds) {
                if (element.id === payload.id) {
                    tdElement = element;
                    tdElement.virtualthing.outErr = payload.vtErr;
                    index = state.tds.indexOf(element);
                    state.tds[index] = tdElement;
                    break;
                }
            }
        }
    },
    getters: {
        getDefaultConfig(state: any) {
            return JSON.stringify(state.configDefault);
        },
        getDefaultVirtualConfig(state: any) {
            return JSON.stringify(state.virtualConfigDefault);
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
                            return JSON.stringify(state.virtualConfigDefault);
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
        getVirtualThingOut(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        if (!td.vtOutputStd || !td.vtOutputErr){
                            return {std: '', err: ''};
                        } else{
                            return {std: td.vtOutputStd, err: td.vtOutputErr};
                        }
                    }
                }
                return {std: '', err: 'some error!'};
            };
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
            return state.sidebarHeaderTab;
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
         * @param state store state
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
                        if ( td.virtualthing.vt ) {
                            retStatus = td.virtualthing.status;
                            if ( retStatus === VtStatus.ERROR ) {
                                retError = true;
                            } else if ( retStatus === VtStatus.STARTUP || retStatus === VtStatus.STOPPED) {
                                retActive = true;
                            }
                        }
                        return {msg: retStatus, err: retError, active: retActive};
                    }
                }
                return '';
            };
        },
        getVtOutputStd(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        return td.virtualthing.outStd || '';
                    }
                }
                return '';
            };
        },
        getVtOutputErr(state: any) {
            return (id: string) => {
                for (const td of state.tds) {
                    if (td.id === id) {
                        return td.virtualthing.outErr || '';
                    }
                }
                return '';
            };
        }
    }
};
