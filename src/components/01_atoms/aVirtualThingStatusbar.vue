<template>
    <div class="statusbar-container border-bottom" :class="{'error' : getVtStatus.err}">
        <label>{{ getVtStatus.msg }}</label>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapGetters } from 'vuex';


export default Vue.extend({
    name: 'aVirtualThingStatusbar',
    computed: {
        ...mapGetters('SidebarStore', ['getVtStatus'])
    }
});
</script>

<style scoped>
.statusbar-container {
    font-family: 'Courier New', Courier, monospace;
    height: 10%;
    background: #393B3A;
    display: flex;
    align-items: center;
    padding: 7px;
    font-size: 14px;
    color: rgb(184, 179, 179);
    width: 100%;
    height: 100%;
}

.statusbar-container label {
    font-family: inherit;
}

.error {
    background-color: #ff8585;
}
</style>
