<template>
  <div class="config-container border-right">
    <div class="change-config-area">
      <div class="config-header">
        <div class="config-title">
          <label>Configuration</label>
          <div class="format-option">
            <input type="radio" name="format" id="raw" value="raw" v-model="format" />
            <label for="raw">Raw</label>
          </div>
          <div class="format-option">
            <input type="radio" name="format" id="form-fields" value="form-fields" v-model="format" />
            <label for="form-fields">Form-Fields</label>
          </div>
        </div>
        <aButtonBasic
          v-on:show-help="showHelpClicked"
          :btnClass="
            showHelp ? showHelpBtn.btnClassHide : showHelpBtn.btnClassShow
          "
          :btnLabel="
            showHelp ? showHelpBtn.btnLabelHide : showHelpBtn.btnLabelShow
          "
          :btnOnClick="showHelpBtn.btnOnClick"
        />
      </div>
      <div v-if="!showHelp" class="show-config">
        <aConfigStatusBar class="config-status" :statusMessage="configStatus"></aConfigStatusBar>
        <div v-if="format === 'raw'" class="config-area">
          <aEditorMonaco language="json" v-model="currentConfig"/>
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
      <div v-if="showHelp" class="config-help-container">
        <div class="help-area">
          <div class="help-area-text">
            <aEditorMonaco language="json" :code="helpAreaText"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import { TdConfigEnum } from '@/util/enums';
import { getFormattedJsonString } from '@/util/helpers';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aConfigStatusBar from '@/components/01_atoms/aConfigStatusBar.vue';
import aEditorMonaco from '@/components/01_atoms/aEditorMonaco.vue';
import { setTimeout } from 'timers';

export default Vue.extend({
  name: 'oConfig',
  components: {
    aButtonBasic,
    aConfigStatusBar,
    aEditorMonaco
  },
  created() {
    this.config = getFormattedJsonString((this as any).getConfig(this.id));
  },
  data() {
    return {
      config: '',
      configStatus: TdConfigEnum.INFO as TdConfigEnum,
      format: 'raw',
      showHelp: false,
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
      },
      showHelpBtn: {
        btnLabelShow: 'Show Config Format Help',
        btnLabelHide: 'Hide Config Format Help',
        btnClassShow: 'show-format',
        btnClassHide: 'hide-format',
        btnOnClick: 'show-help'
      },
      helpAreaText: `
{
    "http": {
        "port": 80,
        "proxy": {
            "href": "http://localhost:8080",
            "scheme": "basic",
            "token": "bearerToken",
            "username": "username",
            "password": "password",
        },
        "allowSelfSigned": true,
    },
    "coap": {
        "port": 5683
    },
    "mqtt": {
        "broker": "mqtt://test.mosquitto.org",
        "username": "username",
        "password": "password",
        "clientId": "uniqueId"
        "port": 1883
    },
    "credentials": {
        "thing-id": {
            "username": "username",
            "password": "password"
        },
        "other-thing-id": {
            "identity": "identity",
            "psk": "psk"
        },
        "nth-thing-id": {
            "token": "token"
        }
    }
}`
    };
  },
  computed: {
    ...mapGetters('SidebarStore', ['getConfig', 'getDefaultConfig']),
    ...mapGetters('TdStore', ['getProtocols']),
    id() {
      return this.$route.params.id;
    },
    currentConfig: {
      get(): string {
        return this.config;
      },
      async set(value: string) {
        this.config = value;
        // Check if there are unsaved changes
        this.saveConfigBtn.btnActive = !(
          (this as any).getSavedConfig() === this.config
        );
        // Check if config has JSON format
        try {
          JSON.parse(this.config);
          this.configStatus = this.saveConfigBtn.btnActive
            ? TdConfigEnum.UNSAVED
            : TdConfigEnum.INFO;
        } catch (error) {
          this.saveConfigBtn.btnActive = false;
          this.configStatus = TdConfigEnum.ERROR;
        }
      }
    }
  },
  methods: {
    ...mapMutations('SidebarStore', ['saveTdConfig']),
    getSavedConfig(isDefault: boolean = false): string {
      return getFormattedJsonString(
        isDefault
          ? (this as any).getDefaultConfig
          : (this as any).getConfig(this.id)
      );
    },
    showHelpClicked() {
      this.showHelp = !this.showHelp;
    },
    resetConfigBtnClicked() {
      this.config = this.getSavedConfig(true);
      // If default config differs from saved config, it needs to be saved
      if ((this as any).getSavedConfig() !== this.config) {
        this.configStatus = TdConfigEnum.UNSAVED;
        this.saveConfigBtn.btnActive = true;
      } else {
        this.configStatus = TdConfigEnum.INFO;
        this.saveConfigBtn.btnActive = false;
      }
    },
    btnSaveConfigClicked() {
      (this as any).saveTdConfig({
        id: this.id,
        config: JSON.parse(this.config)
      });
      this.configStatus = TdConfigEnum.SAVE_SUCCESS;
      this.saveConfigBtn.btnActive = false;
      setTimeout(() => {
        this.configStatus = TdConfigEnum.INFO;
      }, 1500);
    }
  },
  watch: {
    // Check if router id changed
    '$route.params.id'(id) {
      this.config = this.getSavedConfig();
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

.config-container {
  height: 100%;
  width: 50%;
  display: flex;
  padding: 0px 12px 10px 12px;
}

.config-help-container,
.show-config,
.help-area {
  width: 100%;
  height: 100%;
}

.change-config-area {
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
  border: 1px solid #393b3a;
  border-radius: 3px;
  background: #b4bab9;
  padding: 7px;
  resize: none;
}

.config-header {
  display: flex;
  justify-content: space-between;
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

.config-header label {
  font-size: 16px;
  padding-right: 7px;
}

.config-area {
  width: 100%;
  height: 79%;
}

.config-area textarea {
  width: 100%;
  height: 100%;
  resize: none;
  padding: 7px;
  font-family: "Courier New", Courier, monospace;
  color: #000;
  border: 1px solid #393b3a;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
}

.config-area-form-container {
  width: 100%;
  height: 100%;
  border: 1px solid #393b3a;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  padding: 7px;
}

.config-area-form-container p {
  font-size: 12px;
}

.config-btns {
  height: 7%;
  padding-top: 7px;
  display: flex;
  justify-content: space-between;
}
</style>
