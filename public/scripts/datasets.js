function singleDatasetObject(datasetLabel, databaseDataset) {
    return {
             label: datasetLabel,
             data: databaseDataset,
             fill: false,
            //  borderColor: datasetColor,
            //  backgroundColor: datasetColor,
             borderWidth: 3,
             hoverBorderWidth: 3,
             hoverBorderColor: '#000'
         }
 }

 function buildSingleDatasetArray(label, obj, fromDate, toDate){

    let unsortedArray = [];

    Object.keys(obj)
            .forEach(key => {
                if(key == 'labels') {
                    return
                }

                let keyDate = new Date(key);
                let fromDateDF = new Date(fromDate)
                let toDateDF = new Date(toDate)
                if(fromDateDF <= keyDate && toDateDF >= keyDate){
                    let yValue = label.includes('_100k') 
                                        ? calculate100k(obj[key][obj.labels.indexOf(label.replace('_100k',''))], label)
                                        : obj[key][obj.labels.indexOf(label.replace('_100k',''))] ;
                    
                    let objToSort = { t: keyDate, y: yValue }
                    unsortedArray.push(objToSort)
                }
            });

    let sortedArray = sortDatesArrayWithObj(unsortedArray);
    
    //let datasetColor = getColor(obj.labels.indexOf(label.replace('_100k', '')), label)
    
    if(isRegion(label)){
        let regionName = regionObjMapping[label.split('_')[0]].regionName;
        let totalOrActual = label.split('_')[1] == 'ACT' ? ' активно болни' : ' общо заболели';
        let k100 = label.split('_')[2] == '100k' ? ' на 100 000 души' : '';
        label =  regionName + totalOrActual + k100
    }

    return singleDatasetObject(label, sortedArray);
 }
