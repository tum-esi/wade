<template>
  <div class="sidebar-element-container" v-on:click="sidebarElementClicked" :class="styleCss">
    <div class="sidebar-elment-inner-container" :class="{ 'active': isActive }">
      <img v-if="iconSrcPath" class="sidebar-element-icon-type" :src="getIconSrcPath">
      <label class="sidbar-element-label">{{ title }}</label>
      <img
        v-if="hasTimingPerformance"
        class="sidebar-element-icon-performance"
        :src="srcPathTimingPerf"
      >
      <img 
        v-if="children.length > 0" 
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
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ElementTypeEnum } from '@/util/enums';
import { mapMutations, mapGetters } from 'vuex';

export default Vue.extend({
    name: 'aSidebarElement',
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
    hasTimingPerformance: {
      type: Boolean,
      default: false
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
      childrenAreShown: false,
      deleteHover: false,
      childrenHover: false,
      srcPathTimingPerf: require('@/assets/performance.png'),
      srcPathDropdown: require('@/assets/arrow_down.png'),
      srcPathDropdownClosed: require('@/assets/arrow_right.png'),
      srcPathDropdownWhite: require('@/assets/arrow_down_white.png'),
      srcPathDropdownClosedWhite: require('@/assets/arrow_right_white.png'),
      srcPathDelete: require('@/assets/delete.png'),
      srcPathDeleteWhite: require('@/assets/delete_white.png')
    };
  },
  computed: {
    ...mapGetters('SidebarStore', ['isActiveElement']),
    isActive(): any {
      return (this as any).isActiveElement(this.id, this.type);
    },
    getIconSrcPath(): any {
      return require(`@/assets/${this.iconSrcPath}.png`);
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
  width: 20%;
  padding: 10px;
  max-height: 40px;
  max-width: 40px;
}

.sidebar-element-delete-icon {
  width: 15%;
  padding: 10px;
}

.sidebar-element-delete-icon:hover {
  -webkit-filter: brightness(3);
  filter: brightness(3);
}

.sidbar-element-label {
  width: 65%;
  overflow: hidden;
}

.sidebar-element-icon-dropdown, .sidebar-element-icon-performance{
  width: 15%;
  padding: 10px;
}

.child {
  background: #1234;
}
</style>
