<template>
    <div class="vthing-container">

         <div class="vthing-header">
             <div class="vthing-label-link">
                <label>Start a Virtual thing within W-ADE</label> <br>
                <a v-if="getVtStatus(id).active" @click="openVtTd" class="vt-link-to-http" href="#" title="open Td in Browser">{{ getVtLink(id).link }}</a>
             </div>
             <aDropdownButton
                v-if="getVtStatus(id).active"
                btnKey="copy-vt-link"
                btnFaIcon="fa-copy fa-2x"
                btnTitle="Copy Address of Virtual Thing"
                :btnDropdownOptions="getVtLink(id).copyLinks"
                btnStyle="dropdown-custom-vt"
                class="style-aDropdownButton"
            />
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
import { getFormattedJsonString } from '@/util/helpers';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aOutputBar from '@/components/01_atoms/aOutputBar.vue';
import aVirtualThingStatusbar from '@/components/01_atoms/aVirtualThingStatusbar.vue';
import { setTimeout } from 'timers';
import { shell, clipboard } from 'electron';

export default Vue.extend({
    name: 'oVirtualThing',
        components: {
        aDropdownButton,
        aButtonBasic,
        aOutputBar,
        aVirtualThingStatusbar
    },
    data() {
        return {
            vstatusmessage: '',
            createVtBtn: {
                btnLabel: 'Create a Virtual Thing',
                btnClass: 'btn-config-small',
                btnOnClick: 'create-vt'
            },
            removeVtBtn: {
                btnLabel: 'Stop the Virtual Thing',
                btnClass: 'btn-config-small',
                btnOnClick: 'remove-vt'
            }
        };
    },
    created() {
        this.$eventHub.$on('dropdown-clicked', (eventObject) => {this.copyLinksToClipboard(eventObject); });
    },
    beforeDestroy() {
        this.$eventHub.$off('dropdown-clicked');
    },
    computed: {
        ...mapGetters('SidebarStore',
                ['getVirtualConfig', 'getSavedTd', 'getVtOutputMsg', 'getVtLink',
                 'getVtStatus', 'getConfig', 'getProtocols']),
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

            /* check which TdState the saved Td results in */
            (this as any).processChangedTd({
                td: TdSaved,
                config: JSON.parse((this as any).getConfig(this.id)),
                protocols: (this as any).getProtocols(this.id)
            });
            ReqTdState = (this as any).getTdState;

            await (this as any).addVt({id: this.id, VtConfig: VtConf, GivenTd: TdSaved, TdState: ReqTdState});

        },
        async removeVirtualThingBtnClicked() {
            await (this as any).remVt({id: this.id});
        },
        async openVtTd() {
            shell.openExternal((this as any).getVtLink(this.id).link);
        },
        copyLinksToClipboard(eventObject) {
            if (eventObject.btnKey === 'copy-vt-link') {
                clipboard.writeText(eventObject.btnValue);
            } else {
                // event not relevant for this function
            }
        }
    }
});
</script>


<style scoped>

.vthing-container {
    height: 100%;
    width: 65%;
    display: block;
    padding: 10px 12px 10px 12px;
}


.vthing-header {
    width:100%;
    height: 10%;
    justify-content: space-between;
    display: flex;
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

.vthing-label-link {
    width: 80%;
}

.style-aDropdownButton{
    position: relative;
}

.vt-link-to-http {
    color: rgb(181, 223, 221);
}

.vt-link-to-http:hover {
    color: white;
}

</style>
