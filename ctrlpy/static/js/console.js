var editConsole = function() {
    document.getElementById('body').innerHTML = '<div id="aceInstance"></div>';
    document.getElementById('menuBarDynamic').innerHTML = '';

    initAttributes();
    addAttributeText('Console UUID', 'objuuid');
    addAttributeTextBox('Console Name', 'name');
    addAttributeTextBox('Max Concurrency', 'concurrency');

    var editor = new ace.edit(document.getElementById('aceInstance'));

    editor.session.setMode("ace/mode/python");
    editor.setValue(inventoryObject['body']);
    editor.selection.moveTo(0, 0);
    editor['inventoryObject'] = inventoryObject;

    editor.on('change', function(e, f) {
        f.inventoryObject['body'] = f.getValue();
        f.inventoryObject['changed'] = true;
    });


    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');
}

var loadAndEditConsole = function(objuuid) {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            inventoryObject = resp;
            editConsole();
            expandToNode(inventoryObject.objuuid);
        }
    });
}
