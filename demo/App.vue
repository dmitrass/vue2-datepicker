<template>
  <div id="app">
    <calendar-panel
      v-model="value1"
      lang="en"
      range
      format="YYYY-MM-DD"></calendar-panel>
  </div>
</template>

<script>
import CalendarPanel from '../src/index.vue'

export default {
  name: 'app',
  components: { CalendarPanel },
  data () {
    return {
      value1: null,
      value2: '',
      value3: new Date(),
      value4: '',
      value5: '',
      value6: '',
      value7: '',
      value8: '',
      demo1: '<date-picker v-model="value1" editable lang="en"></date-picker>\n<date-picker v-model="value3" range lang="en"></date-picker>',
      demo2: `<date-picker v-model="value3" type="datetime" format="yyyy-MM-dd HH:mm:ss" lang="en"></date-picker>\n<date-picker v-model="value4" type="datetime" format="yyyy-MM-dd hh:mm:ss a" :time-picker-options="{start: '00:00',step: '00:30',end: '23:30'}" lang="en"></date-picker>\n<date-picker v-model="value4" range type="datetime" format="yyyy-MM-dd HH:mm:ss" lang="en"></date-picker>`,
      demo3: '<date-picker v-model="value6" format="yyyy-MM-dd" lang="en" confirm></date-picker>\n<date-picker v-model="value7" lang="en" type="datetime" format="yyyy-MM-dd hh:mm:ss" confirm></date-picker>\n<date-picker v-model="value8" lang="en" range format="yyyy-MM-dd" confirm></date-picker>'
    }
  },
  methods: {
    confirm (val) {
      console.log(val)
    }
  }
}
</script>

<style>
.demo {
  margin:20px;
}
.label{
  display: inline-block;
  margin-right: 1em;
}
.pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}
.example {
  padding: 45px;
  word-wrap: break-word;
  background-color: #fff;
  border: 1px solid #ddd;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
}
.example > .demo {
  display: inline-block;
}
.tips {
  margin: 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}
</style>
