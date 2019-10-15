<template>
    <div class="vthing-container">

        <div class="vthing-header">
            <title>Start a Virtual thing within W-ADE</title>
        </div>

        <div class="show-vthing">
                <!-- <aConfigStatusBar class="vconfig-status" :statusMessage="vconfigStatus"></aConfigStatusBar> -->
            <!-- <div v-if="format === 'raw'" class="vconfig-area">
                <textarea spellcheck="false" wrap="off" v-model="currentVirtualConfig"></textarea>
            </div> -->
        </div>

        <div class="vthing-btns">
            <aButtonBasic
                v-on:create-vt="createVirtualThingBtnClicked"
                :btnClass="createVtBtn.btnClass"
                :btnLabel="createVtBtn.btnLabel"
                :btnOnClick="createVtBtn.btnOnClick"
                :btnActive="true"
            />
        </div>
        <div class="vthing-output">
            <aVirtualThingStatusbar :
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import { TdVirtualConfigEnum } from '@/util/enums';
import { getFormattedJsonString } from '@/util/helpers';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aOutputBar from '@/components/01_atoms/aOutputBar.vue';
import aVirtualThingStatusbar from '@/components/01_atoms/aVirtualThingStatusbar.vue';
import { setTimeout } from 'timers';

export default Vue.extend({
    name: 'oVirtualThing',
        components: {
        aButtonBasic,
        aOutputBar,
        aVirtualThingStatusbar
    },
    created() {
        // this.vconfig = getFormattedJsonString((this as any).getVirtualConfig(this.id));
    },
    data() {
        return {
            vconfig: '',
            vconfigStatus: TdVirtualConfigEnum.INFO as TdVirtualConfigEnum,
            format: 'raw',
            showHelp: false,
            createVtBtn: {
                btnLabel: 'Create a virtual thing',
                btnClass: 'btn-config-small',
                btnOnClick: 'create-vt'
            }
        };
    },
    computed: {
        ...mapGetters('SidebarStore', ['getVirtualConfig', 'getDefaultVirtualConfig']),
        ...mapGetters('TdStore', ['getProtocols']),
        id() {
            return this.$route.params.id;
        },
        currentVirtualConfig: {
            get(): string {
                return this.vconfig;
            },
            async set(value: string) {
                this.vconfig = value;
                // Check if there are unsaved changes
                this.saveVConfigBtn.btnActive = !((this as any).getSavedVirtualConfig() === this.vconfig);
                // Check if config has JSON format
                try {
                    JSON.parse(this.vconfig);
                    this.vconfigStatus = this.saveVConfigBtn.btnActive
                    ? TdVirtualConfigEnum.UNSAVED
                    : TdVirtualConfigEnum.INFO;
                } catch (error) {
                    this.saveVConfigBtn.btnActive = false;
                    this.vconfigStatus = TdVirtualConfigEnum.ERROR;
                }
            }
        },
    },
    methods: {
        ...mapMutations('SidebarStore', ['saveTdVirtualConfig']),
        getSavedVirtualConfig(isDefault: boolean = false): string {
            return getFormattedJsonString( isDefault
                ? (this as any).getDefaultVirtualConfig
                : (this as any).getVirtualConfig(this.id)
            );
        },
        // showHelpClicked() {
        //     this.showHelp = !this.showHelp;
        // },
        resetVirtualConfigBtnClicked() {
            this.vconfig = this.getSavedVirtualConfig(true);
            // If default config differs from saved config, it needs to be saved
            if ((this as any).getSavedVirtualConfig() !== this.vconfig) {
                this.vconfigStatus = TdVirtualConfigEnum.UNSAVED;
                this.saveVConfigBtn.btnActive = true;
            } else {
                this.vconfigStatus = TdVirtualConfigEnum.INFO;
                this.saveVConfigBtn.btnActive = false;
            }
        },
        createVirtualThingBtnClicked() {
            (this as any).saveTdVirtualConfig({ id: this.id, vconfig: JSON.parse(this.vconfig) });
            this.vconfigStatus = TdVirtualConfigEnum.SAVE_SUCCESS;
            this.saveVConfigBtn.btnActive = false;
            setTimeout(() => { this.vconfigStatus = TdVirtualConfigEnum.INFO; }, 1500);
        }
    },
    watch: {
        // Check if router id changed
        '$route.params.id'(id) {
            this.vconfig = this.getSavedVirtualConfig();
        }
    }
});
</script>


<style scoped>
.format-option {
    padding-left: 7px;
}

.format-option label {
    font-size: 14px !important;
    padding-left: 7px;
}

.vconfig-container {
    height: 100%;
    width: 50%;
    display: flex;
    padding: 0px 12px 10px 12px;
}

.change-vconfig-area {
    width: 100%;
    height: 100%;
}


.vconfig-header {
    display: flex;
    justify-content: space-between;
}

.vconfig-title {
    padding: 7px 0px 7px 2px;
    max-height: 8%;
    min-height: 50px;
    display: flex;
    align-items: center;
}

.vconfig-status {
    height: 7%;
}

.vconfig-header label {
    font-size: 16px;
    padding-right: 7px;
}

.vconfig-area {
    width: 100%;
    height: 73%;
    max-height: 800px;
}

.vconfig-area textarea{
    width: 100%;
    height: 100%;
    resize: none;
    padding: 7px;
    font-family: 'Courier New', Courier, monospace;
    color: #000;
    border: 1px solid #393B3A;
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
}

.vconfig-area-form-container {
    width: 100%;
    height: 100%;
    border: 1px solid #393B3A;
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
    padding: 7px;
}

.vconfig-area-form-container p {
    font-size: 12px;
}

.vconfig-btns {
    height: 10%;
    padding-top: 7px;
    display: flex;
    justify-content: space-between;
}
</style>
