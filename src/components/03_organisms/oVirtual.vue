<template>
  <div class="vconfig-container border-right">
    <div class="change-vconfig-area">
      <div class="vconfig-header">
        <div class="vconfig-title">
          <label>Virtual Thing Configuration</label>
        </div>
      </div>
      <div class="show-vconfig">
        <aConfigStatusBar
          class="vconfig-status"
          :statusMessage="vconfigStatus"
        ></aConfigStatusBar>
        <div class="vconfig-area">
          <aEditorMonaco language="json" v-model="currentVirtualConfig"/>
        </div>

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
import aEditorMonaco from '@/components/01_atoms/aEditorMonaco.vue';
import { setTimeout } from 'timers';

export default Vue.extend({
  name: 'oVirtual',
  components: {
    aButtonBasic,
    aConfigStatusBar,
    aEditorMonaco
  },
  created() {
    (this as any).vconfig = getFormattedJsonString(
      (this as any).getVirtualConfig(this.id)
    );
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
        btnOnClick: 'show-help'
      }
    };
  },
  computed: {
    ...mapGetters('SidebarStore', [
      'getVirtualConfig',
      'getDefaultVirtualConfig'
    ]),
    ...mapGetters('TdStore', ['getProtocols']),
    id() {
      return this.$route.params.id;
    },
    currentVirtualConfig: {
      get(): string {
        return (this as any).vconfig;
      },
      async set(value: string) {
        (this as any).vconfig = value;
        // Check if there are unsaved changes
        (this as any).saveVConfigBtn.btnActive = !(
          (this as any).getSavedVirtualConfig() === (this as any).vconfig
        );
        // Check if config has JSON format
        try {
          JSON.parse((this as any).vconfig);
          (this as any).vconfigStatus = (this as any).saveVConfigBtn.btnActive
            ? TdVirtualConfigEnum.UNSAVED
            : TdVirtualConfigEnum.INFO;
        } catch (error) {
          (this as any).saveVConfigBtn.btnActive = false;
          (this as any).vconfigStatus = TdVirtualConfigEnum.ERROR;
        }
      }
    }
  },
  methods: {
    ...mapMutations('SidebarStore', ['saveTdVirtualConfig']),
    getSavedVirtualConfig(isDefault: boolean = false): string {
      return getFormattedJsonString(
        isDefault
          ? (this as any).getDefaultVirtualConfig
          : (this as any).getVirtualConfig(this.id)
      );
    },
    // showHelpClicked() {
    //     this.showHelp = !this.showHelp;
    // },
    resetVirtualConfigBtnClicked() {
      (this as any).vconfig = (this as any).getSavedVirtualConfig(true);
      // If default config differs from saved config, it needs to be saved
      if ((this as any).getSavedVirtualConfig() !== (this as any).vconfig) {
        (this as any).vconfigStatus = TdVirtualConfigEnum.UNSAVED;
        (this as any).saveVConfigBtn.btnActive = true;
      } else {
        (this as any).vconfigStatus = TdVirtualConfigEnum.INFO;
        (this as any).saveVConfigBtn.btnActive = false;
      }
    },
    btnSaveVirtualConfigClicked() {
      (this as any).saveTdVirtualConfig({
        id: this.id,
        vconfig: JSON.parse((this as any).vconfig)
      });
      (this as any).vconfigStatus = TdVirtualConfigEnum.SAVE_SUCCESS;
      (this as any).saveVConfigBtn.btnActive = false;
      setTimeout(() => {
        (this as any).vconfigStatus = TdVirtualConfigEnum.INFO;
      }, 1500);
    }
  },
  watch: {
    // Check if router id changed
    '$route.params.id'(id) {
      (this as any).vconfig = (this as any).getSavedVirtualConfig();
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
  width: 35%;
  display: flex;
  padding: 0px 12px 10px 12px;
}

.vconfig-help-container,
.show-vconfig,
.help-area {
  width: 100%;
  height: calc(100% - 50px);
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
  border: 1px solid #393b3a;
  border-radius: 3px;
  background: #b4bab9;
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

.statusbar-container {
  width: 100%;
  height: 8%;
}

.vconfig-area {
  width: 100%;
  height: 84%;
}

.vconfig-area textarea {
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

.vconfig-area-form-container {
  width: 100%;
  height: 100%;
  border: 1px solid #393b3a;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  padding: 7px;
}

.vconfig-area-form-container p {
  font-size: 12px;
}

.vconfig-btns {
  height: 8%;
  padding-top: 7px;
  display: flex;
  justify-content: space-between;
}
</style>
