<template>
 <div id='mermaid' class="mermaid">
     {{txt}}
 </div>
</template>

<script lang="ts">
import Vue from 'vue';
import mermaid from 'mermaid';
export default Vue.extend({
    name: 'aViewerMermaid',
    data: function () {
        return {
            slot: this.$slots,
        }
    },
    props: {
        txt: String
    },
    methods: {
        getMermaidContainer(): string {
            let elements = this.$el.getElementsByClassName('mermaid');
            return elements[0].id;
        }
    },
    mounted: function() {
        mermaid.initialize({ theme: "default", startOnLoad: false, securityLevel: "loose" });
        mermaid.init(this.$el.getElementsByClassName('mermaid')[0]);
    },
    updated: function () {
        mermaid.init(this.$el.getElementsByClassName('mermaid')[0]);
    },
    watch: {
        txt: function(){
            let container = document.getElementById("mermaid");
            if(container) {
                container.removeAttribute("data-processed");
                if(container.firstChild) container.replaceChild( document.createTextNode(this.txt), container.firstChild);
                mermaid.init(container);
            }
            
        }
    }


})
</script>

<style lang="less" scoped>

</style>