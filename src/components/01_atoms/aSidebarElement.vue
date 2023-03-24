<template>
  <div
    class="sidebar-element-container"
    v-on:click="sidebarElementClicked"
    @mouseover="showOptions = true"
    @mouseleave="showOptions = false"
  >
    <div class="sidebar-element-inner-container" :class="{ 'active': isActive }" :style="styleCss">
      <img v-if="iconSrcPath" class="sidebar-element-icon-type" :src="getIconSrcPath" />
      <label v-if="!isRenameActive"
        class="sidebar-element-label"
        @dblclick= "activateRename"
      >{{ title }}</label>
      <input 
      v-else
      ref="renameInput" 
      type="text"
      v-model.trim="newId"
      :title="showRenameInputError"
      class="sidebar-element-input"
      @blur="sidebarElementRenamed" 
      @keyup.enter="sidebarElementRenamed"
      @input="canRename">
      
      <img
        :style="children && children.length > 0 ? '' : 'visibility: hidden;'"
        class="sidebar-element-icon-dropdown"
        @mouseover="childrenHover = true"
        @mouseleave="childrenHover = false"
        :src="showChildren ? childrenHover ? srcPathDropdownWhite : srcPathDropdown : childrenHover ? srcPathDropdownClosedWhite : srcPathDropdownClosed"
        v-on:click.stop="showChildrenClicked"
      />
      <img
        class="sidebar-element-delete-icon"
        @mouseover="deleteHover = true"
        @mouseleave="deleteHover = false"
        :src="deleteHover ? srcPathDeleteWhite : srcPathDelete"
        v-on:click.stop="deleteBtnClicked"
      />
        <!-- v-on:click.stop="isModalVisible = true" -->
      <div @mouseover="optionsHover = true" @mouseleave="optionsHover = false">
        <aDropdownButton
          :class="{'invisible' : (!canHaveChildren || !showOptions) &&!isDropdownShown}"
          class="dropdown-options"
          :btnSrc="optionsHover ? srcPathOptionsWhite : srcPathOptions"
          :btnKey="sidebarElementDropdown.btnKey"
          :btnDropdownOptions="sidebarElementDropdown.btnDropdownOptions"
          :btnStyle="sidebarElementDropdown.btnStyle"
          :btnIconStyle="sidebarElementDropdown.btnIconStyle"
          v-on:add-new-from-sidebar-element="setShowDropdown"
          v-on:dropdown-clicked="optionDropdownClicked"
        />
      </div>
    </div>
    <div v-if="showRenameInputError" class="sidebar-element-input-popover">
      <p>{{ renameInputErrorMessage }}</p>
    </div>
    <oModal 
      v-if="isModalVisible"
      v-show="isModalVisible"
      v-on:cancel="isModalVisible = false;"
      :modalElement="modalElement"
    />
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import { ElementTypeEnum } from '@/util/enums';
import { mapGetters } from 'vuex';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import oModal from '@/components/03_organisms/oModal.vue';

export default Vue.extend({
  name: 'aSidebarElement',
  components: {
    aDropdownButton,
    oModal
  },
  props: {
    title: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    hasChildren: {
      type: Boolean,
      default: false
    },
    children: {
      type: Array as () => WADE.SidebarElement[],
      required: false,
      default: null
    },
    iconSrcPath: {
      type: String,
      required: false,
      default: ''
    },
    onClick: {
      type: Function,
      required: true
    },
    styleCss: {
      type: String,
      required: false
    },
    showChildren: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      modalElement: {} as WADE.ModalAddElementInterface,
      isModalVisible: false,
      isDropdownShown: false,
      showOptions: false,
      deleteHover: false,
      childrenHover: false,
      optionsHover: false,
      isRenameActive: false,
      newId: this.id,
      renameInputErrorMessage: '',
      showRenameInputError: false,
      srcPathOptions: 'options',
      srcPathOptionsWhite: 'options_white',
      srcPathDropdown: require('@/assets/arrow_down.png'),
      srcPathDropdownClosed: require('@/assets/arrow_right.png'),
      srcPathDropdownWhite: require('@/assets/arrow_down_white.png'),
      srcPathDropdownClosedWhite: require('@/assets/arrow_right_white.png'),
      srcPathDelete: require('@/assets/delete.png'),
      srcPathDeleteWhite: require('@/assets/delete_white.png')
    };
  },
  computed: {
    ...mapGetters('SidebarStore', [
      'isActiveElement',
      'sidebarElementDropdown',
      'doesIdAlreadyExist'
    ]),
    isActive(): any {
      return (this as any).isActiveElement(this.id, this.type);
    },
    getIconSrcPath(): any {
      return require(`@/assets/${this.iconSrcPath}.png`);
    },
    canHaveChildren(): boolean {
      return (
        this.type === ElementTypeEnum.FOLDER ||
        this.type === ElementTypeEnum.MASHUP
      );
    }
  },
  methods: {
    sidebarElementClicked() {
      this.$emit('element-clicked', this.id, this.type);
    },
    sidebarElementRenamed() {
      if (!this.canRename()) {
        this.newId = this.id;
        this.isRenameActive = false;
        this.showRenameInputError = false;
        return;
      }

      this.isRenameActive = false;
      this.$emit('element-renamed', this.id, this.type, this.newId);
    },
    deleteBtnClicked() {
      this.$emit('delete-element', this.id, this.type);
    },
    showChildrenClicked() {
      this.onClick();
    },
    setShowDropdown(isDropdownShown: boolean) {
      this.isDropdownShown = isDropdownShown;
    },
    optionDropdownClicked(element: any) {
      this.isDropdownShown = false;
      element.parentId = this.id;
      this.$emit('dropdown-clicked', element);
    },
    activateRename() {
      this.isRenameActive = true; 
      this.newId = this.id;
      this.$nextTick(() => {
        const renameInputRef = this.$refs.renameInput as HTMLInputElement;
        renameInputRef.focus();
      });      
    },
    canRename(): boolean {

      if (this.newId.length === 0 || this.newId.length > 30) {
        this.renameInputErrorMessage = 'The element\'s name should have at least 5 and maximal 30 characters.';
        this.showRenameInputError = true;
        return false;
      }

      const idExists = (this as any).doesIdAlreadyExist(this.newId);

      if (idExists && this.newId !== this.id) {
        this.renameInputErrorMessage = 'Another element with the same name exists. Please change the name.';
        this.showRenameInputError = true;
      } else {
        this.showRenameInputError = false;
      }
      
      return !idExists;
    },
  }
});
</script>

<style scoped>
.sidebar-element-container {
  position: relative;
  border-bottom: 1px solid #393b3a;
  height: 50px;
  display: flex;
}

.sidebar-element-inner-container {
  width: 100%;
  display: flex;
  align-items: center;
  border-left: 7px solid transparent;
  padding: 5px 5px 5px 0px;
}

.active {
  border-left: 7px solid #b5dfdc;
}

.sidebar-element-container:hover {
  background: #939c9e;
}

.sidebar-element-icon-type {
  padding: 10px;
  height: 40px;
  width: 40px;
}

.sidebar-element-delete-icon:hover {
  -webkit-filter: brightness(3);
  filter: brightness(3);
}
.sidebar-element-label {
  width: 108px;
  overflow: hidden;
  white-space: nowrap;
}
.sidebar-element-input {
  font-size: 16px;
  width: 108px;
  overflow: hidden;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
}

.sidebar-element-input-popover {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1;
  width: 100%;
  padding: 10px;
  color: #393B3A;
  background-color: #A36A5B;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.sidebar-element-icon-dropdown,
.sidebar-element-delete-icon {
  padding: 7px 5px 7px 0px;
  max-height: 30px;
  max-width: 30px;
  object-fit: contain;
}

.dropdown-options {
  border: none;
}
</style>
