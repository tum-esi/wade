<template>
    <div
        class="mashup-td-element-container"
        :class="{ 'isActiveTd': isActiveTd }"
        @click.prevent="showCurrentTd = !showCurrentTd"
    >
        <label class="mashup-td-label">{{ this.td.id }}</label>
        <img
            class="mashup-td-show-interactions-icon"
            @mouseover="interactionsHover = true"
            @mouseleave="interactionsHover = false"
            :src="showCurrentTd ? interactionsHover ? srcPathDropdownWhite : srcPathDropdown : interactionsHover ? srcPathDropdownClosedWhite : srcPathDropdownClosed"
            @click.stop="showCurrentTd = !showCurrentTd"
        />
        <img
          class="mashup-td-delete-icon"
          @mouseover="deleteHover = true"
          @mouseleave="deleteHover = false"
          :src="deleteHover ? srcPathDeleteWhite : srcPathDelete"
          v-on:click.stop="deleteBtnClicked"
        /> 
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import { ElementTypeEnum } from '../../util/enums';

export default Vue.extend({
  name: 'mMashupTdElement',
  props: {
    td: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
        interactionsHover: false,
        deleteHover: false,
        showCurrentTd: false,
        srcPathDropdown: require('@/assets/arrow_down.png'),
        srcPathDropdownClosed: require('@/assets/arrow_right.png'),
        srcPathDropdownWhite: require('@/assets/arrow_down_white.png'),
        srcPathDropdownClosedWhite: require('@/assets/arrow_right_white.png'),
        srcPathDelete: require('@/assets/delete.png'),
        srcPathDeleteWhite: require('@/assets/delete_white.png')
    };
  },
  computed: {
    isActiveTd(): boolean {
      // TODO: check if This Td is active clicked td
      return true;
    }
  },
  methods: {
    deleteBtnClicked() {
      this.$emit('delete-element', this.td.id, ElementTypeEnum.TD);
    },
  }
});
</script>

<style scoped>
.mashup-td-element-container {
    height: 50px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    background: #939c9e;
    border-top: 1px solid #393B3A;
}

.mashup-td-element-container:hover {
    background: #1234;
}

.mashup-td-label {
  width: 100%;
  overflow: hidden;
}

.mashup-td-show-interactions-icon {
    padding: 10px;
    height: 40px;
    width: 40px;
}

.mashup-td-delete-icon {
  padding: 7px 5px 7px 0px;
  max-height: 40px;
  max-width: 40px;
  object-fit: contain;
}
</style>
