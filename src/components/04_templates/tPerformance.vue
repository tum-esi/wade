<template>
    <div class="performance-container"> 
        <oSelection class="performance-child-container"/>
        <oPerformanceSelection 
            class="performance-child-container"
            :selectedInteractions="selectedInteractions" 
            @start-measurement="startPerformancePrediction"
        />
        <oPerformanceOutput 
            class="performance-child-container"
            :resultStatus="resultStatus"
            :resultData="resultData"
            @save-measurements="saveMeasurements"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import oSelection from '@/components/03_organisms/oSelection.vue';
import oPerformanceSelection from '@/components/03_organisms/oPerformanceSelection.vue';
import oPerformanceOutput from '@/components/03_organisms/oPerformanceOutput.vue';
import { StatusEnum } from '@/util/enums';
import { mapActions } from 'vuex';

export default Vue.extend({
    name: 'tPerformance',
    components: {
        oSelection,
        oPerformanceSelection,
        oPerformanceOutput
    },
    data() {
        return {
            resultData: undefined as any,
            resultStatus: StatusEnum.NOT_STARTED,
            // TODO: just a mock, give real interactions later
            selectedInteractions: [
                { title: 'exampleInteraction' }
            ]
        };
    },
    methods: {
        ...mapActions('TdStore', ['getPerformancePrediction']),
        startPerformancePrediction(settings) {
            this.resultStatus = StatusEnum.LOADING;
            this.resultData = (this as any).getPerformancePrediction(settings)
                .then((res) => {
                    this.resultStatus = StatusEnum.COMPUTED;
                    return res;
                })
                .catch((err) => {
                    this.resultStatus = StatusEnum.ERROR;
                    return err;
                });
        },
        saveMeasurements(measurements) {
            // TODO: save measurements
            // console.log('measurements saved');
        }
    }
});
</script>

<style scoped>
.performance-container {
    height: 100%;
    width: 100%;
    display: flex;
}

.performance-child-container {
    width: 33.33%;
    padding: 0px 7px 7px 7px;
}

</style>