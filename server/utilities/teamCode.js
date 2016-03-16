// takes either a number or a string, and returns either the fdAPI
// shortName or the fdAPI code

module.exports = function convertTeamCode (input) {
  var nameToCode = {
    'mufc' : 66,
    'thfc' :73,
    'afcb' : 1044,
    'avfc' : 58,
    'efc' : 62,
    'wat' : 346,
    'lcfc' : 338,
    'sun' : 71,
    'ncfc' : 68,
    'cry' : 354,
    'cfc' : 61,
    'swa' : 72,
    'nufc' : 67,
    'sfc' : 340,
    'afc' : 57,
    'whu' : 563,
    'scfc' : 70,
    'lfc' : 64,
    'wba' : 74,
    'mcfc' : 65,
  }

  var codeToName = {
  '57': 'afc',
  '58': 'avfc',
  '61': 'cfc',
  '62': 'efc',
  '64': 'lfc',
  '65': 'mcfc',
  '66': 'mufc',
  '67': 'nufc',
  '68': 'ncfc',
  '70': 'scfc',
  '71': 'sun',
  '72': 'swa',
  '1044': 'afcb',
  '74': 'wba',
  '338': 'lcfc',
  '340': 'sfc',
  '346': 'wat',
  '354': 'cry',
  '563': 'whu',
  '73': 'thfc' }

  if ( isNaN(parseInt(input)) ) { // convert str to num
    return nameToCode[input]
  } else { // convert num to str
    return codeToName[input]
  }
}
