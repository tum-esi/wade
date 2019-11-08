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
            const arrOfSelectionNames: any[] = [];
            ((this as any).getSelections).forEach(element => {
                arrOfSelectionNames.push(element.interactionName);
            });
            return arrOfSelectionNames;
        }
    },
    methods: {
        ...mapActions('TdStore', ['getPerformancePrediction']),
        startPerformancePrediction(settings) {
            const {BrowserWindow} = require('electron');

            const win = BrowserWindow.getAllWindows()[0];
            const ses = win.webContents.session;

            ses.clearCache(() => {
            alert("Cache cleared!");
            });
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
            const storage = require('electron-json-storage');
            storage.set(`${measurements[0].name}_${new Date()}`, measurements[0], function(error) {
                if (error) throw error;
            });

            storage.getAll(function(error, data) {
            if (error) throw error;
            
            console.log('ALL: ', data);
            const dataPath = storage.getDataPath();
            console.log(dataPath);
            });
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