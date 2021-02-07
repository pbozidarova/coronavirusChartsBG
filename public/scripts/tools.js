
function sortDatesArrayWithObj(unsortedArray) {
    return unsortedArray.sort((a, b) => {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.t) - new Date(b.t);
    });
}
function sortDatesArray(unsortedArray) {
    return unsortedArray.sort((a, b) => {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a) - new Date(b);
    });

}

function getColor(value, label) {
    
    //let colorNumber =  value % colorArray.length
    if (label.includes('_100k') ) value += 5;
    console.log(Object.keys(colorNamesLibrary)[value]);

    return Object.keys(colorNamesLibrary)[value];
}

const regionObjMapping = {
    'BG': {regionName: 'България', regionPopulation: 6951482},
    'BLG': {regionName: 'Благоевград', regionPopulation: 302694},
    'BGS': {regionName: 'Бургас', regionPopulation:409265 },
    'VAR': {regionName: 'Варна', regionPopulation: 469885},
    'VTR': {regionName: 'Велико Търново', regionPopulation: 232568},
    'VID': {regionName: 'Видин', regionPopulation: 82835},
    'VRC': {regionName: 'Враца', regionPopulation: 159470},
    'GAB': {regionName: 'Габрово', regionPopulation: 106598},
    'DOB': {regionName: 'Добрич', regionPopulation: 171809},
    'KRZ': {regionName: 'Кърджали', regionPopulation: 158204},
    'KNL': {regionName: 'Кюстендил', regionPopulation: 116915},
    'LOV': {regionName: 'Ловеч', regionPopulation: 122546},
    'MON': {regionName: 'Монтана', regionPopulation: 127001},
    'PAZ': {regionName: 'Пазарджик', regionPopulation: 252776},
    'PER': {regionName: 'Перник', regionPopulation: 119190},
    'PVN': {regionName: 'Плевен', regionPopulation: 236305},
    'PDV': {regionName: 'Пловдив', regionPopulation: 666801},
    'RAZ': {regionName: 'Разград', regionPopulation: 110789},
    'RSE': {regionName: 'Русе', regionPopulation: 215477},
    'SLS': {regionName: 'Силистра', regionPopulation: 108018},
    'SLV': {regionName: 'Сливен', regionPopulation: 184119},
    'SML': {regionName: 'Смолян', regionPopulation: 103532},
    'SFO': {regionName: 'София област', regionPopulation: 226671},
    'SOF': {regionName: 'София град', regionPopulation: 1328790},
    'SZR': {regionName: 'Стара Загора', regionPopulation: 313396},
    'TGV': {regionName: 'Търговище', regionPopulation: 110914},
    'HKV': {regionName: 'Хасково', regionPopulation: 225317},
    'SHU': {regionName: 'Шумен', regionPopulation: 172262},
    'JAM': {regionName: 'Ямбол', regionPopulation: 117335},
}

function handleError(err){
    htmlSelectors.notifyDiv().innerText = notifications.fetchFromOpenDBError;
}

function isRegion(value) {
    return value.split('_')[1] ? true : false
}

function regionKey(value) {
    return value.split('_')[0];
} 

function regionName(value) {
    return regionObjMapping[value.split('_')[0]].regionName;
} 

function isRegionActulalLabel(value) {
    return value.split('_')[1] == 'ACT';
}

function calculate100k(value, reg) {
    // ( number / population ) = (return Val / 100k)
    
    return Math.round(value * 100000 / regionObjMapping[regionKey(reg)].regionPopulation)
}

function presetInitialToDate(){
    return new Date().toISOString().split('T')[0];
}

function presetInitialFromDate(){
    let today = new Date();
    let monthDiff = today.setMonth(today.getMonth() -1);
    
    return new Date(monthDiff).toISOString().split('T')[0];
}