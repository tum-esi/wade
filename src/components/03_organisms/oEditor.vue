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
import { ErrorMessagesEnum, StatusMessagesEnum } from '@/util/enums';

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
        this.$eventHub.$on('fetched-td', this.openAccordingEvent);
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
                this.td = value;
                if (this.td.length > 0) this.processChangedTd( { td: this.td });
            }
        }
    },
    methods: {
        ...mapActions('TdStore', ['resetInteractions', 'resetResults', 'processChangedTd']),
        openAccordingEvent(args) {
            console.log('args: ', args);
            this.td = args;
            this.processChangedTd( { td: this.td });
        },
        checkIfStoredTdAvailable() {
            let storedTd = this.getCurrentTd(this.id);
            this.td = storedTd ? storedTd : this.td;
        }
    },
     watch: {
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
