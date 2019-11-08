<template>
    <div class="ouput-element-container">
        <div class="ouput-el-title">
            <label>{{ name }}</label>
        </div>
        <!-- Expendable body of output element -->
        <div class="output-el-body">
            <!-- All measurements with number of iteration -->
            <div class="all-measurements">
                <div class="all-measurements-title">
                    <label></label>
                </div>
                <div class="all-measurements-body">

                </div>
            </div>
            <!-- Actual results (e.g. WCET, BCET...) -->
            <div class="results">

            </div>
            <!-- Presetted options -->
            <div class="presets">
                <aOptionElement 
                    :firstElement="texts.outputSettingType"
                    :secondElement="'bla'"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aOptionElement from '@/components/01_atoms/aOptionElement.vue';

export default Vue.extend({
    name: 'mPerformanceOutputElement',
    components: {
        aOptionElement
    },
    props: {
        /**
         * Title of interaction
         */
       name: {
        //    type: String,
           required: true
       }
    },
    data() {
        return {
            texts: this.$store.state.TextStore.performance.performanceOutput,
            showOutputBody: false,
            showAllMeasurements: false
        };
    },
    methods: {

    }
});
</script>

<style scoped>

</style>
