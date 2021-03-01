<template>
  <div id="monaco-editor">

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Monaco from 'monaco-editor';

export default Vue.extend({
    model: {
        prop: 'code',
        event: 'change'
    },
    props: {
        code: {
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            monacoEditor: {} as Monaco.editor.IStandaloneCodeEditor,
            modelContentListener: {} as Monaco.IDisposable,
        };
    },
    mounted() {
        this.$nextTick(function() {
            const container = document.getElementById('monaco-editor');
            if (container) this.monacoEditor = Monaco.editor.create(container, {
                language: this.language,
                value: this.code,
                scrollBeyondLastLine: false,
                fontSize: 15,
                tabSize: 4
            });
            window.onresize = () => {
                this.monacoEditor.layout();
            };
            this.$eventHub.$on('tab-clicked', () => {setTimeout(() => {this.monacoEditor.layout(); }, 3); });
            this.modelContentListener = this.monacoEditor.onDidChangeModelContent((e) => this.$emit('change', this.monacoEditor.getValue()));
        });
    },
    beforeDestroy() {
        this.$eventHub.$off('tab-clicked');
        this.modelContentListener.dispose();
        this.monacoEditor.dispose();
    },
    watch: {
        code(newCode: string, oldCode: string) {
            if (this.monacoEditor.getValue() !== newCode) this.monacoEditor.setValue(newCode);
        },
        language(newLanguage: string, oldLanguage: string) {
            const model = this.monacoEditor.getModel();
            if (model) Monaco.editor.setModelLanguage(model, newLanguage);
        }
    }
});
</script>

<style>
    #monaco-editor {
        height: 100%;
        width: 100%;
    }
</style>