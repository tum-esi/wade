<template>
  <div class="sidebar-elementgroup-container">
    <aSidebarElement 
        v-for="(element, index) in sidebarElements"
        :key="index"
        :title="element.title"
        :id="element.id"
        :type="element.type"
        :hasChildren="element.hasChildren"
        :children="element.children"
        :hasTimingPerformance="element.hasTimingPerformance"
        :iconSrcPath="element.iconSrcPath"
        :onClick="element.onClick"
        v-on:element-clicked="sidebarElementClicked"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import aSidebarElement from '@/components/01_atoms/aSidebarElement.vue';

export default Vue.extend({
    name: 'mSidebarElementGroup',
    components: {
        aSidebarElement
    },
    created() {
        // Check if new element was added to store and renew list
        this.$eventHub.$on('sidebar-element-added', () => {
            this.addComponent(this.getSidebarElements, 'parent');
        });
    },
    beforeDestroy() {
        this.$eventHub.$off('sidebar-element-added');
    },
    mounted() {
        const parentElement = { id: 'parent' };
        this.addComponent(this.getSidebarElements, parent);
    },
  computed: {
    ...mapGetters('SidebarStore', ['getSidebarElements'])
  },
  data() {
      return{
          sidebarElements: [] as any[]
      };
  },
  methods: {
    addComponent(elements, parentId) {
        for (let i = 0, l = elements.length; i < l; i++) {
            const current = elements[i];

            // Don't add component when already shown
            if (this.sidebarElements.some(sidebarElement => sidebarElement.id === current.id )) continue;

            // Data for new sidebar element
            const newSidebarElement = {
                title: current.title,
                id: current.id,
                type: current.type,
                hasChildren: current.hasChildren,
                children: current.children,
                hasTimingPerformance: current.hasTimingPerformance,
                iconSrcPath: current.iconSrcPath,
                showChildren: false,
                onClick: () => {
                    current.showChildren = !current.showChildren;
                    if (current.showChildren && current.hasChildren && current.children.length > 0) {
                        this.addComponent(current.children, current.id);
                    } else if (!current.showChildren && current.hasChildren && current.children.length > 0) {
                        this.removeComponent(current.children);
                    }
                }
            };

            // Add new sidebar element below parent element
            const parentIndex = this.sidebarElements.findIndex(el => el.id === parentId);
            if (parentIndex !== -1) {
                this.sidebarElements.splice(parentIndex + 1, 0, newSidebarElement);
            } else {
                this.sidebarElements.push(newSidebarElement);
            }
        }
    },
    removeComponent(elements) {
        for (let i = 0, l = elements.length; i < l; i++) {
            const current = elements[i];

            const elIndex = this.sidebarElements.findIndex(el => el.id === current.id);
            if (elIndex !== -1) this.sidebarElements.splice(elIndex, 1);

            // Recursively also remove children
            if (current.hasChildren && current.children.length > 0) {
                this.removeComponent(current.children);
            }
        }
    },
    sidebarElementClicked(id: string, type: string) {
      this.$emit('element-clicked', id, type);
    }
  }
});
</script>

<style scoped>

</style>
