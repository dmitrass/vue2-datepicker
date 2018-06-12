export default {
  name: 'panelMonth',
  props: {
    value: null
  },
  methods: {
    selectMonth (month) {
      this.$emit('select', month)
    }
  },
  render (h) {
    let months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const currentMonth = this.value && new Date(this.value).getMonth()
    months = months.map((v, i) => {
      return <span
        class={{
          'cell': true,
          'actived': currentMonth === i
        }}
        onClick={this.selectMonth.bind(this, i)}>
        {v}
      </span>
    })
    return <div class="mx-panel mx-panel-month">{months}</div>
  }
}
