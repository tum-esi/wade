<template>
    <div class="test-scenario-container">
        <label
            :class="testScenarioFailed ? 'test-scenario-failed': 'test-scenario-passed'"
            v-on:click="toggleScenario"
        > Test Scenario {{ $vnode.key }} </label>

        <hr v-show="showScenario" />

        <div class="test-scenario-body"
            v-show="showScenario"
        >
            <aConformanceTestElement
                v-for="(element, index) in interactions"
                :key="index"
                :interactionName="element.name"
                :passed="element.passed"
                :resultDetail="element"
                v-on:test-failed="testScenarioFailed = true, $emit('test-scenario-failed')"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aConformanceTestElement from '@/components/01_atoms/aConformanceTestElement.vue';

export default Vue.extend({
    name: "mTestScenarioElement",
    props: {
        interactions: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            showScenario: false,
            testScenarioFailed: false,
        }
    },
    components: { aConformanceTestElement },
    methods: {
        toggleScenario() {
            this.showScenario = !this.showScenario;
        }
    }
})

</script>

<style scoped>
.test-scenario-container {
    margin: 2px;
    border: 1px solid black;
    border-radius: 2px;
    box-shadow: 1px;
    color: white;
}

.test-scenario-passed {
    padding-left: 5px;
    background-color: green;    
    display: block;
}

.test-scenario-passed:hover {
    background-color: rgba(0, 128, 0, 0.8);
}

.test-scenario-failed {
    padding-left: 5px;
    background-color: red;
    display: block;
}

.test-scenario-failed:hover {
    background-color: rgba(255, 0, 0, 0.8);
}

</style>