<template>
    <div class="vthing-container">

         <div class="vthing-header">
            <label>Start a Virtual thing within W-ADE</label> <br>
            <a v-if="getVtStatus(id).active" @click="openVtTd" href="#" title="open Td in Browser">{{ VtLink }}</a>
        </div>

        <div class="vthing-status">
                <aVirtualThingStatusbar :StatusMessage="getVtStatus(id)" />
        </div>

        <div class="vthing-btns">
            <aButtonBasic
                @create-vt="createVirtualThingBtnClicked"
                :btnClass="createVtBtn.btnClass"
                :btnLabel="createVtBtn.btnLabel"
                :btnOnClick="createVtBtn.btnOnClick"
                :btnActive="!getVtStatus(id).active"
            />
            <aButtonBasic 
                @remove-vt="removeVirtualThingBtnClicked"
                :btnClass="removeVtBtn.btnClass"
                :btnLabel="removeVtBtn.btnLabel"
                :btnOnClick="removeVtBtn.btnOnClick"
                :btnActive="getVtStatus(id).active"
            />
        </div>

        <div class="vthing-output">
            <aOutputBar :outputMessages="getVtOutputMsg(id)" class="outNorm" />
        </div> 
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapMutations, mapActions } from 'vuex';
import { TdVirtualConfigEnum, TdStateEnum } from '@/util/enums';
import { getFormattedJsonString, loggingInfo } from '@/util/helpers';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aOutputBar from '@/components/01_atoms/aOutputBar.vue';
import aVirtualThingStatusbar from '@/components/01_atoms/aVirtualThingStatusbar.vue';
import { setTimeout } from 'timers';
import { shell } from 'electron';

export default Vue.extend({
    name: 'oVirtualThing',
        components: {
        aButtonBasic,
        aOutputBar,
        aVirtualThingStatusbar
    },
    created() {
        this.isVtActive = (this as any).getVtStatus.active;
    },
    data() {
        return {
            vstatusmessage: '',
            isVtActive: false,
            VtLink: '',
            createVtBtn: {
                btnLabel: 'Create a virtual thing',
                btnClass: 'btn-config-small',
                btnOnClick: 'create-vt'
            },
            removeVtBtn: {
                btnLabel: 'Stop the virtual thing',
                btnClass: 'btn-config-small',
                btnOnClick: 'remove-vt'
            }
        };
    },
    computed: {
        ...mapGetters('SidebarStore',
                ['getVirtualConfig', 'getSavedTd', 'getVtOutputMsg', 'getVtStatus', 'getConfig', 'getProtocols']),
        ...mapGetters('TdStore', ['getTdState']),
        id() {
            return this.$route.params.id;
        },
    },
    methods: {
        ...mapActions('SidebarStore', ['addVt', 'remVt']),
        ...mapActions('TdStore', ['processChangedTd']),
        async createVirtualThingBtnClicked() {
            const VtConf = (this as any).getVirtualConfig(this.id);
            const TdSaved = (this as any).getSavedTd(this.id);
            let ReqTdState: TdStateEnum;
            let VtConfAdr = '';
            let VtConfPort = 0;
            let VtConfTitle = '';

            /* check which TdState the saved Td results in */
            (this as any).processChangedTd({
                td: TdSaved,
                config: JSON.parse((this as any).getConfig(this.id)),
                protocols: (this as any).getProtocols(this.id)
            });
            ReqTdState = (this as any).getTdState;

            await (this as any).addVt({id: this.id, VtConfig: VtConf, GivenTd: TdSaved, TdState: ReqTdState});
            this.isVtActive = (this as any).getVtStatus(this.id).active;

            // TODO add links for different protocols
            // set link to the virtual thing
            try {
                const VtConfParsed = JSON.parse(VtConf);
                const TdParsed = JSON.parse(TdSaved);
                VtConfAdr = VtConfParsed.servient.staticAddress;
                VtConfPort = VtConfParsed.servient.http.port;
                VtConfTitle = TdParsed.title;
            } catch (err) {
                loggingInfo(err);
            }
            this.VtLink = 'http://' + VtConfAdr + ':' + VtConfPort.toString() + '/' + VtConfTitle;
        },
        async removeVirtualThingBtnClicked() {
            await (this as any).remVt({id: this.id});
            this.isVtActive = (this as any).getVtStatus(this.id).active;
        },
        async openVtTd() {
            shell.openExternal(this.VtLink);
        }
    },
    watch: {
        // Check if router id changed
        '$route.params.id'(id) {
            this.isVtActive = (this as any).getVtStatus(this.id).active;
        }
    }
});
</script>


<style scoped>

.vthing-container {
    height: 100%;
    width: 50%;
    display: block;
    padding: 10px 12px 10px 12px;
}


.vthing-header {
    width:300px;
    height: 10%;
    justify-content: space-between;
}

.vthing-header label {
    font-size: 16px;
    padding-right: 7px;
}

.vthing-status {
    height: 13%;
    width: 90%;
}

.vthing-btns {
    height: 10%;
    width: 90%;
    padding-top: 7px;
    display: flex;
    justify-content: space-between;
}

.vthing-output{
    height: 70%;
    padding-top: 10px;
}

.outNorm {
    width: 95%;
    height: 100%;
    background-color: darkgrey;
}

.active-status{
    background-color: lightgreen;
}

</style>
