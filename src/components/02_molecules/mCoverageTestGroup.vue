<template>
    <div class="coverage-test-group-container">
        <label class="coverage-test-result-label"
            :class="testGroupFailed ? 'test-group-failed': 'test-group-passed'"
            v-on:click="toggleTestGroup"
        >{{ coverageName }}</label>
        <div
            v-if="coverageName === 'InputCov'" 
            class="coverage-test-group-body"
            v-show="showTestGroup"
        >   
            <aCoverageTestElement
                v-for="(value, name) in interactions"
                :key="name"
                :interactionName="name"
                :passed="value.passed"
                :resultDetail="value"
                v-on:test-failed="testGroupFailed = true"
            />
        </div>
        <div v-else
            class="coverage-test-group-body"
            v-show="showTestGroup"
        >   
            <aCoverageTestElement
                v-for="(element, index) in interactions"
                :key="index"
                :interactionName="element.name"
                :passed="element.passed"
                :resultDetail="element"
                v-on:test-failed="testGroupFailed = true"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aCoverageTestElement from '@/components/01_atoms/aCoverageTestElement.vue';

export default Vue.extend({
    name: 'mCoverageTestGroup',
    components: { aCoverageTestElement },
    data() {
        return {
            showTestGroup: false,
            testGroupFailed: false
        }
    },
    props: {
        coverageName: {
            type: String,
            required: true
        },
        interactions: {
            type: [Object, Array],
            required: true
        }
    },
    methods: {
        toggleTestGroup() {
            this.showTestGroup = !this.showTestGroup;
        }
    }
})
</script>

<style scoped>

.coverage-test-result-label {
    padding-left: 5px;
    background-color: gray;
    display: block;
}

.coverage-test-result-label:hover { 
    background-color: rgba(128, 128, 128, 0.5);
}

.coverage-test-group-container {
    margin: 2px;
    border: 1px solid black;
    border-radius: 2px;
    box-shadow: 1px;
    color: white;
}

.test-group-passed {
    padding-left: 5px;
    background-color: green;    
    display: block;
}

.test-group-passed:hover {
    background-color: rgba(0, 128, 0, 0.8);
}

.test-group-failed {
    padding-left: 5px;
    background-color: red;
    display: block;
}

.test-group-failed:hover {
    background-color: rgba(255, 0, 0, 0.7);
}

</style>