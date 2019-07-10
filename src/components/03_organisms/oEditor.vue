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
        this.checkIfStoredTdAvailable();
        this.$eventHub.$on('fetched-td', this.openAccordingEvent);
    },
    beforeDestroy() {
        this.$eventHub.$off('fetched-td');
    },
    computed: {
        ...mapGetters('TdStore', ['getEditorPlaceholder', 'getCurrentJSONTD']),
        ...mapGetters('SidebarStore', ['getCurrentTd']),
        currentTd: {
            get(): string {
                return this.td;
            },
            set(value: string) {
                this.setParsedTd( { } );
                this.resetInteractions();
                this.resetResults();
                this.td = value;
                this.checkTd();
                this.setNewCurrentTd({ id: this.id, td: this.td});
            }
        }
    },
    methods: {
        ...mapActions('TdStore', ['getParsedTd', 'resetInteractions', 'resetResults']),
        ...mapMutations('TdStore', ['setCurrentJSONTD', 'setParsedTd']),
        ...mapMutations('SidebarStore', ['setNewCurrentTd']),
        async checkTd() {
            let parsedTd;
            let statusMessage;

            if (this.td.length <= 0) {
                statusMessage = '...';
            } else {
                try {
                    const jsonTd = JSON.parse(this.td);
                    if (Object.keys(jsonTd).length === 0) {
                        statusMessage = ErrorMessagesEnum.EMPTY_TD;
                        parsedTd = '';
                    } else {
                        this.setCurrentJSONTD(JSON.stringify(jsonTd));
                        statusMessage =  StatusMessagesEnum.TD_READY;
                        // Parses td
                        parsedTd = await this.getParsedTd( { jsonTd } );
                        if (parsedTd.error) {
                            statusMessage = parsedTd.error;
                        }
                    }
                } catch (err) {
                    statusMessage = `${ErrorMessagesEnum.INVALID_JSON_TD} (${err.name}: ${err.message})`;
                }
            }
            this.$emit('td-changed', statusMessage);
        },
        openAccordingEvent(args) {
            this.td = args;
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
    overflow: scroll;
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
