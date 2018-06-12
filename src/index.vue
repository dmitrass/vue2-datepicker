<template>
  <div
    class="mx-datepicker"
    :class="{
      'mx-datepicker-range': range
    }"
    :style="{
      'width': computedWidth
    }"
    v-clickoutside="closePopup">
    <div class="mx-input-wrapper"
      @click="showPopup">
      <input class="mx-input"
        ref="input"
        type="text"
        :value="text"
        :placeholder="innerPlaceholder">
      <span class="mx-input-append">
        <slot name="mx-calendar-icon">
          <i class="mx-input-icon mx-calendar-icon"></i>
        </slot>
      </span>
      <span
        v-if="showClearIcon"
        class="mx-input-append mx-clear-wrapper"
        @click.stop="clearDate">
        <slot name="mx-clear-icon">
          <i class="mx-input-icon mx-clear-icon"></i>
        </slot>
      </span>
    </div>
    <div class="mx-datepicker-popup"
      :style="position"
      v-show="popupVisible"
      ref="calendar">
      <calendar-panel
        v-if="!range"
        v-bind="$attrs"
        :value="currentValue"
        :visible="popupVisible"
        @select-date="selectDate"
        @select-time="selectTime"></calendar-panel>
      <div class="mx-range-wrapper"
        v-else>
        <calendar-panel
          style="box-shadow:1px 0 rgba(0, 0, 0, .1)"
          v-bind="$attrs"
          :value="currentValue[0]"
          :end-at="currentValue[1]"
          :start-at="null"
          :visible="popupVisible"
          @select-date="selectStartDate"
          @select-time="selectStartTime"></calendar-panel>
        <calendar-panel
          v-bind="$attrs"
          :value="currentValue[1]"
          :start-at="currentValue[0]"
          :end-at="null"
          :visible="popupVisible"
          @select-date="selectEndDate"
          @select-time="selectEndTime"></calendar-panel>
      </div>
      <div class="mx-datepicker-footer"
        v-if="confirm">
        <button type="button"
          class="mx-datepicker-btn mx-datepicker-btn-confirm"
          @click="confirmDate"> {{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import CalendarPanel from './calendar.vue'
import { formatDate, isValidDate, isValidRange, isDateObejct } from './utils/index'
import clickoutside from './directives/clickoutside'

export default {
  name: 'DatePicker',
  components: { CalendarPanel },
  directives: {
    clickoutside
  },
  props: {
    value: null,
    placeholder: {
      type: 'String'
    },
    format: {
      type: String,
      default: 'yyyy-MM-dd'
    },
    range: {
      type: Boolean,
      default: false
    },
    rangeSeparator: {
      type: String,
      default: '~'
    },
    confirm: {
      type: Boolean,
      default: true
    },
    confirmText: {
      type: String,
      default: 'OK'
    },
    width: {
      type: [String, Number],
      default: null
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      currentValue: this.range ? [null, null] : null,
      popupVisible: false,
      position: {}
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: 'handleValueChange'
    },
    popupVisible (val) {
      if (val) {
        this.initCalendar()
      }
    }
  },
  computed: {
    innerPlaceholder () {
      return this.placeholder || '请输入'
    },
    text () {
      if (!this.range) {
        return isValidDate(this.value) ? this.stringify(this.value) : ''
      }
      return isValidRange(this.value)
        ? `${this.stringify(this.value[0])} ${this.rangeSeparator} ${this.stringify(this.value[1])}`
        : ''
    },
    computedWidth () {
      if (typeof this.width === 'number' || (typeof this.width === 'string' && /^\d+$/.test(this.width))) {
        return this.width + 'px'
      }
      return this.width
    },
    showClearIcon () {
      return this.clearable && (this.range ? isValidRange(this.value) : isValidDate(this.value))
    }
  },
  methods: {
    initCalendar () {
      this.handleValueChange(this.value)
      this.displayPopup()
    },
    stringify (date) {
      return formatDate(date, this.format)
    },
    dateEqual (a, b) {
      return isDateObejct(a) && isDateObejct(b) && a.getTime() === b.getTime()
    },
    rangeEqual (a, b) {
      return Array.isArray(a) && Array.isArray(b) && a.every((item, index) => this.dateEqual(item, b[index]))
    },
    confirmDate () {
      const valid = this.range ? isValidRange(this.currentValue) : isValidDate(this.currentValue)
      if (valid) {
        this.updateDate(true)
      }
      this.$emit('confirm', this.currentValue)
      this.closePopup()
    },
    updateDate (confirm = false) {
      if (this.confirm && !confirm) {
        return
      }
      const equal = this.range ? this.rangeEqual(this.value, this.currentValue) : this.dateEqual(this.value, this.currentValue)
      if (equal) {
        return
      }
      this.$emit('input', this.currentValue)
      this.$emit('change', this.currentValue)
    },
    handleValueChange (value) {
      if (!this.range) {
        this.currentValue = isValidDate(value) ? new Date(value) : null
      } else {
        this.currentValue = isValidRange(value) ? [new Date(value[0]), new Date(value[1])] : [null, null]
      }
    },
    clearDate () {
      const date = this.range ? [null, null] : null
      this.currentValue = date
      this.updateDate(true)
    },
    selectDate (date) {
      this.currentValue = date
      this.updateDate()
      this.closePopup()
    },
    selectStartDate (date) {
      this.$set(this.currentValue, 0, date)
      if (this.currentValue[1]) {
        this.updateDate()
      }
    },
    selectEndDate (date) {
      this.$set(this.currentValue, 1, date)
      if (this.currentValue[0]) {
        this.updateDate()
      }
    },
    selectTime (time) {
      this.currentValue = time
      this.updateDate()
    },
    selectStartTime (time) {
      this.selectStartDate(time)
    },
    selectEndTime (time) {
      this.selectEndDate(time)
    },
    showPopup () {
      this.popupVisible = true
    },
    closePopup () {
      this.popupVisible = false
    },
    displayPopup () {
      const dw = document.documentElement.clientWidth
      const dh = document.documentElement.clientHeight
      const InputRect = this.$el.getBoundingClientRect()
      const PopupRect = this.$refs.calendar.getBoundingClientRect()
      this.position = {}
      if (
        dw - InputRect.left < PopupRect.width &&
        InputRect.right < PopupRect.width
      ) {
        this.position.left = 1 - InputRect.left + 'px'
      } else if (InputRect.left + InputRect.width / 2 <= dw / 2) {
        this.position.left = 0
      } else {
        this.position.right = 0
      }
      if (
        InputRect.top <= PopupRect.height + 1 &&
        dh - InputRect.bottom <= PopupRect.height + 1
      ) {
        this.position.top = dh - InputRect.top - PopupRect.height - 1 + 'px'
      } else if (InputRect.top + InputRect.height / 2 <= dh / 2) {
        this.position.top = '100%'
      } else {
        this.position.bottom = '100%'
      }
    }
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
