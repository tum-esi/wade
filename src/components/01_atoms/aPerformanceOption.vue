<template>
    <div class="option-container">
        <label class="option-title"> {{ optionLabel }} </label>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'aPerformanceOption',
    props: {
        optionLabel: {
            type: String,
            required: true
        }
    },
    methods: {
    }
});
</script>

<style scoped>
.option-container {
    display: flex;
    width: 100%;
    height: 35px;
    border: 1px solid #393B3A;
    border-radius: 3px;
    margin: 5px 0 5px 0;
    background: #939C9E;
    padding: 3px;
    overflow: hidden;
}

.option-title {
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 4px;
}
</style>
