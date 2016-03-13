angular.module('dashFilters', [])

  .filter('nameTrim', function () {
    return function (name) {
      out = name
        .replace('West Ham United', 'West Ham')
        .replace('wich Albion', '')
        .replace(/(Leicester|Swansea|Stoke|Norwich|Tottenham) City|Hotspur/, '$1')
        .replace('Newcastle United', 'Newcastle')
        .replace('Manchester', 'Man')
        .replace('United', 'Utd')
        .replace(/FC|AFC/, '')
        .replace('Palace', 'Pal.')
        .trim()

      return out
    }
  })
