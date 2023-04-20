<template>
    <div class="testbench-container">
        <div class="testbench-config">
            <div class="testbench-config-editor">
                <aConfigStatusBar
                    class="testbench-config-status"
                    :statusMessage="configStatus"
                />

                <aEditorMonaco 
                    v-model="currentConfig"
                    :language="'json'"
                />
            </div>

            <div class="testbench-config-buttons">
                <aButtonBasic 
                    :btnLabel="'Reset Config'"
                    :btnClass="'reset-testbench-config-btn'"
                    :btnOnClick="'resetTestbenchConfigClicked'"
                    v-on:resetTestbenchConfigClicked="resetTestbenchConfig"
                />

                <aButtonBasic 
                    :btnLabel="'Save Config'"
                    :btnClass="'save-testbench-config-btn'"
                    :btnOnClick="'saveTestbenchConfigClicked'"
                    :btnActive="isConfigUpdated"
                    v-on:saveTestbenchConfigClicked="saveTestbenchConfig"
                />
            </div>
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
import { mapActions, mapGetters } from 'vuex';
import * as Api from '@/backend/Api';
import aEditorMonaco from '@/components/01_atoms/aEditorMonaco.vue';
import aConfigStatusBar from '@/components/01_atoms/aConfigStatusBar.vue';
import { TestbenchConfigEnum } from '@/util/enums';
import { getFormattedJsonString } from '@/util/helpers';

export default Vue.extend({
    name: 'oTestbench',
    components: {
        aButtonBasic,
        aConformanceTestElement,
        mTestCycleElement,
        aEditorMonaco,
        aConfigStatusBar    
    },
    props: {},
    created() {
        (this as any).conformanceResults = (this as any).getConformanceResults(((this as any).id));
        (this as any).config = getFormattedJsonString((this as any).getTestbenchConfig((this as any).id));
    },
    data() { 
        return {
            config: "{}",
            configStatus: TestbenchConfigEnum.INFO,
            conformanceResults: [],
            isLoading: false,
        } 
    },
    computed: {
        ...mapGetters('SidebarStore', [ 
            'getConformanceResults',
            'getTestbenchConfig', 
            'getTestbenchDefaultConfig' 
        ]),
        id() {
            return (this as any).$route.params.id;
        },
        isConfigUpdated() {
            try {
                return getFormattedJsonString((this as any).getTestbenchConfig((this as any).id)) 
                    !== getFormattedJsonString((this as any).config);
            } catch (error) {
                return false;
            }
        },
        currentConfig: {
            get(): string {
                return (this as any).config;
            },
            set(value: string) {
                (this as any).config = value;

                try {
                    JSON.parse((this as any).config);
                    (this as any).configStatus = (this as any).isConfigUpdated 
                        ? TestbenchConfigEnum.UNSAVED 
                        : TestbenchConfigEnum.INFO;
                } catch (error) {
                    (this as any).configStatus = TestbenchConfigEnum.ERROR;
                }
            }
        }
    },
    methods: {
        ...mapActions('SidebarStore', [ 'setConformanceResults', 'setTestbenchConfig' ]),
        fastTest() {
            console.log("Running fast test...");
            (this as any).isLoading = true;
            Api.fastTest()
                .then((res) => {
                    (this as any).conformanceResults = res.conformance!.results;
                    (this as any).setConformanceResults({ id: (this as any).id , results: (this as any).conformanceResults });
                    (this as any).isLoading = false;
                })
                .catch((error) => {
                    console.log("Error happened while fast testing...")
                    console.log(`Error: ${error}`);
                });
        },
        resetTestbenchConfig() {
            (this as any).config = getFormattedJsonString((this as any).getTestbenchDefaultConfig);

            if ((this as any).isConfigUpdated) {
                (this as any).configStatus = TestbenchConfigEnum.UNSAVED;
            } else {
                (this as any).configStatus = TestbenchConfigEnum.INFO;
            }
        },
        saveTestbenchConfig() {
            (this as any).setTestbenchConfig({ 
                id: (this as any).id, 
                config: JSON.parse((this as any).config)
            });
            (this as any).configStatus = TestbenchConfigEnum.SAVE_SUCCESS;
            setTimeout(() => {
                (this as any).configStatus = TestbenchConfigEnum.INFO;
            }, 1500);
        }
    }
});
</script>

<style scoped>

.fast-test-btn {
    padding: 2px;
    margin-right: 0;
        margin-bottom: 5px;
}

.reset-testbench-config-btn {
    width: 50%;
}

.save-testbench-config-btn {
    width: 50%;
    margin-right: 0;
}

.testbench-config {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    padding: 10px;
    border-right: 1px solid black;
    width: 50%;
}

.testbench-config-editor {
    height: 90%;
    overflow-y: hidden;
}

.testbench-config-buttons {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
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