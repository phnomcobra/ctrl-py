var openResult = function() {
    initAttributes();

    document.getElementById('body').innerHTML = '<div id="procedureResultAccordion"></div>';
    document.getElementById('menuBarDynamic').innerHTML = '';
    
    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');

    document.getElementById('procedureResultAccordion').innerHTML += '<div id="section-header-' + inventoryObject.hstuuid + '-' + inventoryObject.prcuuid + '"></div>';
    document.getElementById('procedureResultAccordion').innerHTML += '<pre id="section-body-' + inventoryObject.hstuuid + '-' + inventoryObject.prcuuid + '"></pre>';

    $.ajax({
        'url' : 'results/get_result',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {
            'resuuid' : inventoryObject['resuuid'],
        },
        'success' : function(resp) {
            for(var j = 0; j < resp.length; j++) {
                viewProcedureResult(resp[j]);
            }
            initProcedureResultAccordion();
        }
    });
}
