<template>
    <div
        class="mashup-element-container"
        :class="{ 'isActiveTd': isActiveTd }"
        @click.prevent="showCurrentTd = !showCurrentTd"
    >
        <label class="mashup-element-label">{{ this.element.id }}</label>
        <img
            class="mashup-element-show-interactions-icon"
            @mouseover="interactionsHover = true"
            @mouseleave="interactionsHover = false"
            :src="showCurrentTd ? interactionsHover ? srcPathDropdownWhite : srcPathDropdown : interactionsHover ? srcPathDropdownClosedWhite : srcPathDropdownClosed"
            @click.stop="showCurrentTd = !showCurrentTd"
        />
        <img
          class="mashup-element-delete-icon"
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
  name: 'mMashupElement',
  props: {
    element: {
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
      this.$emit('delete-element', this.element.id, this.element.type);
    },
  }
});
</script>

<style scoped>
.mashup-element-container {
    height: 50px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    background: #939c9e;
    border-top: 1px solid #393B3A;
}

.mashup-element-container:hover {
    background: #1234;
}

.mashup-element-label {
  width: 100%;
  overflow: hidden;
}

.mashup-element-show-interactions-icon {
    padding: 10px;
    height: 40px;
    width: 40px;
}

.mashup-element-delete-icon {
  padding: 7px 5px 7px 0px;
  max-height: 40px;
  max-width: 40px;
  object-fit: contain;
}
</style>
