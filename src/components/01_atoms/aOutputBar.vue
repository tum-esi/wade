<template>
    <div class="outputbar-container border-bottom">
        <table class="output-bar">
            <tr v-for="msg in outputMessages" class="output-tr"
            :key="msg.time.full" 
            :class="{
                error: msg.isError,
                normTR: !msg.isError}" >
                <td class="output-td-t">{{ msg.time.h }}:{{ msg.time.m }}:{{ msg.time.s }}</td>
                <td class="output-td-c"><span v-if="msg.isProgram">VT-Out:</span>{{ msg.content }}</td>
                <td class="output-td-i">
                    <i v-if="msg.isVtAction" class="fa fa-rocket" title="Action"></i>
                    <i v-else-if="msg.isVtProperty" class="fa fa-database" title="Property"></i>
                    <i v-else-if="msg.isVtEvent" class="fa fa-flash" title="Event"></i>
                </td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import '@/assets/font-awesome-4.7.0/css/font-awesome.min.css';

export default Vue.extend({
    name: 'aOutputBar',
    props: {
        outputMessages: {
            type: Array
            }
    }
});
</script>

<style scoped>
.output-container {
    background: #939c9e;
    display: flex;
    align-items: center;
    padding: 7px;
    font-size: 12px;
    color: #000000;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    border: 1px solid #393B3A;
    border-bottom: none;
    width: 100%;
    height: 100%;
}

.output-bar {
    font-weight: lighter;
    overflow-wrap: break-word;
    overflow-x: hidden;
    overflow-y: scroll;
    display: block;
    width: 100%;
    height: 100%;
    border-spacing: 0;
}

.normTR {
    background-color: white;
}

.output-tr td{
    vertical-align: middle;
}

.fa {
    padding: 2px;
}

.output-td-t {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    border: solid black 2px;
    padding: 4px;
    text-align: center;
}

.output-td-c {
    border: solid black 2px;
    padding: 4px;
}

.output-td-i {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border: solid black 2px;
    padding: 8px;
    text-align: center;
}

</style>
