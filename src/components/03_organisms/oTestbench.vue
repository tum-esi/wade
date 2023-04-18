<template>
    <div class="testbench-container">
        <div class="testbench-config">
            <aEditorMonaco 
                :code="'{}'"
                :language="'json'"
            />
        </div>
        <div class="testbench-results">
            <aButtonBasic 
                :btnLabel="isLoading ? 'Testing...' : 'Fast Test'"
                :btnClass="'fast-test-btn'"
                :btnOnClick="'fastTestClicked'"
                :btnActive="!isLoading"
                v-on:fastTestClicked="fastTest"
            />

            <div class="conformance-results">
                <div class="conformance-results-header">
                    <p> Conformance Results </p>
                    <hr/>
                </div>

                <div class="conformance-results-body">
                    <mTestCycleElement 
                        v-for="(element, index) in conformanceResults"
                        :key="index"
                        :scenarios="element"
                    />
                </div>
            </div>
            <div class="vulnerability-results">
                <p> Vulnerability Results </p>
                <hr/>
            </div>
        </div>
        
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aConformanceTestElement from '@/components/01_atoms/aConformanceTestElement.vue';
import mTestCycleElement from '@/components/02_molecules/mTestCycleElement.vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue'
import { mapGetters } from 'vuex';
import * as Api from '@/backend/Api';
import aEditorMonaco from '@/components/01_atoms/aEditorMonaco.vue';

export default Vue.extend({
    name: 'oTestbench',
    components: {
    aButtonBasic,
    aConformanceTestElement,
    mTestCycleElement,
    aEditorMonaco
},
    props: {},
    data() { return {
        conformanceResults: [],
        isLoading: false,
    } },
    computed: {
        ...mapGetters('TdStore', [
           'getTdParsed'
        ]),
    },
    methods: {
        fastTest() {
            console.log("Running fast test...");
            this.isLoading = true;
            Api.fastTest()
                .then((res) => {
                    this.conformanceResults = res.conformance!.results;
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.log("Error happened while fast testing...")
                    console.log(`Error: ${error}`);
                });
        }
    }
});
</script>

<style scoped>

.passed-test {
    background-color: green;
}

.fast-test-btn {
    padding: 2px;
    margin-right: 0;
    margin-bottom: 5px;
}

.testbench-config {
    padding: 3px;
    border-right: 1px solid black;
    width: 50%;
}

.testbench-results {
    display: flex;
    flex-direction: column;
    width: 50%;
    padding: 5px;
}

.conformance-results {
    padding: 0 5px 5px 5px;
    height: 50%;
    overflow-y: scroll;
}

.conformance-results-header {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: #b4bab9;
}

.vulnerability-results {
    padding: 0 5px 5px 5px;
    height: 50%;
}

.testbench-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
}

</style>