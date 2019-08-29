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
                :btnClass="hasMqtt ? configMqttButton.btnClass : configButton.btnClass"
                :btnLabel="configButton.btnLabel"
                :btnOnClick="configButton.btnOnClick"
                :btnActive="td.length > 0"
            />
            <aButtonBasic
                v-if="hasMqtt"
                v-on:open-config-tab="btnConfigClicked"
                :btnClass="configMqttButton.btnClass"
                :btnLabel="configMqttButton.btnLabel"
                :btnOnClick="configMqttButton.btnOnClick"
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
            hasMqtt: true,
            configButton: {
                btnLabel: 'Change Configuration',
                btnClass: 'btn-config-big',
                btnOnClick: 'open-config-tab'
            },
            configMqttButton: {
                btnLabel: 'Change Mqtt Configuration',
                btnClass: 'btn-config-small',
                btnOnClick: 'open-config-tab'
            },
        };
    },
    created() {
        this.$eventHub.$on('fetched-td', this.tdChanged);
    },
    mounted() {
        // TODO: checkIfStoredTdAvailable
    },
    beforeDestroy() {
        this.$eventHub.$off('fetched-td');
    },
    computed: {
        ...mapGetters('TdStore', ['getEditorPlaceholder']),
        ...mapGetters('SidebarStore', ['getSidebarElement']),
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
        checkIfStoredTdAvailable(args? ) {
            // TODO: this does currently not work
            const storedTd = (this as any).getSidebarElement(this.id);
            this.td = storedTd ? storedTd : this.td;
        },
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
        }
    },
    watch: {
        '$route.params.id'(id) {
            this.checkIfStoredTdAvailable();
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
    /* overflow: auto; */
}

.editor-area textarea{
    width: 100%;
    height: 100%;
    resize: none;
    padding: 7px;
    font-family: 'Courier New', Courier, monospace;
    color: #000;
}

/* TODO: does not work */
.editor-area textarea::placeholder{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.config-btns {
    height: 10%;
    padding-top: 7px;
    display: flex;
    justify-content: space-between;
}
</style>
