var editHost = function() {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#attributes"]').tab('show');

    initAttributes();
    addAttributeText('Host UUID', 'objuuid');
    addAttributeTextBox('Name', 'name');
    addAttributeTextBox('Controller URL', 'url');
    addAttributeTextBox('Log Level', 'loglevel');
    addAttributeCheckBox('Enabled', 'enabled');
    addAttributeTextBox('Seconds', 'seconds');
    addAttributeTextBox('Minutes', 'minutes');
    addAttributeTextBox('Hours', 'hours');
    addAttributeTextBox('Day of Month', 'dayofmonth');
    addAttributeTextBox('Day of Week', 'dayofweek');
    addAttributeTextBox('Year', 'year');
}

var loadAndEditHost = function(objuuid) {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            inventoryObject = resp;
            editHost();
            expandToNode(inventoryObject.objuuid);
        }
    });
}

var wakeHost = function(objuuid) {
    $.ajax({
        'url' : 'host/wake',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
    });
}
