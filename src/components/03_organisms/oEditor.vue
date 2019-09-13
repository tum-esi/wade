<template>
    <div class="editor-container"> 
        <div class="editor-title">
            <label>Thing Description</label>
        </div>
        <div class="editor-area">
            <textarea :placeholder="getEditorPlaceholder" spellcheck="false" wrap="off" v-model="currentTd"></textarea>
        </div>
        <div class="config-btns">
            <aButtonBasic
                v-on:open-config-tab="$emit('open-config')"
                :btnClass="saveTdBtn.btnClass"
                :btnLabel="configButton.btnLabel"
                :btnOnClick="configButton.btnOnClick"
                :btnActive="td.length > 0"
            />
            <aButtonBasic
                v-on:save-td="$store.commit('SidebarStore/saveTd', { content: td, id })"
                :btnClass="saveTdBtn.btnClass"
                :btnLabel="saveTdBtn.btnLabel"
                :btnOnClick="saveTdBtn.btnOnClick"
                :btnActive="td.length > 0"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { TdStateEnum } from '@/util/enums';
import { getFormattedJsonString } from '@/util/helpers';

export default Vue.extend({
    name: 'oEditor',
    components: {
        aButtonBasic,
    },
    data() {
        return {
            td: '',
            configButton: {
                btnLabel: 'Change Configuration',
                btnClass: 'btn-config-big',
                btnOnClick: 'open-config-tab'
            },
            saveTdBtn: {
                btnLabel: 'Save',
                btnClass: 'btn-config-small',
                btnOnClick: 'save-td'
            },
        };
    },
    created() {
        this.$eventHub.$on('fetched-td', this.tdChanged);
        this.tdChanged({ td: (this as any).getSavedTd(this.id)});
    },
    beforeDestroy() {
        this.$eventHub.$off('fetched-td');
    },
    computed: {
        ...mapGetters('TdStore', ['getEditorPlaceholder']),
        ...mapGetters('SidebarStore', ['getSavedTd', 'getConfig']),
        id() {
            return (this as any).$route.params.id;
        },
        currentTd: {
            get(): string {
                return this.td;
            },
            async set(value: string) {
                this.tdChanged({ td: value});
            }
        }
    },
    methods: {
        ...mapActions('TdStore',
            ['resetInteractions', 'resetSelections', 'resetResults', 'processChangedTd', 'setProtocols']),
        // Executed when td changd: via loading saved td/ fetching td/ user changed td
        tdChanged( args: { td: string, tdState?: TdStateEnum | null, errorMsg?: string} ) {
            this.td = '';
            if (args.td) {
                try {
                    this.td = getFormattedJsonString(args.td);
                } catch {
                    this.td = args.td;
                }
            }
            this.processChangedTd({ td: args.td, config: JSON.parse(this.getConfig(this.id)) });

            // Hide url bar if td changed
            this.$emit('hide-url-bar');

            // Reset result fields and interaction fields
            this.resetInteractions();
            this.resetResults();

            // Update possible protocol list
            this.setProtocols({td: args.td});
        }
    },
    watch: {
        '$route.params.id'(id) {
            this.tdChanged({ td: this.getSavedTd(this.id)});
        }
    },
});
</script>

<style scoped>
.editor-container {
    height: 100%;
}

.editor-title {
    padding: 7px 0px 7px 2px;
    max-height: 8%;
    min-height: 50px;
    display: flex;
    align-items: center;
}

.editor-title label {
    font-size: 14px;
}

.editor-area {
    width: 100%;
    height: 80%;
    max-height: 800px;
}

.editor-area textarea{
    width: 100%;
    height: 100%;
    resize: none;
    padding: 7px;
    font-family: 'Courier New', Courier, monospace;
    color: #000;
}

.config-btns {
    height: 10%;
    padding-top: 7px;
    display: flex;
    justify-content: space-between;
}
</style>
