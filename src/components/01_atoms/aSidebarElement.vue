<template>
  <div class="sidebar-element-container" 
      v-on:click="sidebarElementClicked"
      @mouseover="showOptions = true" 
      @mouseleave="showOptions = false">
    <div class="sidebar-elment-inner-container" :class="{ 'active': isActive }" :style="styleCss">
      <img v-if="iconSrcPath" class="sidebar-element-icon-type" :src="getIconSrcPath">
      <label class="sidbar-element-label">{{ title }}</label>
      <img 
        :style="children && children.length > 0 ? '' : 'visibility: hidden;'"
        class="sidebar-element-icon-dropdown" 
        @mouseover="childrenHover = true" 
        @mouseleave="childrenHover = false"
        :src="childrenAreShown ? childrenHover ? srcPathDropdownWhite : srcPathDropdown : childrenHover ? srcPathDropdownClosedWhite : srcPathDropdownClosed"
        v-on:click.stop="showChildrenClicked"
      >
      <img class="sidebar-element-delete-icon" 
        @mouseover="deleteHover = true" 
        @mouseleave="deleteHover = false"
        :src="deleteHover ? srcPathDeleteWhite : srcPathDelete" v-on:click.stop="deleteBtnClicked"
      >
      <div
        @mouseover="optionsHover = true"
        @mouseleave="optionsHover = false"
      >
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ElementTypeEnum } from '@/util/enums';
import { mapMutations, mapGetters } from 'vuex';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';

export default Vue.extend({
    name: 'aSidebarElement',
    components: {
      aDropdownButton
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
    }
  },
  data() {
    return{
      isDropdownShown: false,
      showOptions: false,
      childrenAreShown: false,
      deleteHover: false,
      childrenHover: false,
      optionsHover: false,
      srcPathOptions: 'options',
      srcPathOptionsWhite: 'options_white',
      srcPathDropdown: require('@/assets/arrow_down.png'),
      srcPathDropdownClosed: require('@/assets/arrow_right.png'),
      srcPathDropdownWhite: require('@/assets/arrow_down_white.png'),
      srcPathDropdownClosedWhite: require('@/assets/arrow_right_white.png'),
      srcPathDelete: require('@/assets/delete.png'),
      srcPathDeleteWhite: require('@/assets/delete_white.png'),
    };
  },
  computed: {
    ...mapGetters('SidebarStore', ['isActiveElement', 'sidebarElementDropdown']),
    isActive(): any {
      return (this as any).isActiveElement(this.id, this.type);
    },
    getIconSrcPath(): any {
      return require(`@/assets/${this.iconSrcPath}.png`);
    },
    canHaveChildren(): boolean {
      return this.type === ElementTypeEnum.FOLDER || this.type === ElementTypeEnum.MASHUP;
    }
  },
  methods: {
    sidebarElementClicked() {
      this.$emit('element-clicked', this.id, this.type);
    },
    deleteBtnClicked() {
      this.$emit('delete-element', this.id, this.type);
    },
    showChildrenClicked() {
      this.childrenAreShown = !this.childrenAreShown;
      this.onClick();
    },
    setShowDropdown(isDropdownShown: boolean) {
      this.isDropdownShown = isDropdownShown;
    },
    optionDropdownClicked(element: any) {
      this.isDropdownShown = false;
      element.parentId = this.id;
      this.$emit('dropdown-clicked', element);
    }
  }
});
</script>

<style scoped>
.sidebar-element-container {
  border-bottom: 1px solid #393B3A;
  height: 50px;
  display: flex;
}

.sidebar-elment-inner-container {
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
  background: #939C9E;
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

.sidbar-element-label {
  width: 65%;
  overflow: hidden;
}

.sidebar-element-icon-dropdown, .sidebar-element-delete-icon{
    padding: 7px 5px 7px 0px;
    max-height: 30px;
    max-width: 30px;
    object-fit: contain;

}

.dropdown-options {
  border: none; 
}
</style>
