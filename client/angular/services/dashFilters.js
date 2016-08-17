angular.module('dashFilters', [])
  // Cuts the names down to a size that fits in the boxes at the smallest size.
  // Couldn't figure out a good way change the text based on viewport, so we always
  // use shortened names
  .filter('nameTrim', function () {
    return function (name) {
      out = name
        .replace('West Ham United', 'West Ham')
        .replace('wich Albion', '') // 'West Browich Albion' -> 'West Brow'
        .replace(/(Leicester|Swansea|Stoke|Norwich|Tottenham) City|Hotspur/, '$1') // Drop 'City' or 'Hotspur'
        .replace('Newcastle United', 'Newcastle') // 'Newcastle Utd' would be too long
        .replace('Manchester', 'Man') // -> Shorten Man City / Utd
        .replace('United', 'Utd') // Man Utd
        .replace(/FC|AFC/, '')
        .replace('Palace', 'Pal.') // Crystal palace is just too dang long
        .trim()
      return out
    }
  })

  // The RSS text comes through poorly formatted, so we replace any artifacts in the string
  .filter('cardTrim', function () {
    return function (text) {
      out = text
        .replace(/<br>/g, '\n')
        .replace('..', '.')
      return out
    }
  })
