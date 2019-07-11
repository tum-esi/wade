<template>
    <div class="td-page-container">
        <mTabbar :tabbarElements="getTdTabbar"/>
        <div class="td-main border-bottom">
            <div class="td-main-left border-right"> 
                <div class="url-container" v-if="showUrlBar">
                    <input  class="url-input" type="text" v-model="url" />
                    <button @click.prevent="fetchTdFromUrl" class="url-btn">Fetch Td</button>
                </div>
                
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
import { mapGetters } from 'vuex';
import oEditor from '@/components/03_organisms/oEditor.vue';
import oSelection from '@/components/03_organisms/oSelection.vue';
import oResults from '@/components/03_organisms/oResults.vue';
import mTabbar from '@/components/02_molecules/mTabbar.vue';
import aStatusbar from '@/components/01_atoms/aStatusbar.vue';

export default Vue.extend({
    name: 'tThingDescription',
    components: {
        oEditor,
        oSelection,
        oResults,
        mTabbar,
        aStatusbar
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
            url: ''
        };
    },
    computed: {
        ...mapGetters('TdStore', ['getTdTabbar']),
        id() {
            return this.$route.params.id;
        }
    },
    methods: {
        // ...mapMutations('SidebarStore', ['setNewCurrentTd']),
        tdChanged( message: string | any) {
            this.statusMessage = message;
        },
        tabClicked(args: any) {
            if (args.btnValue === 'td-url') {
                this.showUrlBar = true;
            }
        },
        async fetchTdFromUrl() {
            const fetchedTd = await fetch(this.url)
                .then((response) => {
                    return response.json();
                })
                .then((myJson) => {
                    return JSON.stringify(myJson);
                })
                .catch((err) => err);
            this.showUrlBar = false;
            this.$eventHub.$emit('fetched-td', fetchedTd);
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

.url-container {
    display: flex;
    align-items: center;
    height: 30px;
    width: 100%;
    padding-top: 5px;
}

.url-input {
    width: 80%;
    border: 1px solid #393B3A;
    padding: 3px;
    border-radius: 3px;
    height: 100%;
}

.url-btn {
    width: 20%;
    height: 100%;
    border-radius: 3px;
    outline: none;
    border: none;
    background: #b5dfdd;
    cursor: pointer;
    font-size: 14px;
    text-align: center;
    text-decoration: none;
    text-shadow: none;
    display: inline-block;
}
</style>
