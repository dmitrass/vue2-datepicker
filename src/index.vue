<template>
  <div
    class="mx-datepicker"
    :class="{
      'mx-datepicker-range': range,
      'disabled': disabled
    }"
    :style="{
      'width': computedWidth
    }"
    v-clickoutside="closePopup">
    <div class="mx-input-wrapper"
      @click="showPopup">
      <input
        :class="inputClass"
        ref="input"
        type="text"
        :name="inputName"
        :disabled="disabled"
        :readonly="!editable"
        :value="text"
        :placeholder="innerPlaceholder"
        @input="handleInput"
        @change="handleChange">
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
        <div class="mx-shortcuts-wrapper"
          v-if="innnerShortcuts.length">
          <span
            class="mx-shortcuts"
            v-for="(range, index) in innnerShortcuts"
            :key="index"
            @click="selectRange(range)">{{range.text}}</span>
        </div>
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
import fecha from 'fecha'
import CalendarPanel from './calendar.vue'
import { isValidDate, isValidRange, isDateObejct } from './utils/index'
import clickoutside from './directives/clickoutside'
import { use, t } from './locale/index'

export default {
  name: 'DatePicker',
  components: { CalendarPanel },
  directives: {
    clickoutside
  },
  props: {
    value: null,
    placeholder: {
      type: String,
      default: null
    },
    lang: {
      type: [String, Object],
      default: 'zh'
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    range: {
      type: Boolean,
      default: false
    },
    rangeSeparator: {
      type: String,
      default: '~'
    },
    width: {
      type: [String, Number],
      default: null
    },
    confirmText: {
      type: String,
      default: 'OK'
    },
    confirm: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    shortcuts: {
      type: [Boolean, Array],
      default: true
    },
    inputName: {
      type: String,
      default: 'date'
    },
    inputClass: {
      type: [String, Array],
      default: 'mx-input'
    }
  },
  data () {
    return {
      currentValue: this.range ? [null, null] : null,
      userInput: null,
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
      } else {
        this.userInput = null
      }
    }
  },
  computed: {
    innerPlaceholder () {
      if (typeof this.placeholder === 'string') {
        return this.placeholder
      }
      return this.range ? t('placeholder.dateRange') : t('placeholder.date')
    },
    text () {
      if (this.userInput !== null) {
        return this.userInput
      }
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
      return !this.disabled && this.clearable && (this.range ? isValidRange(this.value) : isValidDate(this.value))
    },
    innnerShortcuts () {
      if (Array.isArray(this.shortcuts)) {
        return this.shortcuts
      }
      if (this.shortcuts === false) {
        return []
      }
      const pickers = t('pickers')
      const arr = [
        {
          text: pickers[0],
          start: new Date(),
          end: new Date(Date.now() + 3600 * 1000 * 24 * 7)
        },
        {
          text: pickers[1],
          start: new Date(),
          end: new Date(Date.now() + 3600 * 1000 * 24 * 30)
        },
        {
          text: pickers[2],
          start: new Date(Date.now() - 3600 * 1000 * 24 * 7),
          end: new Date()
        },
        {
          text: pickers[3],
          start: new Date(Date.now() - 3600 * 1000 * 24 * 30),
          end: new Date()
        }
      ]
      return arr
    }
  },
  created () {
    use(this.lang)
  },
  methods: {
    initCalendar () {
      this.handleValueChange(this.value)
      this.displayPopup()
    },
    stringify (date) {
      return fecha.format(date, this.format)
    },
    dateEqual (a, b) {
      return isDateObejct(a) && isDateObejct(b) && a.getTime() === b.getTime()
    },
    rangeEqual (a, b) {
      return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, index) => this.dateEqual(item, b[index]))
    },
    selectRange (range) {
      this.currentValue = [ new Date(range.start), new Date(range.end) ]
      this.updateDate(true)
    },
    clearDate () {
      const date = this.range ? [null, null] : null
      this.currentValue = date
      this.updateDate(true)
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
      if ((this.confirm && !confirm) || this.disabled) {
        return false
      }
      const equal = this.range ? this.rangeEqual(this.value, this.currentValue) : this.dateEqual(this.value, this.currentValue)
      if (equal) {
        return false
      }
      this.$emit('input', this.currentValue)
      this.$emit('change', this.currentValue)
      return true
    },
    handleValueChange (value) {
      if (!this.range) {
        this.currentValue = isValidDate(value) ? new Date(value) : null
      } else {
        this.currentValue = isValidRange(value) ? [new Date(value[0]), new Date(value[1])] : [null, null]
      }
    },
    selectDate (date) {
      this.currentValue = date
      this.updateDate() && this.closePopup()
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
      if (this.disabled) {
        return
      }
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
    },
    parseDate (value, format) {
      try {
        return fecha.parse(value, format)
      } catch (e) {
        return false
      }
    },
    handleInput (event) {
      this.userInput = event.target.value
    },
    handleChange (event) {
      const value = event.target.value
      if (this.editable && this.userInput !== null) {
        const calendar = this.$children[0]
        const checkDate = calendar.type === 'date' ? calendar.isDisabledDate : calendar.isDisabledTime
        if (this.range) {
          const range = value.split(` ${this.rangeSeparator} `)
          if (range.length === 2) {
            const start = this.parseDate(range[0], this.format)
            const end = this.parseDate(range[1], this.format)
            if (start && end && !checkDate(start, null, end) && !checkDate(end, start, null)) {
              this.currentValue = [ start, end ]
              this.updateDate(true)
              this.closePopup()
              return
            }
          }
        } else {
          const date = this.parseDate(value, this.format)
          if (date && !checkDate(date, null, null)) {
            this.currentValue = date
            this.updateDate(true)
            this.closePopup()
            return
          }
        }
        this.$emit('input-error', value)
      }
    }
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
