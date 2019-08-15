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
      :showChildren="element.showChildren"
      v-on:element-clicked="sidebarElementClicked"
      v-on:delete-element="deleteElement"
      v-on:dropdown-clicked="optionDropdownClicked"
    />
  </div>
</template>

<script lang='ts'>
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
    this.$eventHub.$on('sidebar-element-added', (parentId: string) => {
      this.addComponent(this.getSidebarElements, parentId, true);
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
    this.addComponent(this.getSidebarElements, 'parent', false);
  },
  computed: {
    ...mapGetters('SidebarStore', ['getSidebarElements'])
  },
  data() {
    return {
      sidebarElements: [] as any[]
    };
  },
  methods: {
    ...mapMutations('SidebarStore', ['deleteSidebarElement']),
    addComponent(
      elements: WADE.SidebarElement[],
      parentId: string,
      isNewElement: boolean
    ) {
      for (let i = 0, lI = elements.length; i < lI; i++) {
        const current = elements[i];
        const uiElementAlreadyExists = this.sidebarElements.find(el => {
          if (el.id === current.id) return el;
        });

        // If a new element was added as a child it needs to be shown
        if (isNewElement && uiElementAlreadyExists) {
          for (let y = 0, lY = this.sidebarElements.length; y < lY; y++) {
            if (
              parentId !== 'parent' &&
              parentId === this.sidebarElements[y].id
            ) {
              // Parent sidebar element should show children
              this.sidebarElements[y].showChildren = true; // parentElement
              const currentSidebarElement = this.sidebarElements.find(el => {
                if (el.id === current.id) return el;
              });
              current.showChildren = true;
              if (
                current.showChildren &&
                current.hasChildren &&
                current.children &&
                current.children.length > 0
              ) {
                this.addComponent(current.children, current.id, true);
              }
            }
          }
        }

        // Don't add component to UI when already shown
        if (uiElementAlreadyExists) continue;

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
          styleCss:
            current.numOfParents > 0
              ? `padding-left:${15 * current.numOfParents}px;
                    background: rgba(0, 0, 0, ${current.numOfParents *
                      5 *
                      0.01});`
              : '',
          onClick: () => {
            const sidebarEl = this.sidebarElements.find(el => {
              if (el.id === current.id) return el;
            });
            sidebarEl.showChildren = !sidebarEl.showChildren;

            current.showChildren = !current.showChildren;
            if (
              current.showChildren &&
              current.hasChildren &&
              current.children &&
              current.children.length > 0
            ) {
              this.addComponent(current.children, current.id, false);
            } else if (
              !current.showChildren &&
              current.hasChildren &&
              current.children &&
              current.children.length > 0
            ) {
              this.hideComponent(current.children);
            }
          }
        };

        // Add new sidebar element below parent element
        const parentIndex = this.sidebarElements.findIndex(
          el => el.id === parentId
        );
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
        current.showChildren = false;

        const elIndex = this.sidebarElements.findIndex(
          el => el.id === current.id
        );
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
          this.sidebarElements.splice(
            this.sidebarElements.indexOf(sidebarElement),
            1
          );
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
      this.deleteSidebarElement({ id, type });
      this.$eventHub.$emit('sidebar-element-removed', id);
      this.$router.push({name: 'home'});
    },
    optionDropdownClicked(element: any) {
      this.$emit('dropdown-clicked', element);
    }
  }
});
</script>

<style scoped>
</style>
