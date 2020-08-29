<template>
    <div class="mermaid-gallery-container">
        <aIconButton class="nav-button" iconBtnSrcPath="arrow_left" iconBtnOnClick="move-left" @icon-btn-clicked='moveLeft'/>
        <div class="mermaid-view-container">
            <label> {{txtArray.length}} mashups conform to the selected criteria from a total of {{maxPossibleMashups}} possible mashups</label>
            <aViewerMermaid class="mermaid-view" :txt="txtArray[txtIndex]"/>
            <label>Mashup {{txtIndex+1}}/{{txtArray.length}}</label>
        </div>
        
        <aIconButton class="nav-button" iconBtnSrcPath="arrow_right" iconBtnOnClick="move-right" @icon-btn-clicked='moveRight'/>
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
            required: true
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
            this.txtIndex = (this.txtIndex + 1) % this.txtArray.length ;
            this.$emit("current-mashup-nr", this.txtIndex);
        },
        moveLeft() {

            if(this.txtArray && this.txtIndex <= 0) {
                this.txtIndex = this.txtArray.length-1;
            } else {
                this.txtIndex--;
            }
            this.$emit("current-mashup-nr", this.txtIndex);
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