<template>
    <div>
        <div id="title">
            <h1 class="shadow"><b>MAGE</b>: A WoT <b>Ma</b>shup <b>Ge</b>nerator</h1>
        </div>

        <div id="mage-container" class="flex-container">
            <div id="selection-container" class=".flex-container-column">
                <div id="select-mashup-container">
                    <aDropdownButton
                        class="shadow"
                        :class="'select-mashup-dropdown-btn'"
                        :btnLabel="'select Mashup'"
                        :btnKey="'select-mashup'"
                        :btnSrc="'add'"
                        :btnDropdownOptions="allMashups"
                        :btnStyle="'dropdown-container-mashup'"
                        v-on:dropdown-clicked="onDropdownOptionSelected"
                    />
                </div>

                <label class="label">
                    {{getCurrentMashup.id}}
                </label>
            </div>
            
            <div id="child-restrictions-container" class=".flex-container-column">

            </div>

        </div>
    </div>
    
</template>

<script lang="ts">
import Vue from 'vue';
import {mapState, mapGetters, mapActions, mapMutations } from 'vuex';
import {ElementTypeEnum} from '@/util/enums';
import aDropdownButton from '@/components/01_atoms/aDropdownButton.vue';
import { EventEmitter } from 'events';
import {Mashup} from '@/lib/classes';

export default Vue.extend({
    components: {
        aDropdownButton
    },

    data(){
        return {
            mashupData: {},
            currentValue: String,
            event: Object,
        }
    },

    computed: {
        ...mapGetters('SidebarStore', ['getSidebarElement']),
        ...mapGetters('MageStore', ['getCurrentMashup']),
        allMashups(){
            let mashups : any[] = (this as any).getSidebarElement({ type: ElementTypeEnum.MASHUP });
            let options: any[] = [];
            for(let mashup of mashups){
                options.push({title: mashup.id, key: mashup.id});
            }
            options.push({title: 'Add new mashup', key: 'add-new-mashup'});
            return options;
        } 
    },

    methods: {
        onDropdownOptionSelected(event) {
            this.event = event
            if(event.btnValue === 'add-new-mashup'){
                this.currentValue = event.btnValue;
            } else {
                let mashupData = (this as any).getSidebarElement({ id: event.btnValue });
            }
        }
    }
});
</script>

<style lang="less" scoped>
    h1 {
        text-align: center;
        vertical-align: middle;
        background-color: #b5dfdd;
    }

    #mage-container{
        width: 100%;
        height: 80%;
        margin: 2% 2% 2% 2%;
    }

    #selection-container {
        height: 100%;
        width: 33%;
    }

    #select-mashup-container {
        height: 8%;
        width: 80%;
        background: #b5dfdd;
    }

    #label-container {
        width: 100%;
        height: 20px;
        margin-left: 10px;
    }

    .shadow {
        box-shadow: 0 6px 5px 0 rgba(0, 0, 0, 0.19);
    }

    .label {
        width: 100%;
        height: 100%;
    }

    .flex-container {
        display: flex;
    }

    .flex-container-column {
        display: flex;
        flex-direction: column;
    }

</style>