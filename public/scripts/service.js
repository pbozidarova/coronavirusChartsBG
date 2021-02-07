const BASE_URL = 'https://data.egov.bg/api/';
//Access-Control-Allow-Origin error roundabout by CORS proxy
//https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

const apiPath = { 
    getDatasetDetails: 'getDatasetDetails',
    getResourceData: 'getResourceData',
    listDataOrganisations: 'listDataOrganisations',
    listDatasets: 'listDatasets',
}

const resourceURIRepo = {
    'byAge' : '8f62cfcf-a979-46d4-8317-4e1ab9cbd6a8',
    'byRegion' : 'cb5d7df0-3066-4d7a-b4a1-ac26525e0f0c',
    'general' : 'e59f95dd-afde-43af-83c8-ea2916badd19',
    'byTest' : '0ce4e9c3-5dfc-46e2-b4ab-42d840caab92',
}

let openDataObj = (value) => ({
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
    body: JSON.stringify({
        'resource_uri': resourceURIRepo[value]
    })
})

function objFromArray(array) {
    //take the first array element as key and assign the rest as array of numbers
    let dateKey = array.shift();
    let arrayValue = array.map(num => Number(num));
    
    return Object.assign( {}, { [dateKey]: arrayValue } );
}

const apiService = {
    async fetchFromOpenDataGov(value) {
        
        let res = await fetch(proxyUrl + (BASE_URL + apiPath.getResourceData), openDataObj(value))
                    .then( response => response.json() )
                    .then(jsonResponse => jsonResponse['data'] )
                    .catch(error =>  false)
                             
        return res;
    }
    
}

const storeService = {
    async initiateLocalDataUpdateIfNeeded() {
        //check if the data from Open Data Gov has been fetched today after 1am, if not, 
        let currentDate = new Date();
        let latestDateInTheDB = new Date(await storeService.latestDateInResource());
        
        currentDateString = `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDate()}`;
        latestDateInTheDBString = `${latestDateInTheDB.getFullYear()}${latestDateInTheDB.getMonth()}${latestDateInTheDB.getDate()}`;

        //check if update is needed and if so, initialise it
        if ( currentDateString != latestDateInTheDBString && currentDate.getHours() > 1 ) {
           await storeService.uploadInLocalDb();
        }else {
            console.log('The database is up-to-date')
        }
    },

    async latestDateInResource() {
        let resourceValuesMostResentDate = '2050/01/01';

        for (const keyResourceUri of Object.keys(resourceURIRepo)) {

            let resourceObj = await storeService.loadData(keyResourceUri);
            let unsortedDates = Object.keys(resourceObj);
            //remove the labels element
            let indexOfLabels = unsortedDates.indexOf('labels');
            unsortedDates.splice(indexOfLabels, 1)
            
            //sort the dates and take the latest
            let sortedDates = sortDatesArray(unsortedDates);
            let latestDate = sortedDates.pop();
            
            resourceValuesMostResentDate = new Date(latestDate) < new Date( resourceValuesMostResentDate) 
                          ? latestDate 
                          : resourceValuesMostResentDate;
        }

        return resourceValuesMostResentDate;
    },

    async uploadInLocalDb(){
        //forEach for every resource URI to take the data from OpenDataGov
        for (const keyResourceUri of Object.keys(resourceURIRepo)) {
            await apiService.fetchFromOpenDataGov(keyResourceUri)
                        .then(bodyRequestForUpload => {
                            //Save the labels
                            console.log(bodyRequestForUpload);
                            
                            if(bodyRequestForUpload){    
                                storeService.uploadObjRowInDatabase(keyResourceUri, { 'labels': [...bodyRequestForUpload.shift().splice(1)]});
                                //SaveData
                                bodyRequestForUpload.forEach( row => {
                                    storeService.uploadObjRowInDatabase(keyResourceUri, objFromArray(row));
                                });
                            }
                        })
                        // .catch(error => console.log(error))                    
        }

        //  Object.keys(resourceURIRepo).forEach(keyResourceUri => {
        //     apiService.fetchFromOpenDataGov(keyResourceUri)
        //             .then(bodyRequestForUpload => {
        //                 //Save the labels
        //                 storeService.uploadObjRowInDatabase(keyResourceUri, { 'labels': [...bodyRequestForUpload.shift().splice(1)]});
        //                 //SaveData
        //                 bodyRequestForUpload.forEach( row => {
        //                     storeService.uploadObjRowInDatabase(keyResourceUri, objFromArray(row));
        //                 })
        //                 .catch(error => console.log(error))    
        //         })
        // })
    },
    
    uploadObjRowInDatabase(keyResourceUri, objRow) {
        firestoreDB.doc(`openData/${keyResourceUri}`).set( objRow, { merge: true })
    },

    async loadData (keyResourceUri) {
        let documentSectionfromOpenDataCollection = {};

        await firestoreDB.collection("openData")
                        .doc(keyResourceUri)
                        .get()
                        .then(function(doc) {
                                if (doc.exists) {
                                    documentSectionfromOpenDataCollection = doc.data();
                                } else {
                                    // doc.data() will be undefined in this case
                                    console.log("No such document!");
                                    return;
                                }
                            }).catch(function(error) {
                                console.log("Error getting document:", error);
                                return;
                            });
        
        return documentSectionfromOpenDataCollection;
                            
    }
    
}

const dynamicChartsService = {
    async buildDatasets(resourceKey, requiredLabels, fromDate, toDate){
        //resourceKey = byAge, byRegion, general, byTest
        let resourceObj = await storeService.loadData(resourceKey);
        
        let requiredLabelsValues = []
        requiredLabels.forEach(reqLabel => {
            if(resourceKey == 'byRegion'){
                requiredLabelsValues.push(reqLabel.value + '_ALL')    
                requiredLabelsValues.push(reqLabel.value + '_ALL_100k')    
                requiredLabelsValues.push(reqLabel.value + '_ACT')    
                requiredLabelsValues.push(reqLabel.value + '_ACT_100k')    
            }else {
                requiredLabelsValues.push(reqLabel.value)
            }
        })
        let arrayDatasetObjects = []        
        requiredLabelsValues.forEach( reqLabel => {
            if(!resourceObj.labels.includes( reqLabel.replace('_100k','') )){
                return;
            }  
            arrayDatasetObjects.push(
                buildSingleDatasetArray(reqLabel, resourceObj, fromDate, toDate)
            );
        });
                
        let unsortedArray = []
        Object.keys(resourceObj).forEach(key => {
            let keyDate = new Date(key);
            let fromDateDF = new Date(fromDate)
            let toDateDF = new Date(toDate)
        
            if(fromDateDF <= keyDate && toDateDF >= keyDate) {
                unsortedArray.push(keyDate)
            }
        });
        let datesLabels = sortDatesArray(unsortedArray);
        return {
           datesLabels: datesLabels,
           arrayDatasetObjects: arrayDatasetObjects,
        }        
    },
    async buildChart(resourceKey, requiredLabels, fromDate, toDate) {

        this.buildDatasets(resourceKey, requiredLabels, fromDate, toDate)
            .then(res => {
                //    dynamicChartsService.chart(res.datesLabels, res.arrayDatasetObjects)
                chartVar.data.labels = res.datesLabels;
                chartVar.data.datasets = res.arrayDatasetObjects;
                chartVar.update();
            })
        // htmlSelectors.myChart.update();
    },
    chart() {
        return new Chart(myChart, {
            type: 'line', //bar, horizontal, pie, line, doughnut, radar, polarArea
            fill: true,
            data: {
                labels: [],
                datasets: []
            },
            options: {
                title: {
                    display: false,
                    text: 'No Title',
                    fontSize: 25
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        fontColor: '#000'
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top: 0
                    }
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        displayFormats: {
                            quarter: 'MMM YYYY'
                        }
                    }]
                },
                tooltips: {
                    enabled: true,
                    mode: 'index',
                    position: 'nearest',
                    custom: customTooltips
                },
                plugins: {
                    colorschemes: {
                      scheme: 'tableau.Classic20'
                    }
                  }
            }
        })
    },
    async buildLabelElements(e){
        let resourceKey = e.target.value;
        let resourceLabelsElement = document.getElementById('resourceLabels-' + resourceKey)
        let resourceLabelsSets = document.querySelectorAll('div.resourceLabels');
        let resourceObj = await storeService.loadData(resourceKey);
       
        //Clear up the previous resource
        resourceLabelsSets.forEach(resourceLabels => {
            while(resourceLabels.firstChild){
                resourceLabels.removeChild(resourceLabels.firstChild);
                resourceLabels.style.height = 'auto'
            }
        })
        
        //Populate each label as input type checkbox
        if(!resourceObj.labels){
            return;
        }
        resourceObj.labels.forEach(label => {
            if( isRegionActulalLabel(label) ){
                return;
            }
            
            let p = document.createElement('p')
            resourceLabelsElement.appendChild(p)

            let inputElement = document.createElement('input')
            inputElement.setAttribute('type', 'checkbox');
            inputElement.setAttribute('name', 'resourceLabel');
            let attributes = ['id', 'value']
            attributes.forEach(attr => inputElement.setAttribute(attr, `${isRegion(label) ? regionKey(label) : label}`))
            
            let labelElement = document.createElement('label')
            labelElement.setAttribute("for", `${isRegion(label) ? regionKey(label) : label}`)
            labelElement.innerText = isRegion(label) ? regionName(label) : label;

            p.appendChild(inputElement);
            p.appendChild(labelElement);
            resourceLabelsElement.appendChild(p)
            resourceLabelsElement.style.height = isRegion(label) ? height = '440px' : 'auto'
        });
    }
}
