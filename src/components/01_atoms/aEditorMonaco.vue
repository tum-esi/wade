<template>
  <div id="monaco-editor">

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Monaco from 'monaco-editor';

export default Vue.extend({
    model: {
        prop: "code",
        event: "change"
    },
    props: {
        code: {
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            monacoEditor: {} as Monaco.editor.IStandaloneCodeEditor
        }
    },
    mounted() {
        this.$nextTick(function () {
            let container = document.getElementById("monaco-editor"); 
            if(container) this.monacoEditor = Monaco.editor.create(container, {
                language: this.language,
                value: this.code
            });
            let newEditor = this.monacoEditor;
            window.onresize = function() {
                newEditor.layout();
            }
            newEditor.onDidChangeModelContent((e) => this.$emit("change", newEditor.getValue()));
            newEditor.onDidChangeCursorPosition((e) => console.log(e.reason));
        })
    },
    watch: {
        code: function(newCode: string, oldCode: string) {
            if(this.monacoEditor.getValue() !== newCode) this.monacoEditor.setValue(newCode);
        }
    }
})
</script>

<style>
    #monaco-editor {
        height: 100%;
        width: 100%;
    }
</style>