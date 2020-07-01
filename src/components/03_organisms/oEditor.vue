<template>
  <div class="editor-container">
    <div class="editor-title">
      <label>Thing Description</label>
      <label>{{ id }}</label>
      <div class="editor-dropdown-container">
        <aDropdownButton
          btnLabel="Load Example TD"
          btnKey="insert-example-td"
          :btnDropdownOptions="TdFileList"
          btnStyle="dropdown-custom-editor"
          class="style-aDropdownButton"
        />
      </div>
    </div>
    <div class="editor-area">
      <mCodeEditor
        :language="currentTd ? 'json' : 'text'"
        :placeholder.sync="getEditorPlaceholder"
        :code.sync="currentTd"
      ></mCodeEditor>
    </div>
    <div class="config-btns">
      <aButtonBasic
        v-on:open-config-tab="$emit('open-config')"
        :btnClass="saveTdBtn.btnClass"
        :btnLabel="configButton.btnLabel"
        :btnOnClick="configButton.btnOnClick"
        :btnActive="td.length > 0"
      />
      <aButtonBasic
        v-on:save-td="$store.commit('SidebarStore/saveTd', { content: td, id })"
        :btnClass="saveTdBtn.btnClass"
        :btnLabel="saveTdBtn.btnLabel"
        :btnOnClick="saveTdBtn.btnOnClick"
        :btnActive="td.length > 0"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import aButtonBasic from "@/components/01_atoms/aButtonBasic.vue";
import aDropdownButton from "@/components/01_atoms/aDropdownButton.vue";
import mCodeEditor from "@/components/02_molecules/mCodeEditor.vue";
import { mapGetters, mapActions, mapMutations } from "vuex";
import { TdStateEnum } from "@/util/enums";
import { getFormattedJsonString, loggingError } from "@/util/helpers";
import * as Api from "@/backend/Api";

export default Vue.extend({
  name: "oEditor",
  components: {
    aButtonBasic,
    aDropdownButton,
    mCodeEditor
  },
  data() {
    return {
      td: "",
      TdFileList: [] as WADE.DropdownOptionInterface[],
      configButton: {
        btnLabel: "Change Configuration",
        btnClass: "btn-config-big",
        btnOnClick: "open-config-tab"
      },
      saveTdBtn: {
        btnLabel: "Save",
        btnClass: "btn-config-small",
        btnOnClick: "save-td"
      }
    };
  },
  created() {
    this.$eventHub.$on("fetched-td", this.tdChanged);
    this.$eventHub.$on("dropdown-clicked", eventObject => {
      this.dropDownReaction(eventObject);
    });
    this.tdChanged({ td: (this as any).getSavedTd(this.id) });
    this.loadTdFiles();
  },
  beforeDestroy() {
    this.$eventHub.$off("fetched-td");
    this.$eventHub.$off("dropdown-clicked");
  },
  computed: {
    ...mapGetters("TdStore", ["getEditorPlaceholder"]),
    ...mapGetters("SidebarStore", ["getSavedTd", "getConfig", "getProtocols"]),
    id(): string {
      return (this as any).$route.params.id;
    },
    currentTd: {
      get(): string {
        return this.td;
      },
      async set(value: string) {
        this.tdChanged({ td: value });
      }
    }
  },
  methods: {
    ...mapMutations("SidebarStore", ["saveTdProtocols"]),
    ...mapActions("TdStore", [
      "resetInteractions",
      "resetSelections",
      "resetResults",
      "processChangedTd"
    ]),
    // Executed when td changed: via loading saved td/ fetching td/ user changed td
    tdChanged(args: {
      td: string;
      tdState?: TdStateEnum | null;
      errorMsg?: string;
    }) {
      this.td = "";
      if (args.td) {
        try {
          this.td = getFormattedJsonString(args.td);
        } catch {
          this.td = args.td;
        }
      }
      // Update protocol list
      (this as any).saveTdProtocols({ id: this.id, td: args.td });
      // Consume td
      (this as any).processChangedTd({
        td: args.td,
        config: JSON.parse((this as any).getConfig(this.id)),
        protocols: (this as any).getProtocols(this.id)
      });
      // Hide url bar if td changed
      this.$emit("hide-url-bar");
      // Reset result fields and interaction fields
      (this as any).resetInteractions();
      (this as any).resetSelections();
      (this as any).resetResults();
      // Update possible protocol list
      this.$eventHub.$emit("selections-reseted");
    },
    loadTdFiles() {
      Api.showExampleTds().then(
        fileList => {
          this.TdFileList = fileList as any;
        },
        reason => {
          loggingError(new Error("getExampleTDs failed due reason:" + reason));
        }
      );
    },
    dropDownReaction(eventObject) {
      if (eventObject.btnKey === "insert-example-td") {
        Api.loadExampleTd(eventObject.btnValue).then(
          exampleTD => {
            if (typeof exampleTD === "string") {
              this.tdChanged({ td: exampleTD });
            }
          },
          reason => {
            loggingError(
              new Error("load Example TDs failed due to reason:" + reason)
            );
          }
        );
      } else {
        // event not relevant for this function
      }
    }
  },
  watch: {
    "$route.params.id"(id) {
      this.tdChanged({ td: (this as any).getSavedTd(this.id) });
    }
  }
});
</script>

<style scoped>
.editor-container {
  height: 100%;
}
.editor-title {
  position: relative;
  padding: 7px 0px 7px 2px;
  max-height: 8%;
  min-height: 50px;
  display: flex;
  align-items: center;
}
.editor-title label {
  font-size: 14px;
  padding-right: 7px;
}
.editor-area {
  width: 100%;
  height: 84%;
  max-height: 800px;
}
.editor-area textarea {
  width: 100%;
  height: 100%;
  resize: none;
  padding: 7px;
  font-family: "Courier New", Courier, monospace;
  color: #000;
}
.config-btns {
  height: 8%;
  padding-top: 7px;
  display: flex;
  justify-content: space-between;
}
.editor-dropdown-container {
  right: 0px;
  display: inline-block;
}
.style-aDropdownButton {
  margin-left: 10px;
  text-align: center;
}
.style-aDropdownButton:hover {
  border-color: #8aaba9;
}
</style>