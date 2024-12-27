var editConfig = function() {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#attributes"]').tab('show');

    initAttributes();
    addAttributeTextBox('Brand', 'brand');
    addAttributeTextBox('Global Max Concurrency', 'concurrency');
}
