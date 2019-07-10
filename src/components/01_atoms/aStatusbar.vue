<template>
    <div class="statusbar-container">
        <label>{{ getStatus }}</label>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aStatusbar',
    props: {
        /**
         * Message to be shown in status bar.
         */
        statusMessage: {
            type: String,
            required: false,
            default: '...'
        }
    },
    computed: {
        getStatus(): string {
            return this.statusMessage.length <= 0 ?
                `Status: ...` : `Status: ${this.statusMessage}`;
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
