<template>
    <div class="vconfig-container border-right">
        <div class="change-vconfig-area">
            <div class="vconfig-header">
                <div class="vconfig-title">
                    <label>Virtual Thing Configuration</label>
                    <!-- Hide format "raw"/"form-field" option
                    <div class="format-option">
                        <input type="radio" name="format" id="raw" value="raw" v-model="format"/>
                        <label for="raw">Raw</label>
                    </div>
                    <div class="format-option">
                        <input type="radio" name="format" id="form-fields" value="form-fields" v-model="format"/>
                        <label for="form-fields">Form-Fields</label>
                    </div>
                    -->
                </div>
                <!-- Hide "Show Config Format Help" Button
                <aButtonBasic
                    v-on:show-help="showHelpClicked"
                    :btnClass="showHelp ? showHelpBtn.btnClassHide : showHelpBtn.btnClassShow"
                    :btnLabel="showHelp  ? showHelpBtn.btnLabelHide : showHelpBtn.btnLabelShow"
                    :btnOnClick="showHelpBtn.btnOnClick"

                />
                -->
            </div>
            <div class="show-vconfig">
                <aConfigStatusBar class="vconfig-status" :statusMessage="vconfigStatus"></aConfigStatusBar>
                <div v-if="format === 'raw'" class="vconfig-area">
                    <textarea spellcheck="false" wrap="off" v-model="currentVirtualConfig"></textarea>
                </div>
                <!-- Hide form fields
                <div v-else class="config-area">
                    <div class="config-area-form-container">
                        <p>Hint: Only usable with default config.</p>
                        !-- TODO: mFormConfigOptions --
                    </div>
                </div> -->
                <div class="vconfig-btns">
                    <aButtonBasic
                        v-on:reset-config="resetVirtualConfigBtnClicked"
                        :btnClass="resetVConfigBtn.btnClass"
                        :btnLabel="resetVConfigBtn.btnLabel"
                        :btnOnClick="resetVConfigBtn.btnOnClick"
                        :btnActive="true"
                    />
                    <aButtonBasic
                        v-on:save-config="btnSaveVirtualConfigClicked"
                        :btnClass="saveVConfigBtn.btnClass"
                        :btnLabel="saveVConfigBtn.btnLabel"
                        :btnOnClick="saveVConfigBtn.btnOnClick"
                        :btnActive="saveVConfigBtn.btnActive"
                    />
                </div>
            </div>
            <!-- Hide Config Help window 
            <div v-if="showHelp" class="config-help-container">
                <div class="help-area">
                    <div class="help-area-text">
                        <textarea disabled>
                            Config needs to be in valid JSON format. Else it cannot be saved. 
                            Config interface:
                            {
                                http: {
                                    port: number,
                                    proxy: string,
                                    allowSelfSigned: boolean
                                },
                                coap: {
                                    port: number
                                },
                                mqtt: {
                                    broker: string,                     // Broker URL
                                    username: string,
                                    password: string,
                                    clientId: string
                                    port: number
                                },
                                credentials: {                          // There can be multiple credentials properties 
                                    thing-id: {                           // for multiple things.
                                        username: string,
                                        password: string
                                    }, 
                                    other-thing-id: {
                                        identity: string,
                                        psk: string
                                    },
                                    other-thing-id: {
                                        token: string
                                    }}
                            }
                        </textarea>
                    </div>
                </div>
            </div> -->
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import { TdVirtualConfigEnum } from '@/util/enums';
import { getFormattedJsonString } from '@/util/helpers';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aConfigStatusBar from '@/components/01_atoms/aConfigStatusBar.vue';
import { setTimeout } from 'timers';

export default Vue.extend({
    name: 'oVirtual',
        components: {
        aButtonBasic,
        aConfigStatusBar
    },
    created() {
        this.vconfig = getFormattedJsonString((this as any).getVirtualConfig(this.id));
    },
    data() {
        return {
            vconfig: '',
            vconfigStatus: TdVirtualConfigEnum.INFO as TdVirtualConfigEnum,
            format: 'raw',
            showHelp: false,
            resetVConfigBtn: {
                btnLabel: 'Reset Config to default',
                btnClass: 'btn-config-small',
                btnOnClick: 'reset-config'
            },
            saveVConfigBtn: {
                btnLabel: 'Save Config',
                btnClass: 'btn-config-small',
                btnOnClick: 'save-config',
                btnActive: false
            },
            showHelpBtn: {
                btnLabelShow: 'Show Config Format Help',
                btnLabelHide: 'Hide Config Format Help',
                btnClassShow: 'show-format',
                btnClassHide: 'hide-format',
                btnOnClick: 'show-help',
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
        btnSaveVirtualConfigClicked() {
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

.vconfig-help-container, .show-vconfig, .help-area {
    width: 100%;
    height: 100%;
}

.change-vconfig-area {
    width: 100%;
    height: 100%;
}

.help-area-text {
    width: 100%;
    height: 90%;
}
.help-area-text textarea {
    width: 100%;
    height: 100%;
    border: 1px solid #393B3A;
    border-radius: 3px;
    background: #B4BAB9;
    padding: 7px;
    resize: none;
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
