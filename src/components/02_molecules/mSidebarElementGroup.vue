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
        :iconSrcPath="element.iconSrcPath"
        :onClick="element.onClick"
        :styleCss="element.styleCss"
        v-on:element-clicked="sidebarElementClicked"
        v-on:delete-element="deleteElement"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
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
        this.$eventHub.$on('sidebar-element-removed', (id: string) => {
            this.removeComponent(id);
        });
    },
    beforeDestroy() {
        this.$eventHub.$off('sidebar-element-added');
        this.$eventHub.$off('sidebar-element-removed');
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
    ...mapMutations('SidebarStore', ['deleteSidebarElement']),
    addComponent(elements, parentId) {
        for (let i = 0, l = elements.length; i < l; i++) {
            const current = elements[i];

            // Don't add component when already shown
            if (this.sidebarElements.some(sidebarElement => sidebarElement.id === current.id )) continue;

            // Data for new sidebar element
            const newSidebarElement = {
                parentId,
                title: current.title,
                id: current.id,
                type: current.type,
                hasChildren: current.hasChildren,
                children: current.children,
                iconSrcPath: current.iconSrcPath,
                showChildren: false,
                styleCss: current.numOfParents > 0
                    ? `padding-left:${15 * current.numOfParents}px;
                    background: rgba(0, 0, 0, ${current.numOfParents * 5 * 0.01});`
                    : '',
                onClick: () => {
                    current.showChildren = !current.showChildren;
                    if (current.showChildren && current.hasChildren && current.children.length > 0) {
                        this.addComponent(current.children, current.id);
                    } else if (!current.showChildren && current.hasChildren && current.children.length > 0) {
                        this.hideComponent(current.children);
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
    hideComponent(elements) {
        for (let i = 0, l = elements.length; i < l; i++) {
            const current = elements[i];

            const elIndex = this.sidebarElements.findIndex(el => el.id === current.id);
            if (elIndex !== -1) this.sidebarElements.splice(elIndex, 1);

            // Recursively also remove children
            if (current.hasChildren && current.children.length > 0) {
                this.hideComponent(current.children);
            }
        }
    },

    removeComponent(id) {
        // this.sidebarElements is a one dimensional vs store sidebarElements is nested
        for (const sidebarElement of this.sidebarElements) {
            if (sidebarElement.id === id) {
                // Delete sidebar element
                this.sidebarElements.splice(this.sidebarElements.indexOf(sidebarElement), 1);
                // Recursively check if this sidebarElement had children & delete them too
                if (sidebarElement.children && sidebarElement.children.length > 0) {
                    for (const childElement of sidebarElement.children) {
                        this.removeComponent(childElement.id);
                    }
                }
            }
        }
    },
    sidebarElementClicked(id: string, type: string) {
        this.$emit('element-clicked', id, type);
    },
    deleteElement(id: string, type: string) {
        this.deleteSidebarElement({id, type});
        this.$eventHub.$emit('sidebar-element-removed', id);
    }
  }
});
</script>

<style scoped>

</style>
