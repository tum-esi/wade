<template>
    <div class="test-cycle-container">
        <label
            :class="testCycleFailed ? 'test-cycle-failed' : 'test-cycle-passed'"
            v-on:click="toggleCycle"
        > Test Cycle {{ $vnode.key }} </label>

        <hr v-show="showCycle" />

        <div class="test-cycle-body"
            v-show="showCycle"
        >
            <mTestScenarioElement
                v-for="(element, index) in scenarios"
                :interactions="element"
                :key="index"
                v-on:test-scenario-failed="testCycleFailed = true"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aConformanceTestElement from '@/components/01_atoms/aConformanceTestElement.vue';
import mTestScenarioElement from '@/components/02_molecules/mTestScenarioElement.vue';

export default Vue.extend({
    name: "mTestCycleElement",
    props: {
        scenarios: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            showCycle: false,
            testCycleFailed: false
        }
    },
    created() {
        console.log(this.scenarios);
    },
    components: { aConformanceTestElement, mTestScenarioElement },
    methods: {
        toggleCycle() {
            this.showCycle = !this.showCycle;
        }
    }
})

</script>

<style scoped>
.test-cycle-container {
    margin: 2px;
    border: 1px solid black;
    border-radius: 2px;
    box-shadow: 1px;
    color: white;
}

.test-cycle-body {
    padding: 5px;
}

.test-cycle-passed {
    padding-left: 5px;
    background-color: green;
    display: block;
}

.test-cycle-passed:hover {
    background-color: rgba(0, 128, 0, 0.8);
}

.test-cycle-failed {
    padding-left: 5px;
    background-color: red;
    display: block;
}

.test-cycle-failed:hover {
    background-color: rgba(255, 0, 0, 0.7);
}

</style>