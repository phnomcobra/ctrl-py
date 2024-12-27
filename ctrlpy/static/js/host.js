var editHost = function() {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#attributes"]').tab('show');

    initAttributes();
    addAttributeText('Host UUID', 'objuuid');
    addAttributeTextBox('Name', 'name');
    addAttributeTextBox('Host', 'host');
    addAttributeTextBox('Max Concurrency', 'concurrency');
    addAttributeTextArea('Configuration', 'config');

    $.ajax({
        'url' : 'console/get_consoles',
        'dataType' : 'json',
        'method': 'POST',
        'success' : function(resp) {
            var radioButtons = [];
            for(var i = 0; i < resp.length; i++) {
                radioButtons.push({'name' : resp[i].name, 'value' : resp[i].objuuid});
            }
            addAttributeRadioGroup('Console', 'console', radioButtons)
        }
    });
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
