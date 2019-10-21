<template>
    <div class="outputbar-container border-bottom">
        <table class="output-bar">
            <tr v-for="msg in outputMessages" 
            :key="msg.time.full" 
            :class="{
                error: msg.isError,
                normTR: !msg.isError}" >
                <td>{{ msg.time.h }}:{{ msg.time.m }}:{{ msg.time.s }}</td>
                <td><span v-if="msg.isDebug">DEBUG: </span>{{ msg.content }}</td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';

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
}

.normTR {
    background-color: white;
}
/* .error {
    color: #a81900;
} */
</style>
