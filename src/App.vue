<template>
  <div id="app">
    <tSidebar id="sidebar" 
      v-on:open-module-element="openModal"
      v-on:sidebar-element-clicked="sidebarElementClicked"
      v-on:home-clicked="homeClicked"
    />
    <router-view id="main-content"/>
    <oModal 
      v-if="isModalVisible"
      v-show="isModalVisible"
      v-on:cancel="closeModal"
      :modalElement="modalElement"
      v-on:create-element="createNewElement"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import tSidebar from '@/components/04_templates/tSidebar.vue';
import oModal from '@/components/03_organisms/oModal.vue';
import { ElementTypeEnum } from '@/util/enums';
import { remote } from 'electron';

export default Vue.extend({
  name: 'App',
  components: {
    tSidebar,
    oModal
  },
  data() {
    return {
      modalElement: {} as WADE.ModalAddElementInterface,
      isModalVisible: false,
      width: 0,
      windowHeight: 0
    };
  },
  created() {
    this.$eventHub.$on('open-modal-element', this.openModal);
    window.addEventListener('resize', this.changeWindowSize);
  },
  beforeDestroy() {
    this.$eventHub.$off('open-modal-element');
    window.addEventListener('resize', this.changeWindowSize);
  },
  computed: {
    ...mapGetters('ModalStore', ['getElementTd', 'getElementMashup', 'getElementFolder']),
    windowStyle() {
      return `width: ${(this as any).windowSize[0]}; height: ${(this as any).windowSize[1]}`;
    }
  },
  methods: {
    ...mapActions('SidebarStore', ['addNewElement']),
    ...mapMutations('SidebarStore', ['addSidebarElement']),
    changeWindowSize() {
      // console.log('windowSize:', remote.getCurrentWindow().getSize());
    },
    openModal(element: any) {
      switch (element.btnValue) {
        case ElementTypeEnum.FOLDER:
          this.modalElement = (this as any).getElementFolder;
          this.modalElement.parentId = element.parentId;
          break;
        case ElementTypeEnum.MASHUP:
          this.modalElement = (this as any).getElementMashup;
          this.modalElement.parentId = element.parentId;
          break;
        case ElementTypeEnum.TD:
          this.modalElement = (this as any).getElementTd;
          this.modalElement.parentId = element.parentId;
          break;
        default:
          this.modalElement = (this as any).getElementTd;
          this.modalElement.parentId = element.parentId;
      }
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    async createNewElement(newElement: any) {
      this.isModalVisible = false;
      if (!newElement.data) return;
      const newEl = {
        type: newElement.type,
        title: newElement.data[0].value,
        description: newElement.data.length > 1 ? newElement.data[1].value : null,
        id: newElement.data[0].value,
        parentId: newElement.parentId ? newElement.parentId : 'parent'
      };
      const newSidebarEl = await (this as any).addNewElement(newEl);
      (this as any).addSidebarElement(newSidebarEl);
      switch (newElement.type) {
        case ElementTypeEnum.TD:
          this.$router.push({
            name: 'thingDescription',
            params: { id: newEl.id}
          });
          break;
        case ElementTypeEnum.FOLDER:
          this.$router.push({
            name: 'folder',
            params: { id: newEl.id}
          });
          break;
        case ElementTypeEnum.MASHUP:
          this.$router.push({
            name: 'mashup',
            params: { id: newEl.id}
          });
          break;
        default:
          break;
      }
      this.$eventHub.$emit('sidebar-element-added', newElement.parentId ? newElement.parentId : 'parent');
    },
    homeClicked() {
      if (this.$router.currentRoute.name === 'home') return;
      this.$router.push({
        name: 'home'
      });
    },
    sidebarElementClicked(elementId: string, elementType: string) {
      let routeName = '';
      switch (elementType) {
        case ElementTypeEnum.TD:
          routeName = 'thingDescription';
          break;
        case ElementTypeEnum.MASHUP:
          routeName = 'mashup';
          break;
        case ElementTypeEnum.FOLDER:
          routeName = 'folder';
          break;
      }

      if (this.$router.currentRoute.name === routeName
        && this.$router.currentRoute.params
        && this.$router.currentRoute.params.id === elementId) return;

      this.$router.push({
        name: routeName,
        params: { id: elementId }
      });
    }
  }
});
</script>


<style lang="less">
/* General colors for the application

  Color Main: #b5dfdd
  Color Dark: #305E5C
  Color Medium: #8AABA9
  Color Red: #AB7C79
  Color Red Dark: #634038
  Color Red Medium: #A36A5B

  Background Grey: #b4bab9
  Medium Grey: #939C9E
  Dark Grey: #393B3A; (e.g. borders)
*/

/* General styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}

html {
  width: 100%;
  height: 100%;
}

body {
  width: 100%;
  height: 100%;
}

textarea:focus, input:focus{
  outline: none;
  box-shadow: none;
}

*:focus {
  outline: none;
  box-shadow: none;
}

.border-bottom {
  border-bottom: 1px solid #393B3A;
}

.border-bottom-bold {
  border-bottom: 2px solid #393B3A;
}

.border-right {
  border-right: 1px solid #393B3A;
}

.btn {
  border-radius: 3px;
  outline: none;
  border: none;
  background: #b5dfdd;
  cursor: pointer;
  font-size: 20px;
  text-align: center;
  text-decoration: none;
  text-shadow: none;
  display: inline-block;
}

.btn:hover {
  background: #8aaba9;
}

.invisible {
  visibility: hidden;
}

.error {
    background: #A36A5B !important;
    color: #393B3A !important;
}

.active-status {
  background-color: lightgreen;
}

.full-width {
  width: 100% !important;
}

.width-80 {
  width: 80% !important;
}

.width-50 {
  width: 50% !important; 
}

.full-height {
  height: 100%;
}

.disabled {
  background-color: #939C9E;
  color: #B4BAB9;
}

.darkgreen {
  background: #305E5C;
}

.grey {
  background-color: #939C9E;
}

.turqouise {
  background-color: #b5dfdd;
}

/* Styling for start page */
#app {
  background: #B4BAB9;
  width: 100%;
  display: flex;
  height: 100%;
}

#sidebar {
  width: 20%;
}

#main-content {
  width: 80%;
  height: 100%;
}

</style>
