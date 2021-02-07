const htmlSelectors = {
    body : () => document.querySelector('body'),

    fetchBtn: () => document.getElementById('fetchBtn'),
    updateBtn: () => document.getElementById('updateBtn'),

    myChart: () => document.getElementById('myChart').getContext('2d'),
    
    fromDate: () => document.getElementById('fromDate'),
    toDate: () =>  document.getElementById('toDate'),
    
    resourceKey: () => document.querySelector('input[name="resourceKey"]:checked'),
    resourceKeysAll: () => document.querySelectorAll('input[name="resourceKey"]'),
    resourceKeyChecked: () => document.querySelectorAll('input[name="resourceKey"]:checked'),
    requiredLabels : () => document.querySelectorAll('input[name="resourceLabel"]:checked'),

    notifyDiv: () => document.getElementById('notify'),
    notifDates: () => document.getElementById('notif-dates'),
    notifStat: () => document.getElementById('notif-stat'),
    notifSec: () => document.getElementById('notif-sec'),
}

//Draw the chart
let chartVar = dynamicChartsService.chart();

//Preset the today value in the today field
htmlSelectors.toDate().value = presetInitialToDate();
htmlSelectors.fromDate().value = presetInitialFromDate();


const notifications = {
    fetchFromOpenDBError: "Данните от https://data.egov.bg/ в момента са недостъпни."
}

//BuildChartOnLoad
htmlSelectors.updateBtn().addEventListener('click', async () => {
    
    if( !htmlSelectors.fromDate().value && !htmlSelectors.toDate().value 
        || htmlSelectors.fromDate().value >= htmlSelectors.toDate().value ) {
        console.log(htmlSelectors.notifDates())
        htmlSelectors.notifDates().style.color = "#ffb703";
        // htmlSelectors.notifDates().style.fontWeight = "bold";

        return;
    }
    htmlSelectors.notifDates().style.color = "white";
    
    if(!htmlSelectors.resourceKey()) {
        console.log(htmlSelectors.notifStat())
        htmlSelectors.notifStat().style.color = "#ffb703";
        return;
    }
    htmlSelectors.notifStat().style.color = "white";

    if(!htmlSelectors.requiredLabels().length > 0) {
        htmlSelectors.notifSec().style.color = "#ffb703";
        return;
    }
    htmlSelectors.notifSec().style.color = "white";

    //NEED TO UNCOMMENT!!! TODO!!!
    //await storeService.initiateLocalDataUpdateIfNeeded();
    await dynamicChartsService.buildChart(htmlSelectors.resourceKey().value, htmlSelectors.requiredLabels(), htmlSelectors.fromDate().value, htmlSelectors.toDate().value)
    //htmlSelectors.myChart().update();
});

//htmlSelectors.fetchBtn().addEventListener('click', () => storeService.uploadInLocalDb());

htmlSelectors.resourceKeysAll().forEach(inputEl => {
    inputEl.addEventListener('change', (e) => dynamicChartsService.buildLabelElements(e));
});
