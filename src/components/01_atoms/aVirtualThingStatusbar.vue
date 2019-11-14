<template>
    <div class="statusbar-container border-bottom" :class="{'error' : StatusMessage.err, 'active-status': StatusMessage.active}">
        <label>{{ StatusMessage.msg }}</label>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapGetters } from 'vuex';


export default Vue.extend({
    name: 'aVirtualThingStatusbar',
    props: {
        StatusMessage: Object
    }
});
</script>

<style scoped>
.statusbar-container {
    font-family: 'Courier New', Courier, monospace;
    height: 10%;
    background: azure;
    display: flex;
    align-items: center;
    padding: 7px;
    font-size: 14px;
    color: #333333;
    width: 100%;
    height: 100%;
}

.statusbar-container label {
    font-family: inherit;
}

.active-status{
    background-color: lightgreen;
}
</style>
