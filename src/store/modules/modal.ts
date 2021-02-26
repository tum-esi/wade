export default {
  namespaced: true,
  state: {
    folderElement: {
      type: 'folder',
      src: 'folder',
      title: 'Folder',
      forms: [
        {
          key: 'name',
          title: 'Folder Name',
          placeholder: 'My Folder',
          value: '',
          isRequired: true,
          mustBeUnique: true,
          rules: {
            minChars: 5,
            maxChars: 30,
            errorMessage:
              'The folder\'s name should have at least 5 and maximal 30 characters.',
            errorMessageDuplicate:
              'Another element with the same name exists. Please change the name.'
          }
        },
        {
          key: 'description',
          title: 'Folder Description',
          placeholder: 'My Folder Description',
          value: '',
          isRequired: false
        }
      ]
    },
    mashupElement: {
      type: 'mashup',
      src: 'mashup.png',
      title: 'Mashup',
      forms: [
        {
          key: 'name',
          title: 'Mashup Name',
          placeholder: 'My Mashup',
          value: '',
          isRequired: true,
          mustBeUnique: true,
          rules: {
            minChars: 5,
            maxChars: 30,
            errorMessage:
              'The mashup\'s name should have at least 5 and maximal 30 characters.',
            errorMessageDuplicate:
              'Another element with the same name exists. Please change the name.'
          }
        },
        {
          key: 'description',
          title: 'Mashup Description',
          placeholder: 'My Mashup Description',
          value: '',
          isRequired: false
        }
      ]
    },
    tdElement: {
      type: 'td',
      src: 'td.png',
      title: 'Thing Description',
      forms: [
        {
          key: 'name',
          title: 'Thing Description Name',
          placeholder: 'My Thing Description',
          value: '',
          isRequired: true,
          mustBeUnique: true,
          rules: {
            minChars: 5,
            maxChars: 30,
            errorMessage:
              'The Thing Description\'s name should have at least 5 and maximal 30 characters.',
            errorMessageDuplicate:
              'Another element with the same name exists. Please change the name.'
          }
        }
      ]
    }
  },
  getters: {
    getElementTd(state: any) {
      return state.tdElement;
    },
    getElementMashup(state: any) {
      return state.mashupElement;
    },
    getElementFolder(state: any) {
      return state.folderElement;
    }
  }
};
