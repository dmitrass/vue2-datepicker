export function formatDate (value, fmt = 'yyyy-MM-dd HH:mm:ss') {
  const date = new Date(value)
  const hour = date.getHours()
  const map = {
    'M+': date.getMonth() + 1, // 月份
    '[Dd]+': date.getDate(), // 日
    'H+': hour, // 小时
    'h+': (hour % 12) || 12, // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
    'a': hour >= 12 ? 'pm' : 'am',
    'A': hour >= 12 ? 'PM' : 'AM'
  }
  let str = fmt.replace(/[Yy]+/g, function (str) {
    return ('' + date.getFullYear()).slice(4 - str.length)
  })
  Object.keys(map).forEach(key => {
    str = str.replace(new RegExp(key), function (str) {
      const value = '' + map[key]
      return str.length === 1 ? value : ('00' + value).slice(value.length)
    })
  })
  return str
}

export function isDateObejct (value) {
  return value instanceof Date
}

export function isValidDate (date) {
  if (date === null || date === undefined) {
    return false
  }
  return !!new Date(date).getTime()
}

export function isValidRange (date) {
  return (
    Array.isArray(date) &&
    date.length === 2 &&
    isValidDate(date[0]) &&
    isValidDate(date[1])
  )
}

export function parseTime (time) {
  const values = (time || '').split(':')
  if (values.length >= 2) {
    const hours = parseInt(values[0], 10)
    const minutes = parseInt(values[1], 10)
    return {
      hours,
      minutes
    }
  }
  return null
}

export function formatTime (time, type = '24') {
  let hours = time.hours
  hours = (type === '24') ? hours : (hours % 12 || 12)
  hours = hours < 10 ? '0' + hours : hours
  let minutes = time.minutes < 10 ? '0' + time.minutes : time.minutes
  let result = hours + ':' + minutes
  if (type === '12') {
    result += time.hours >= 12 ? ' pm' : ' am'
  }
  return result
}
