var editBinaryFile = function() {
    document.getElementById('body').innerHTML = '<div id="aceInstance"></div>';
    document.getElementById('menuBarDynamic').innerHTML = '';

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#attributes"]').tab('show');

    initAttributes();
    addAttributeText('Inventory UUID', 'objuuid');
    addAttributeText('Datastore UUID', 'sequuid');
    addAttributeTextBox('File Name', 'name');
    addAttributeText('Size (bytes)', 'size');
    addAttributeText('SHA1 HEX Digest', 'sha1sum');
}

var loadAndEditBinaryFile = function(objuuid) {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            inventoryObject = resp;
            editBinaryFile();
            expandToNode(inventoryObject.objuuid);
        }
    });
}