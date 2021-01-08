<template>
    <div class="mashup-container">
        <mTabbar 
        class="border-bottom" 
        :tabbarElements="mashupTabbar"
        v-on:tab-clicked="onTabClicked"
        />
        <div  class="mashup-info border-bottom">
            <label class="mashup-info-title">{{ currentMashup.id }}</label>
            <label v-if="getDescription">: {{ currentMashup.description }}</label>
        </div>
        <div id="active-tab-areas-container" class="flex-container-row">
            <oMashupEditor
                :class="getMashupEditorClass"
                :mashup="currentMashup"
                :mashupChildren="currentMashup.children"
                :availableElements="availableElements"
            />
            <o-ma-ge
                v-if="mashupTabbar[1].tabIsActive"
                :class="getMaGeClass"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions, mapState } from 'vuex';
import { ElementTypeEnum } from '../../util/enums';
import mTabbar from '@/components/02_molecules/mTabbar.vue';
import oMashupEditor from '@/components/03_organisms/oMashupEditor.vue';
import oMaGe from '@/components/03_organisms/oMaGe.vue';
import { Mashup } from '@/backend/Td';

export default Vue.extend({
    name: 'tMashup',
    components: {
        mTabbar,
        oMashupEditor,
        oMaGe
    },
    data() {
      return {
          mashup: null as Mashup | null,
          mashupChildren: [] as any[],
          availableElements: [] as any[],
          event: Object,
      };
    },
    computed: {
        ...mapState('MashupStore', ['currentMashup','numberOfActiveTabs', "mashupTabbar"]),
        ...mapGetters('SidebarStore', ['getMashup', 'getSidebarElement']),
        getTitle(): string {
            if (this.mashup) return this.mashup.title;
            return '';
        },
        getDescription(): null | string {
            return this.mashup && this.mashup.description ? this.mashup.description : null;
        },
        getMashupEditorClass(): string {
            if ((this as any).numberOfActiveTabs === 0) {
                return 'mashup-editor-full';
            } else if ((this as any).numberOfActiveTabs === 1 && (this as any).mashupTabbar[0].tabIsActive) {
                return 'mashup-editor-full'
            } else if ((this as any).numberOfActiveTabs === 1 && !(this as any).mashupTabbar[0].tabIsActive) {
                return 'mashup-editor-minimized'
            } else if ((this as any).numberOfActiveTabs === 2 && (this as any).mashupTabbar[0].tabIsActive ) {
                return 'mashup-editor-half';
            } else if ((this as any).numberOfActiveTabs === 2 && !(this as any).mashupTabbar[0].tabIsActive ) {
                 return 'mashup-editor-minimized';
            }
            return '';
        },
        getMaGeClass(): string {
            if ((this as any).numberOfActiveTabs === 1 && (this as any).mashupTabbar[1].tabIsActive) {
                return 'mage-full'
            } else if ((this as any).numberOfActiveTabs === 2 && (this as any).mashupTabbar[1].tabIsActive ) {
                return 'mage-half';
            }
            return '';
        }
    },
    methods: {
        onTabClicked(event) {
            this.$store.commit('MashupStore/toggleTab', event);
            this.$eventHub.$emit('tab-clicked');
        }
    },
    created() {
        this.$store.commit('SidebarStore/setActiveElement', this.$route.params.id);
        const newMashup = (this as any).getMashup(this.$route.params.id);
        this.$store.commit('MashupStore/setCurrentMashup', newMashup);
        this.mashupChildren = newMashup.children;
        this.availableElements = (this as any).getSidebarElement({ type: ElementTypeEnum.TD });
    },
    watch: {
        // Check if router id changed and change active sidebar element
        '$route.params.id'(id) {
            this.$store.commit('SidebarStore/setActiveElement', id);
            const newMashup = (this as any).getMashup(this.$route.params.id);
            this.$store.commit('MashupStore/setCurrentMashup', newMashup);
            this.mashupChildren = newMashup.children;
        }
    }
});
</script>


<style scoped>
#active-tab-areas-container {
    width: 100%;
    height: 88%;
}

.mashup-editor-full {
    width: 100%;
    height: 100%;
    padding: 1.5%;
}

.mashup-editor-half {
    width: 40%;
    height: 100%;
    padding: 1.5%;
}

.mashup-editor-minimized {
    width: 25%;
    height: 100%;
    padding: 1.5%;
}

.mage-full {
    width: 75%;
    height: 100%;
    padding: 1.5% 1.5% 1.5% 0;
}

.mage-half {
    width: 60%;
    height: 100%;
    padding: 1.5% 1.5% 1.5% 0;
}

.mashup-info {
    padding: 7px;
}

.mashup-info-title {
    font-weight: bold;
}

.flex-container-row{
    display: flex;
    flex-flow: row wrap;
}
</style>
