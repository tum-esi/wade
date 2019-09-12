<template>
    <div class="config-container">
        <div class="change-config-area">
            <div class="config-title">
                <label>Configuration</label>
                <div class="format-option">
                    <input type="radio" name="format" id="raw" value="raw" v-model="format"/>
                    <label for="raw">Raw</label>
                </div>
                <div class="format-option">
                    <input type="radio" name="format" id="form-fields" value="form-fields" v-model="format"/>
                    <label for="form-fields">Form-Fields</label>
                </div>
            </div>
            <aConfigStatusBar class="config-status" :statusMessage="configStatus"></aConfigStatusBar>
            <div v-if="format === 'raw'"class="config-area">
                <textarea spellcheck="false" wrap="off" v-model="currentConfig"></textarea>
            </div>
            <div v-else class="config-area">
                <div class="config-area-form-container">
                    <p>Hint: Only usable with default config.</p>
                    <!-- TODO: mFormConfigOptions -->
                </div>
            </div>
            <div class="config-btns">
                <aButtonBasic
                    v-on:reset-config="resetConfigBtnClicked"
                    :btnClass="resetConfigBtn.btnClass"
                    :btnLabel="resetConfigBtn.btnLabel"
                    :btnOnClick="resetConfigBtn.btnOnClick"
                    :btnActive="true"
                />
                <aButtonBasic
                    v-on:save-config="btnSaveConfigClicked"
                    :btnClass="saveConfigBtn.btnClass"
                    :btnLabel="saveConfigBtn.btnLabel"
                    :btnOnClick="saveConfigBtn.btnOnClick"
                    :btnActive="saveConfigBtn.btnActive"
                />
            </div>
        </div>
        <div class="help-area">
            <div class="config-title">
                <label>Config Format Help</label>
            </div>
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
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import { TdConfigEnum } from '@/util/enums';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aConfigStatusBar from '@/components/01_atoms/aConfigStatusBar.vue';
import { setTimeout } from 'timers';

export default Vue.extend({
    name: 'oConfig',
        components: {
        aButtonBasic,
        aConfigStatusBar
    },
    created() {
        this.config = JSON.stringify(JSON.parse((this as any).getConfig(this.$route.params.id)), null, 2);
    },
    data() {
        return {
            id: '',
            config: '',
            configStatus: TdConfigEnum.INFO as TdConfigEnum,
            format: 'raw',
            resetConfigBtn: {
                btnLabel: 'Reset Config to default',
                btnClass: 'btn-config-small',
                btnOnClick: 'reset-config'
            },
            saveConfigBtn: {
                btnLabel: 'Save Config',
                btnClass: 'btn-config-small',
                btnOnClick: 'save-config',
                btnActive: false
            }
        };
    },
    computed: {
        ...mapGetters('SidebarStore', ['getConfig', 'getDefaultConfig']),
        currentConfig: {
            get(): string {
                return this.config;
            },
            async set(value: string) {
                this.config = value;
                // Check if there are unsaved changes
                this.saveConfigBtn.btnActive = !(this.getSavedConfig() === this.config);
                // Check if config has JSON format
                try {
                    JSON.parse(this.config);
                    this.configStatus = this.saveConfigBtn.btnActive ? TdConfigEnum.UNSAVED : TdConfigEnum.INFO;
                } catch (error) {
                    this.saveConfigBtn.btnActive = false;
                    this.configStatus = TdConfigEnum.ERROR;
                }
            }
        },
    },
    methods: {
        ...mapMutations('SidebarStore', ['saveTdConfig']),
        getSavedConfig(isDefault: boolean = false): string {
            return JSON.stringify(
                JSON.parse(
                isDefault
                    ? (this as any).getDefaultConfig
                    : (this as any).getConfig(this.$route.params.id)
                ),
                null,
                2
            );
        },
        resetConfigBtnClicked() {
            this.config = this.getSavedConfig(true);
            // If default config differs from saved config, it needs to be saved
            if (this.getSavedConfig() !== this.config) {
                this.configStatus = TdConfigEnum.UNSAVED;
                this.saveConfigBtn.btnActive = true;
            } else {
                this.configStatus = TdConfigEnum.INFO;
                this.saveConfigBtn.btnActive = false;
            }
        },
        btnSaveConfigClicked() {
            (this as any).saveTdConfig({ id: this.$route.params.id, config: JSON.parse(this.config) });
            this.configStatus = TdConfigEnum.SAVE_SUCCESS;
            this.saveConfigBtn.btnActive = false;
            setTimeout(() => { this.configStatus = TdConfigEnum.INFO; }, 1500);
        }
    },
    watch: {
        // Check if router id changed
        '$route.params.id'(id) {
            this.config = this.getSavedConfig();
        }
    }
});

function getBeautifiedJSONasString(value: string) {
    return JSON.stringify(JSON.parse(value), null, 2);
}
</script>


<style scoped>
.format-option {
    padding-left: 7px;
}

.format-option label {
    font-size: 14px !important;
    padding-left: 7px;
}

.config-container {
    height: 100%;
    width: 100%;
    display: flex;
    padding: 0px 7px 5px 7px;
}

.change-config-area, .help-area {
    width: 50%;
    height: 100%;
}

.change-config-area {
    padding-right: 7px;
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

.config-title {
    padding: 7px 0px 7px 2px;
    max-height: 8%;
    min-height: 50px;
    display: flex;
    align-items: center;
}

.config-status {
    height: 7%;
}

.config-title label {
    font-size: 16px;
    padding-right: 7px;
}

.config-area {
    width: 100%;
    height: 73%;
    max-height: 800px;
}

.config-area textarea{
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

.config-area-form-container {
    width: 100%;
    height: 100%;
    border: 1px solid #393B3A;
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
    padding: 7px;
}

.config-area-form-container p {
    font-size: 12px;
}

.config-btns {
    height: 10%;
    padding-top: 7px;
    display: flex;
    justify-content: space-between;
}
</style>
