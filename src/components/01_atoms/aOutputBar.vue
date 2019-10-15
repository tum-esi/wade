<template>
    <div class="outputbar-container border-bottom" :class="style">
        <output>{{ outputContent }}</output>
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
        }
    },
    data() {
        return {
            isErrorOutput: false,
            style: ''
        };
    },
    watch: {
        outputContent() {
            if (this.isErrorOutput === true) {
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
}

.output-container output {
    font-weight: lighter;
}

/* .error {
    color: #a81900;
} */
</style>
