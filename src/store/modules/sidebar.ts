import { ElementTypeEnum, ElementTitleEnum } from '@/util/enums';
export default {
    namespaced: true,
    state: {
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
              ]
        },
        sidebarElements: [],
        folders: [],
        mashups: [],
        tds: [],
        activeElementId: null
    },
    actions: {
      async addNewElement({ commit }, payload) {
        let newElement;
        switch (payload.type) {
            case ElementTypeEnum.TD:
                newElement = {
                    parentId: 'parent',
                    type: payload.type,
                    title: payload.title,
                    id: payload.id,
                    hasChildren: false,
                    hasTimingPerformance: true,
                    iconSrcPath: ElementTypeEnum.TD,
                    td: {}
                };
                commit('addNewTd', newElement);
                return newElement;
            case ElementTypeEnum.FOLDER:
                newElement = {
                    parentId: 'parent',
                    type: payload.type,
                    title: payload.title,
                    id: payload.id,
                    hasChildren: true,
                    hasTimingPerformance: false,
                    iconSrcPath: ElementTypeEnum.FOLDER,
                    folder: {},
                    numOfParents: 0,
                    children: [
                        // only for testing, dummy data
                        {
                            parentId: payload.id,
                            type: payload.type,
                            title: `${payload.id + 1}`,
                            id: `${payload.id + 1}`,
                            hasChildren: true,
                            hasTimingPerformance: false,
                            iconSrcPath: ElementTypeEnum.FOLDER,
                            folder: {},
                            numOfParents: 1,
                            children: []
                        },
                        {
                            parentId: payload.id,
                            type: payload.type,
                            title: `${payload.id + 2}`,
                            id: `${payload.id + 2}`,
                            hasChildren: true,
                            hasTimingPerformance: false,
                            iconSrcPath: ElementTypeEnum.FOLDER,
                            folder: {},
                            numOfParents: 1,
                            children: [
                                {
                                    parentId: `${payload.id + 2}`,
                                    type: payload.type,
                                    title: `${payload.id + 3}`,
                                    id: `${payload.id + 3}`,
                                    hasChildren: true,
                                    hasTimingPerformance: false,
                                    iconSrcPath: ElementTypeEnum.FOLDER,
                                    folder: {},
                                    numOfParents: 2,
                                    children: []
                                },
                            ]
                        }
                    ]
                };
                commit('addNewFolder', newElement);
                return newElement;
            case ElementTypeEnum.MASHUP:
                newElement = {
                    type: payload.type,
                    title: payload.title,
                    id: payload.id,
                    hasChildren: false,
                    hasTimingPerformance: false,
                    iconSrcPath: ElementTypeEnum.MASHUP,
                    mashup: {},
                    children: []
                };
                commit('addNewMashup', newElement);
                return newElement;
            default:
            break;
        }
    },
    },
    mutations: {
        deleteSidebarElement(state: any, payload: any) {
            // Search elements and children recursive and delet existing element
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
      setActiveElement(state: any, payload: any) {
          state.activeElementId = payload;
      },
      addNewMashup(state: any, payload: any) {
        state.mashups.push(payload);
      },
      addNewTd(state: any, payload: any) {
          state.tds.push(payload);
      },
      addNewFolder(state: any, payload: any) {
          state.folders.push(payload);
      },
      addSidebarElement(state: any, payload: any) {
          state.sidebarElements.push(payload);
      },
      setNewCurrentTd(state: any, payload: any) {
          for (const sidebarElement in state.sidebarElements) {
              if (state.sidebarElements[sidebarElement].id === payload.id) {
                state.sidebarElements[sidebarElement].td = payload.td;
            }
          }
      }
    },
    getters: {
        getHeaderTab(state: any) {
            return state.sidebarHeaderTab;
        },
        getAddNewButton(state: any) {
            return state.sidebarAddNewButton;
        },
        getSidebarElements(state: any) {
            return state.sidebarElements;
        },
        isActiveElement(state: any) {
            return (id: any) => {
                return state.activeElementId === id;
            };
        },
        getCurrentTd(state: any) {
            return (id: string) => {
                for (const sidebarElement in state.sidebarElements) {
                    if (!state.sidebarElements.hasOwnProperty(state.sidebarElements[sidebarElement])) {
                        if (state.sidebarElements[sidebarElement].id === id) {
                        return state.sidebarElements[sidebarElement].td;
                        }
                    }
                }
                return null;
            };
        },
        doesIdAlreadyExist(state: any) {
            return (id: string) => {
                let doesExist = false;
                for (const sidebarElement in state.sidebarElements) {
                    if (!state.sidebarElements.hasOwnProperty(state.sidebarElements[sidebarElement])) {
                        if (state.sidebarElements[sidebarElement].id === id) {
                            doesExist = true;
                        }
                    }
                }
                return doesExist;
            };
        }
    }
};
