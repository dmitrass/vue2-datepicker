import { t } from '@/locale/index'

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
    let months = t('months')
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
