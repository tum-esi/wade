<template>
    <div class="editor-container"> 
        <div class="editor-title">
            <label>Thing Description</label>
        </div>
        <div class="editor-area">
            <textarea :placeholder="getEditorPlaceholder" spellcheck="false" v-model="currentTd"></textarea>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { ErrorMessagesEnum, StatusMessagesEnum, TdStateEnum } from '@/util/enums';

export default Vue.extend({
    name: 'oEditor',
    props: {
        id: {
            required: true,
        }
    },
    data() {
        return {
            td: '',
            key: this.$route.path
        };
    },
    created() {
        this.$eventHub.$on('fetched-td', this.tdChanged);
    },
    beforeDestroy() {
        this.$eventHub.$off('fetched-td');
    },
    computed: {
        ...mapGetters('TdStore', ['getEditorPlaceholder']),
        ...mapGetters('SidebarStore', ['getCurrentTd']),
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
        ...mapActions('TdStore', ['resetInteractions', 'resetResults', 'processChangedTd']),
        checkIfStoredTdAvailable(args? ) {
            // TODO: this does currently not work
            let storedTd = this.getCurrentTd(this.id);
            this.td = storedTd ? storedTd : this.td;
        },
        tdChanged( args: { td: string, tdState?: TdStateEnum | null, errorMsg?: string} ) {
            this.td = args.td ? args.td : '';
            this.processChangedTd( { td: this.td });
            this.$emit('td-changed');
            this.resetInteractions();
            this.resetResults();
        }
    },
     watch: {
         // TODO: check how to find specific td from store and reload component
        '$route.params.id': function (id) {
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
    height: 92%;
    max-height: 800px;
    overflow: auto;
}

.editor-area textarea{
    width: 100%;
    height: 96%;
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
</style>
