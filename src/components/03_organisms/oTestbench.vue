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
                :btnLabel="isFastTestLoading ? 'Testing...' : 'Fast Test'"
                :btnClass="'fast-test-btn'"
                :btnOnClick="'fastTestClicked'"
                :btnActive="!isFastTestLoading"
                v-on:fastTestClicked="fastTest"
            />

            <div class="conformance-test results-container">
                <div class="results-header">
                    <aButtonBasic 
                        :btnLabel="isConformanceTestLoading ? 'Testing...' : 'Test Conformance'"
                        :btnClass="'conformance-test-btn'"
                        :btnOnClick="'conformanceTestClicked'"
                        :btnActive="!isConformanceTestLoading"
                        v-on:conformanceTestClicked="testConformance"
                    />
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
            <div class="vulnerability-test results-container">
                <div class="results-header">
                    <aButtonBasic 
                        :btnLabel="isVulnerabilityTestLoading ? 'Testing...' : 'Test Vulnerability'"
                        :btnClass="'vulnerability-test-btn'"
                        :btnOnClick="'vulnerabilityTestClicked'"
                        :btnActive="!isVulnerabilityTestLoading"
                        v-on:vulnerabilityTestClicked="testVulnerability"
                    />
                    <p> Vulnerability Results </p>
                    <hr/>
                </div>

                <div
                    v-if="vulnerabilityResults"
                >
                    <mVulnerabilityTestContainer
                        v-if="vulnerabilityResults.propertyReports"
                        :key="'property'"
                        :reportArray="vulnerabilityResults.propertyReports"
                        :interactionNameKey="'propertyName'"
                    />

                    <mVulnerabilityTestContainer
                        v-if="vulnerabilityResults.actionReports"
                        :key="'action'"
                        :reportArray="vulnerabilityResults.actionReports"
                        :interactionNameKey="'actionName'"
                    />

                    <mVulnerabilityTestContainer
                        v-if="vulnerabilityResults.eventReports"
                        :key="'event'"
                        :reportArray="vulnerabilityResults.eventReports"
                        :interactionNameKey="'eventName'"
                    />
                </div>
            </div>
            <div class="coverage-test results-container">
                <div class="results-header">
                    <aButtonBasic 
                        :btnLabel="isCoverageTestLoading ? 'Testing...' : 'Test All Levels'"
                        :btnClass="'test-all-levels-btn'"
                        :btnOnClick="'testAllLevelsClicked'"
                        :btnActive="!isCoverageTestLoading"
                        v-on:testAllLevelsClicked="testAllLevels"
                    />
                    <p> Coverage Results </p>
                    <hr/>
                </div>
                <div class="coverage-results-body">
                    <mCoverageTestGroup
                        v-for="(element, index) in coverageResults"
                        :key="index"
                        :coverageName="index"
                        :interactions="element"
                    />
                </div>
                
            </div>
        </div>
        
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import mTestCycleElement from '@/components/02_molecules/mTestCycleElement.vue';
import mVulnerabilityTestContainer from '@/components/02_molecules/mVulnerabilityTestContainer.vue';
import aEditorMonaco from '@/components/01_atoms/aEditorMonaco.vue';
import aConfigStatusBar from '@/components/01_atoms/aConfigStatusBar.vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import mCoverageTestGroup from '@/components/02_molecules/mCoverageTestGroup.vue';
import { mapActions, mapGetters } from 'vuex';
import * as Api from '@/backend/Api';
import { TestbenchConfigEnum } from '@/util/enums';
import { getFormattedJsonString } from '@/util/helpers';

export default Vue.extend({
    name: 'oTestbench',
    components: {
        aButtonBasic,
        mTestCycleElement,
        aEditorMonaco,
        aConfigStatusBar,
        mVulnerabilityTestContainer,
        mCoverageTestGroup, 
    },
    props: {},
    created() {
        (this as any).conformanceResults = (this as any).getConformanceResults((this as any).id);
        (this as any).vulnerabilityResults = (this as any).getVulnerabilityResults((this as any).id);
        (this as any).coverageResults = (this as any).getCoverageResults((this as any).id);
        (this as any).config = getFormattedJsonString((this as any).getTestbenchConfig((this as any).id));
    },
    data() { 
        return {
            config: "{}",
            configStatus: TestbenchConfigEnum.INFO,
            conformanceResults: [],
            vulnerabilityResults: [],
            coverageResults: [],
            isFastTestLoading: false,
            isConformanceTestLoading: false,
            isVulnerabilityTestLoading: false,
            isCoverageTestLoading: false,
        } 
    },
    computed: {
        ...mapGetters('SidebarStore', [ 
            'getConformanceResults',
            'getVulnerabilityResults',
            'getCoverageResults',
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
        ...mapActions('SidebarStore', [ 
            'setConformanceResults', 
            'setVulnerabilityResults',
            'setCoverageResults',
            'setTestbenchConfig' 
        ]),
        fastTest() {
            (this as any).isFastTestLoading = true;
            Api.fastTest()
                .then((res) => {
                    (this as any).conformanceResults = res.conformance!.results;
                    (this as any).setConformanceResults({ id: (this as any).id , results: (this as any).conformanceResults });
                    (this as any).vulnerabilityResults = res.vulnerabilities;
                    (this as any).setVulnerabilityResults({ id: (this as any).id, results: (this as any).vulnerabilityResults });
                })
                .catch((error) => {
                    console.log("Error happened while fast testing...")
                    console.log(`Error: ${error}`);
                })
                .finally(() => {
                    (this as any).isFastTestLoading = false;
                });
        },
        testConformance() {
            (this as any).isConformanceTestLoading = true;
            Api.testConformance(JSON.parse((this as any).getTestbenchConfig((this as any).id)))
                .then((res) => {
                    (this as any).conformanceResults = res.results;
                    (this as any).setConformanceResults({ id: (this as any).id , results: (this as any).conformanceResults });
                })
                .catch((error) => {
                    console.log("Error happened while conformance testing...")
                    console.log(`Error: ${error}`);
                })
                .finally(() => {
                    (this as any).isConformanceTestLoading = false;
                });
        },
        testVulnerability() {
            (this as any).isVulnerabilityTestLoading = true;
            Api.testVulnerability(JSON.parse((this as any).getTestbenchConfig((this as any).id)))
                .then((res) => {
                    (this as any).vulnerabilityResults = res;
                    (this as any).setVulnerabilityResults({ id: (this as any).id, results: (this as any).vulnerabilityResults });
                })
                .catch((error) => {
                    console.log("Error happened while vulnerability testing...")
                    console.log(`Error: ${error}`);
                })
                .finally(() => {
                    (this as any).isVulnerabilityTestLoading = false;
                });
        },
        testAllLevels() {
            (this as any).isCoverageTestLoading = true;
            Api.testAllLevels(JSON.parse((this as any).getTestbenchConfig((this as any).id)))
                .then((res) => {
                    (this as any).coverageResults = res;
                    (this as any).setCoverageResults({ id: (this as any).id, results: (this as any).coverageResults });
                    console.log(res);
                })
                .catch((error) => {
                    console.log("Error happened while coverage testing...")
                    console.log(`Error: ${error}`);
                })
                .finally(() => {
                    (this as any).isCoverageTestLoading = false;
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

.conformance-test-btn {
    display: block;
    width: 100%;
    padding: 2px;
    margin-right: 0;
    margin-bottom: 5px;
}

.vulnerability-test-btn {
    display: block;
    width: 100%;
    padding: 2px;
    margin-right: 0;
    margin-bottom: 5px;
}

.test-all-levels-btn {
    display: block;
    width: 100%;
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

.results-container {
    margin-top: 5px;
    padding: 0px 5px 5px 5px;
    height: 30%;
    overflow-y: scroll;
}

.results-header {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: #b4bab9;
}

.testbench-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
}

</style>