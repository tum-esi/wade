<template>
    <div class="mashup-container">
        <mTabbar :tabbarElements="getMashupTabbar" />
        <div  class="mashup-info border-bottom">
            <label class="mashup-info-title">{{ getTitle }}</label>
            <label v-if="getDescription">: {{ getDescription }}</label>
        </div>
        <oMashupEditor 
            :mashup="mashup"
            :mashupTds="mashupTds"
            :tds="tds"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import { ElementTypeEnum } from '../../util/enums';
import mTabbar from '@/components/02_molecules/mTabbar.vue';
import oMashupEditor from '@/components/03_organisms/oMashupEditor.vue';

export default Vue.extend({
    name: 'tMashup',
    components: {
        mTabbar,
        oMashupEditor
    },
    data() {
      return {
          mashup: null as null | any,
          mashupTds: [] as any[],
          tds: [] as any[]
      };
    },
    created() {
        this.$store.commit('SidebarStore/setActiveElement', this.$route.params.id);
        this.mashup = (this as any).getSidebarElement({ id: this.$route.params.id });
        this.mashupTds = this.mashup.children;
        this.tds = (this as any).getSidebarElement({ type: ElementTypeEnum.TD });
    },
    computed: {
        ...mapGetters('MashupStore', ['getMashupTabbar']),
        ...mapGetters('SidebarStore', ['getSidebarElement']),
        getTitle(): string {
            return this.mashup.title;
        },
        getDescription(): null | string {
            return this.mashup && this.mashup.description ? this.mashup.description : null;
        }
    },
    watch: {
        // Check if router id changed and change active sidebar element
        '$route.params.id'(id) {
            this.$store.commit('SidebarStore/setActiveElement', id);
        }
    }
});
</script>


<style scoped>
.mashup-info {
    padding: 7px;
}

.mashup-info-title {
    font-weight: bold;
}
</style>
