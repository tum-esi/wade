<template>
  <MonacoEditor
    class="style-mCodeEditor"
    theme="vs-dark"
    :language="language"
    v-model="value"
    :options="options"
  ></MonacoEditor>
</template>

<script lang="ts">
import Vue from "vue";
import MonacoEditor from "vue-monaco";

export default Vue.extend({
  name: "mCodeEditor",
  components: {
    MonacoEditor
  },
  props: {
    language: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: false,
      default: ""
    },
    placeholder: {
      type: String,
      required: false,
      default: ""
    },
    options: {
      type: Object,
      required: false,
      default: () => {
        return {
          formatOnType: true
        };
      }
    }
  },
  data() {
    return {
      value: this.code || this.placeholder
    };
  },
  watch: {
    value(newVal) {
      console.log(newVal);
      this.value = newVal;
    }
  }
});
</script>

<style scoped>
.style-mCodeEditor {
  width: 100%;
  height: 100%;
}
</style>
