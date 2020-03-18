<template>
    <div class="outputbar-container border-bottom">
        <div class="output-bar">
            <div v-for="msg in outputMessages" class="output-tr" :key="msg.time.full">

                <div class="output-td-upper-bar">
                    <div class="output-td-t-i">
                        <div class="output-td-t">{{ msg.time.h }}:{{ msg.time.m }}:{{ msg.time.s }}</div>

                        <div v-if="msg.isError" class="output-td-e" title="There is a Problem!">
                            <i class="fa fa-exclamation-triangle"></i>
                        </div>

                        <div v-if="msg.isProgram" class="output-td-p" title="Output of Virtual Thing">
                            <i class="fa fa-terminal"></i>
                        </div>

                        <div v-if="msg.isVtAction" class="output-td-i" title="Action">
                            <i class="fa fa-rocket"></i>
                        </div>
                        <div v-else-if="msg.isVtPropertyRead" class="output-td-i" title="Property Read">
                            <i class="fa fa-database"></i>
                        </div>
                        <div v-else-if="msg.isVtPropertyWrite" class="output-td-i" title="Property Write">
                            <i class="fa fa-edit"></i>
                        </div>
                        <div v-else-if="msg.isVtEvent" class="output-td-i" title="Event">
                            <i class="fa fa-flash"></i>
                        </div>
                    </div>
                    <div class="output-td-fill">
                    </div>
                </div>
                <div class="output-td-c">{{ msg.content }}</div>
                
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import '@/assets/font-awesome-4.7.0/css/font-awesome.min.css';

export default Vue.extend({
    name: 'aOutputBar',
    props: {
        outputMessages: {
            type: Array
            }
    }
});
</script>

<style scoped>
.output-container {
    display: flex;
    align-items: center;
    padding: 7px;
    font-size: 12px;
    color: #000000;
    border: 1px solid #393B3A;
    border-bottom: none;
    width: 100%;
    height: 100%;
}

.output-bar {
    font-weight: lighter;
    overflow-wrap: break-word;
    overflow-x: hidden;
    overflow-y: auto;
    display: block;
    width: 100%;
    height: 100%;
    border-spacing: 0;
}

.output-tr td{
    vertical-align: middle;
}

.output-tr {
    border: solid black 1px;
    border-radius: 8px;
    margin-top: 8px;
}

.fa {
    padding: 2px;
}

.output-td-t-i {
    display: inline-flex;
    vertical-align: middle;
}


.output-td-upper-bar{
    width: 100%;
    display: inline-flex;
    background-color: #939C9E;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.output-td-t {
    padding: 4px;
    text-align: center;
    vertical-align: middle;
    border-top-left-radius: 8px;
}

.output-td-e {
    color: #A36A5B;
}

.output-td-p, .output-td-i, .output-td-e {
    border-left: black solid 1px;
    padding: 4px;
}

.output-td-i {
    padding: 4px;
    border-left: black 1px solid;
}

.output-td-fill{
    width: 100%;
    float: left;
    border-top-right-radius: 8px;
}

.output-td-c {
    padding: 4px;
    background-color: #b5dfdd;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
}



</style>
