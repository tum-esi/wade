<template>
    <div>
        <div v-if="!txtArray || txtArray.length <= 0">
            No mashups could be generated according to the constraints and filters choosen!
        </div>
        <div class="mermaid-gallery-container" v-else>
            <aIconButton class="nav-button" iconBtnSrcPath="arrow_left" iconBtnOnClick="move-left" @icon-btn-clicked='moveLeft'/>
            <div class="mermaid-view-container">
                <label> {{txtArray.length}} mashups conform to the selected criteria from a total of {{maxPossibleMashups}} possible mashups</label>
                <aViewerMermaid class="mermaid-view" :txt="txtArray[txtIndex]"/>
                <label>Mashup {{txtIndex+1}}/{{txtArray.length}}</label>
            </div>
            <aIconButton class="nav-button" iconBtnSrcPath="arrow_right" iconBtnOnClick="move-right" @icon-btn-clicked='moveRight'/>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import aIconButton from '@/components/01_atoms/aIconButton.vue';
import aViewerMermaid from '@/components/01_atoms/aViewerMermaid.vue';
import { watch } from 'fs';
export default Vue.extend({
    name: 'mGalleryMermaid',
    components:{
        aIconButton,
        aViewerMermaid
    },
    props: {
        txtArray: {
            type: Array,
            required: false
        },
        maxPossibleMashups: {
            type: Number,
            required: true
        }
    },
    data: function(){
        return {
            txtIndex: 0,
        }
    },
    methods: {
        moveRight() {
            let mermaidDiv = document.getElementById("mermaid-all");
            this.txtIndex = (this.txtIndex + 1) % this.txtArray.length ;
            this.$emit("current-mashup-nr", this.txtIndex);
            setTimeout(()=> {
                if(mermaidDiv) mermaidDiv.scrollIntoView({
                    behavior: "smooth"
                });
            },3)
        },
        moveLeft() {
            let mermaidDiv = document.getElementById("mermaid-all");
            if(this.txtArray && this.txtIndex <= 0) {
                this.txtIndex = this.txtArray.length-1;
            } else {
                this.txtIndex--;
            }
            this.$emit("current-mashup-nr", this.txtIndex);
            setTimeout(()=> {
                if(mermaidDiv) mermaidDiv.scrollIntoView({
                    behavior: "smooth"
                });
            },3)
        }
    }
})
</script>

<style lang="less" scoped>
    .mermaid-gallery-container {
        display: flex;
        flex-flow: row nowrap;
    }
    .mermaid-view-container{
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        width: 80%;
        flex-grow: 2;
    }
    .mermaid-view {
        width: 100%;
    }
    .nav-button {
        width: 10%;
        flex-grow: 1;
    }
</style>