var currentTextFileLanguage = '';

var genLangAttrBtn = function(mode, language) {
    return('<button type="button" onclick="inventoryObject.language=&quot;' +
           mode + '&quot;;inventoryObject.changed=true;editTextFile();">' + language + '</button>');
}

var editTextFile = function() {
    document.getElementById('body').innerHTML = '<div id="aceInstance"></div>';
    document.getElementById('menuBarDynamic').innerHTML = '';

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');

    initAttributes();
    addAttributeText('File UUID', 'objuuid');
    addAttributeTextBox('File Name', 'name');

    addAttributeTextBox('Language', 'language');

    var buttonTableHTML = '';
    buttonTableHTML += genLangAttrBtn('python', 'Python');
    buttonTableHTML += genLangAttrBtn('sh', 'BASH');
    buttonTableHTML += genLangAttrBtn('html', 'HTML');
    buttonTableHTML += genLangAttrBtn('yaml', 'YAML');
    buttonTableHTML += genLangAttrBtn('json', 'JSON');
    buttonTableHTML += genLangAttrBtn('javascript', 'JavaScript');
    buttonTableHTML += genLangAttrBtn('xml', 'XML');
    buttonTableHTML += genLangAttrBtn('plain_text', 'Plain Text');
    buttonTableHTML += genLangAttrBtn('sql', 'SQL');
    buttonTableHTML += genLangAttrBtn('ruby', 'RUBY');
    buttonTableHTML += genLangAttrBtn('css', 'CSS');
    buttonTableHTML += genLangAttrBtn('c_cpp', 'C,C++');
    buttonTableHTML += genLangAttrBtn('java', 'Java');
    addAttributeStatic('Language Presets', buttonTableHTML);

    var editor = new ace.edit(document.getElementById('aceInstance'));

    editor.setValue(inventoryObject['body']);
    editor.selection.moveTo(0, 0);
    editor['inventoryObject'] = inventoryObject;

    editor.on('change', function(e, f) {
        f.inventoryObject['body'] = f.getValue();
        f.inventoryObject['changed'] = true;

        if(inventoryObject.language != currentTextFileLanguage) {
            editor.session.setMode("ace/mode/" + inventoryObject.language);
        }
    });

    currentTextFileLanguage = inventoryObject.language;
    editor.session.setMode("ace/mode/" + inventoryObject.language);
}

var loadAndEditTextFile = function(objuuid) {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            inventoryObject = resp;
            editTextFile();
            expandToNode(inventoryObject.objuuid);
        }
    });
}