<template>
    <div class="statusbar-container">
        <label>{{ getStatus }}</label>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
export default Vue.extend({
    name: 'aStatusbar',
    computed: {
        ...mapGetters('TdStore', {tdState: 'getTdState', errorMsg: 'getErrorMsg'}),
        getStatus(): string {
            console.log('tdState:', this.tdState);
            console.log('errorMsg:', this.errorMsg);
            return this.tdState && this.errMsg ? `> ${this.tdState} (${errorMsg})` : (this.tdState ? `> ${this.tdState}` : '> ...'); 
        }
    }
});
</script>

<style scoped>
.statusbar-container {
    font-family: 'Courier New', Courier, monospace;
    height: 10%;
    /* background: rgb(83, 87, 85); */
    background: #393B3A;
    display: flex;
    align-items: center;
    padding: 7px;
    font-size: 14px;
    color: rgb(184, 179, 179);
}

.statusbar-container label {
    font-family: inherit;
}
</style>
