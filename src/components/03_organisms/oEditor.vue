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
                v-on:open-config-tab="btnConfigClicked"
                :btnClass="saveTdBtn.btnClass"
                :btnLabel="configButton.btnLabel"
                :btnOnClick="configButton.btnOnClick"
                :btnActive="td.length > 0"
            />
            <aButtonBasic
                v-on:save-td="btnSaveTdClicked"
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

export default Vue.extend({
    name: 'oEditor',
    components: {
        aButtonBasic,
    },
    props: {
        id: {
            required: true,
        }
    },
    data() {
        return {
            td: '',
            key: this.$route.path,
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
        this.td = (this as any).getSavedTd(this.$route.params.id);
    },
    beforeDestroy() {
        this.$eventHub.$off('fetched-td');
    },
    computed: {
        ...mapGetters('TdStore', ['getEditorPlaceholder']),
        ...mapGetters('SidebarStore', ['getSidebarElement', 'getSavedTd']),
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
        ...mapActions('TdStore', ['resetInteractions', 'resetSelections', 'resetResults', 'processChangedTd']),
        tdChanged( args: { td: string, tdState?: TdStateEnum | null, errorMsg?: string} ) {
            this.td = '';
            if (args.td) {
                try {
                    this.td = JSON.stringify(JSON.parse(args.td), null, 2);
                } catch {
                    this.td = args.td;
                }
            }
            (this as any).processChangedTd(args);
            (this as any).$emit('td-changed');
            (this as any).resetInteractions();
            (this as any).resetResults();
        },
        btnConfigClicked() {
            this.$emit('open-config');
        },
        btnSaveTdClicked() {
            this.$store.commit('SidebarStore/saveTd', { content: this.td, id: this.$route.params.id });
        }
    },
    watch: {
        '$route.params.id'(id) {
            this.td = (this as any).getSavedTd(this.$route.params.id);
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
