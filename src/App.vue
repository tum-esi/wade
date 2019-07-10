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

export default Vue.extend({
  name: 'App',
  components: {
    tSidebar,
    oModal
  },
  data() {
    return {
      modalElement: {},
      isModalVisible: false,
    };
  },
  created() {
    this.$eventHub.$on('open-modal-element', this.openModal);
  },
  beforeDestroy() {
    this.$eventHub.$off('open-modal-element');
  },
  computed: {
    ...mapGetters('ModalStore', ['getElementTd', 'getElementMashup', 'getElementFolder']),
  },
  methods: {
    ...mapActions('SidebarStore', ['addNewElement']),
    ...mapMutations('SidebarStore', ['addSidebarElement']),
    openModal(element: any) {
      switch (element.btnValue) {
        case ElementTypeEnum.FOLDER:
          this.modalElement = this.getElementFolder;
          break;
        case ElementTypeEnum.MASHUP:
          this.modalElement = this.getElementMashup;
          break;
        case ElementTypeEnum.TD:
          this.modalElement = this.getElementTd;
          break;
        default:
          this.modalElement = this.getElementTd;
      }
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    async createNewElement(newElement: any) {
      this.isModalVisible = false;

      const newEl = {
        type: newElement.type,
        title: newElement.data[0].value,
        description: newElement.data.length > 1 ? newElement.data[1].value : null,
        id: newElement.data[0].value
      };
      const newSidebarEl = await this.addNewElement(newEl);
      this.addSidebarElement(newSidebarEl);
      // HERE: add to sidebar
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
    },
    homeClicked() {
      this.$router.push({
        name: 'home'
      });
    },
    sidebarElementClicked(elementId: string, elementType: string) {
      switch (elementType) {
        case ElementTypeEnum.TD:
          this.$router.push({
            name: 'thingDescription',
            params: { id: elementId }
          });
          break;
        case ElementTypeEnum.MASHUP:
          this.$router.push({
            name: 'mashup',
            params: { id: elementId }
          });
          break;
        case ElementTypeEnum.FOLDER:
          this.$router.push({
            name: 'folder',
            params: { id: elementId }
          });
          break;
      }
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
  Dark Grey: #393B3A;
*/

/* General styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}

body {
  width: 100%;
  padding: 10px;
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

/* Styling for start page */
#app {
  background: #B4BAB9;
  border: 1px solid #393B3A;
  border-radius: 3px;
  width: 100%;
  display: flex;
  min-height: 600px;
}

#sidebar {
  width: 20%;
}

#main-content {
  width: 80%;
}

</style>
