<template>
    <div class="outputbar-container border-bottom" :class="style">
        <output class="output-bar">{{ outputContent }}</output>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';

export default Vue.extend({
    name: 'aOutputBar',
    props: {
        outputContent: {
            type: String,
            required: true
        },
        isErrorOutput: {
            type: Boolean,
            required: false
        }
    },
    data() {
        return {
            style: ''
        };
    },
    watch: {
        isErrorOutput() {
            if (this.isErrorOutput) {
                this.style = 'error';
            } else {
                this.style = '';
            }
        },
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

/* .error {
    color: #a81900;
} */
</style>
