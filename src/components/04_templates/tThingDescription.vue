<template>
    <div class="td-page-container">
        <mTabbar :tabbarElements="getTdTabbar"/>
        <div class="td-main border-bottom">
            <div class="td-main-left border-right"> 
                <mUrlBar 
                    v-if="showUrlBar" 
                    class="url-bar" 
                    :button="fetchButton"
                    :buttonAction="fetchFunction"
                    v-on:btn-clicked="tdChanged"
                    />
                <oEditor :id="id" v-on:td-changed="tdChanged"/>
            </div>
            <div class="td-main-middle border-right"> 
                <oSelection />
            </div>
            <div class="td-main-right"> 
                <oResults />
            </div>
        </div>
        <aStatusbar class="td-page-statusbar" :statusMessage="statusMessage"/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import aStatusbar from '@/components/01_atoms/aStatusbar.vue';
import mTabbar from '@/components/02_molecules/mTabbar.vue';
import mUrlBar from '@/components/02_molecules/mUrlBar.vue';
import oEditor from '@/components/03_organisms/oEditor.vue';
import oSelection from '@/components/03_organisms/oSelection.vue';
import oResults from '@/components/03_organisms/oResults.vue';
import { Url } from 'url';
import { TdStateEnum } from '../../util/enums';
import { ftruncate } from 'fs';

export default Vue.extend({
    name: 'tThingDescription',
    components: {
        aStatusbar,
        oEditor,
        oSelection,
        oResults,
        mTabbar,
        mUrlBar
    },
    created() {
        this.$eventHub.$on('dropdown-clicked', this.tabClicked);
    },
    beforeDestroy() {
        this.$eventHub.$off('dropdown-clicked');
    },
    data() {
        return {
            statusMessage: '',
            showUrlBar: false,
            fetchButton: {
                btnLabel: 'Fetch Td',
                btnClass: 'btn-url-bar',
                btnOnClick: 'btn-clicked'
            },
            async fetchFunction(url: string) {
                let td: null | string = null;
                let errorMsg: null | string  = null;
                let tdState: null | TdStateEnum = null;
                const fetchedTd = await fetch(url)
                .then((response) => {
                        return response.json();
                })
                .then((myJson) => {
                    td =  JSON.stringify(myJson);
                    tdState = TdStateEnum.VALID_TD_FETCHED;
                    return {
                        td,
                        tdState,
                        errorMsg
                    };
                })
                .catch((err) => {
                    errorMsg = err;
                    tdState = TdStateEnum.INVALID_TD_FETCHED;
                    td = null;
                    return {
                        td,
                        tdState,
                        errorMsg
                    };
                });
                this.$eventHub.$emit('fetched-td', fetchedTd);
            }
        };
    },
    computed: {
        ...mapGetters('TdStore', ['getTdTabbar']),
        id() {
            return this.$route.params.id;
        }
    },
    methods: {
        tdChanged() {
            if (this.showUrlBar) this.showUrlBar = false;
        },
        tabClicked(args: any) {
            if (args.btnValue === 'td-url') {
                this.showUrlBar = true;
            }
        }
    }
});
</script>

<style scoped>
.td-page-container {
    display: flex;
    flex-direction: column;
}

.td-main {
    display: flex;
    min-height: 500px;
    }


.td-main-left {
    width: 33%;
    padding: 0px 7px 7px 7px;
}

.td-main-middle {
    width: 33%;
    padding: 0px 7px 7px 7px;
}

.td-main-right {
    width: 33%;
    padding: 0px 7px 7px 7px;
}

.url-bar{
    height: 30px;
    width: 100%;
}
</style>
