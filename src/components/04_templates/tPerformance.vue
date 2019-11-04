<template>
    <div class="performance-container"> 
        <oSelection class="performance-child-container" :showButtons="'selection-btn-reset'"/>
        <oPerformanceOptions 
            class="performance-child-container"
            :selectedInteractionNames="getSelectionNames" 
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
import oPerformanceOptions from '@/components/03_organisms/oPerformanceOptions.vue';
import oPerformanceOutput from '@/components/03_organisms/oPerformanceOutput.vue';
import { StatusEnum } from '@/util/enums';
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
    name: 'tPerformance',
    components: {
        oSelection,
        oPerformanceOptions,
        oPerformanceOutput
    },
    data() {
        return {
            resultData: undefined as any,
            resultStatus: StatusEnum.NOT_STARTED
        };
    },
    computed: {
        ...mapGetters('TdStore', ['getSelections']),
        // Returns name of selected interactions
        getSelectionNames() {
            let arrOfSelectionNames: any[] = [];
            ((this as any).getSelections).forEach(element => {
                arrOfSelectionNames.push(element.interactionName);
            });
            return arrOfSelectionNames;
        }
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