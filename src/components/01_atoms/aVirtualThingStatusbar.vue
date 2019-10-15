<template>
    <div class="statusbar-container border-bottom" :class="{style}">
        <label>{{ getVtStatus }}</label>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapGetters } from 'vuex';
import { VtStatus } from '../../util/enums';


export default Vue.extend({
    name: 'aVirtualThingStatusbar',
    computed: {
        ...mapGetters('TdStore', ['getVtStatus']),
    },
    data() {
        return{
            style:''
        };
    },
    watch: {
        // getVtStatus(cont) {
        //     if(cont === VtStatus.ERROR){
        //         this.style = 'error';
        //     }
        // }
        
        // Check if router id changed
        '$route.params.id'(id) {
            this.vconfig = this.getSavedVirtualConfig();
            if(this.getVtStatus() === VtStatus.ERROR){
                 this.style = 'error';
             }
        }
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
}

.statusbar-container label {
    font-family: inherit;
}

.error {
    background-color: #ff8585;
}
</style>
