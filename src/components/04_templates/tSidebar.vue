<template>
  <div 
    ref="sidebar"
    :class="getSidebarStyle"
    :style="{ width: `${width}px` }"
    @mouseover="showCollapseBtn = true"
    @mouseleave="showCollapseBtn = false"
  >
    <div class="sidebar-left">
      <aTabHeader 
      class="sidebar-header shadow"
      :class="getHeaderStyle"
      :isSidebarVisible="isSidebarVisible"
      :showCollapseBtn="showCollapseBtn"
      v-on:clicked="toggleSidebar"
      v-on:tab-clicked="homeClicked"
      v-on:tab-label-clicked="homeClicked"
      v-on:tab-btn-clicked="toggleSidebar"
      />
      <div :class="isSidebarVisible ? 'sidebar-content' : 'sidebar-content invisible'">
        <div class="add-element-container">
          <!-- <aSearchbar class="searchbar" /> -->
          <label> Add Element </label>
          <aDropdownButton
            class="dropdown-btn"
            :btnKey="getAddNewButton.btnKey"
            :btnSrc="getAddNewButton.btnSrc"
            :btnDropdownOptions="getAddNewButton.btnDropdownOptions"
            v-on:dropdown-clicked="openModuleAddElement"
          />
        </div>
        <div class="sidebar-elements-container">
          <mSidebarElementGroup
            v-on:element-clicked="sidebarElementClicked"
          v-on:element-renamed="sidebarElementRenamed"
            v-on:dropdown-clicked="openModuleAddElement"
          />
        </div>
      </div>
    </div>

    <div :class="getResizeBarStyle" @mousedown="startResize"></div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import aTabHeader from '@/components/01_atoms/aTabHeader.vue';
import aSearchbar from '@/components/01_atoms/aSearchbar.vue';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import mSidebarElementGroup from '@/components/02_molecules/mSidebarElementGroup.vue';
import { loggingError } from '../../util/helpers';

export default Vue.extend({
  name: 'tSidebar',
  components: {
    aTabHeader,
    aSearchbar,
    aDropdownButton,
    mSidebarElementGroup
  },
  data() {
    return {
      showCollapseBtn: false,
      isSidebarVisible: true,
      startX: 0,
      startWidth: 0,
      width: 200,
      left: 0,
    };
  },
  computed: {
    ...mapGetters('SidebarStore', [
      'getHeaderTab',
      'getAddNewButton',
      'getSidebarElements',
      'getSidebarActive'
    ]),
    getSidebarStyle() {
      return (this as any).$route.params.id === undefined && !(this as any).getSidebarActive ? 'sidebar full-width' : (this as any).getSidebarActive ? 'sidebar sidebar-visible' : 'sidebar';
    },
    getHeaderStyle() {
      return (this as any).$route.params.id === undefined && !(this as any).getSidebarActive ? '' : (this as any).getSidebarActive ? '' : 'border-right';
    },
    getResizeBarStyle() {
      return (this as any).$route.params.id === undefined && !(this as any).getSidebarActive ? '' : (this as any).getSidebarActive ? "resizebar-full-height" : "resizebar-header-height";
    }
  },
  methods: {
    ...mapMutations('SidebarStore', ['setSidebarActiveStatus']),
    homeClicked() {
      this.$emit('home-clicked');
    },
    toggleSidebar() {
      (this as any).isSidebarVisible = !(this as any).isSidebarVisible;
      (this as any).setSidebarActiveStatus((this as any).isSidebarVisible);
    },
    sidebarElementClicked(elementId: string, elementType: string) {
      this.$emit('sidebar-element-clicked', elementId, elementType);
    },
    sidebarElementRenamed(elementId: string, elementType: string, newElementId: string) {
      this.$emit('sidebar-element-renamed', elementId, elementType, newElementId);
    },
    openModuleAddElement(element: any) {
      this.$emit('open-module-element', element);
    },
    dropDownReaction(eventObject) {
            if (eventObject.btnKey === 'btn-plugin-clicked') {
              if (eventObject.btnValue === 'open-mage') {
                this.$emit('mage-clicked');
              } else {
                loggingError(new Error('unknown plugin in dropdown'));
              }
            } else {
                // event not relevant for this function
            }
    },
    startResize(event: MouseEvent) {
      event.preventDefault();
      (this as any).startX = event.pageX;
      (this as any).startWidth = (this as any).width;
      document.addEventListener('mousemove', (this as any).resize);
      document.addEventListener('mouseup', (this as any).stopResize);
    },
    resize(event: MouseEvent) {
      const deltaX = event.pageX - (this as any).startX;
      (this as any).width = (this as any).startWidth + deltaX;
      if ((this as any).width > window.innerWidth) {
        (this as any).width = window.innerWidth;
      }
    },
    stopResize() {
      document.removeEventListener('mousemove', (this as any).resize);
      document.removeEventListener('mouseup', (this as any).stopResize);
    },
  }
});
</script>

<style scoped>
.sidebar {
  display: flex;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  min-width: 15%;
  overflow: auto;
}

.sidebar-left {
  position: relative;
  width: calc(100% - 3px);
}

.sidebar-header {
  align-self: left;
  height: 7%;
  padding: 7px;
  background: #b5dfdd;
}

.sidebar-header:hover {
  background: #92afae !important;
}

.sidebar-content {
  align-self: left;
  height: 93%;
  overflow: scroll;
}

/* Contains searchbar and add-dropdown-btn */
.add-element-container {
  display: flex;
  justify-content: space-between;
  padding: 7px;
  height: 50px;
  border-bottom: 1px solid #393b3a;
  align-items: center;
}

.add-element-container label {
  padding-left: 15px;
  border-right: solid 15px rgba(0, 0, 0, 0);
  white-space: nowrap;
  overflow: hidden;
  width: 80%;
}

/* Searchbar Input field with icon */
.searchbar {
  width: 77%;
}

/* "Add-dropdown" btn */
.dropdown-btn {
  width: 20%;
}
.shadow {
  box-shadow: 0 6px 5px 0 rgba(0, 0, 0, 0.19) !important;
}

[class^="resizebar"] {
  position: relative;
  top: 0;
  right: 0;
  bottom: 0;
  width: 3px;
  float: right;
  cursor: ew-resize;
  background-color: #393b3a;
}

.resizebar-header-height {
  height: 7%;
}
.resizebar-full-height {
  height: 100%;
}
</style>

