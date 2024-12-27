var executedHosts = [];

var editTask = function() {
    document.getElementById('body').innerHTML = '<div id="aceInstance"></div>';
    document.getElementById('menuBarDynamic').innerHTML = '';

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');

    initAttributes();
    addAttributeText('Task UUID', 'objuuid');
    addAttributeTextBox('Task Name', 'name');

    var editor = new ace.edit(document.getElementById('aceInstance'));

    editor.session.setMode("ace/mode/python");
    editor.setValue(inventoryObject['body']);
    editor.selection.moveTo(0, 0);
    editor['inventoryObject'] = inventoryObject;

    editor.on('change', function(e, f) {
        f.inventoryObject['body'] = f.getValue();
        f.inventoryObject['changed'] = true;
    });
}

var loadAndEditTask = function(objuuid) {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            inventoryObject = resp;
            editTask();
            expandToNode(inventoryObject.objuuid);
        }
    });
}

var addRunTaskHost = function(objuuid) {
    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            $("#runTaskHostGrid").jsGrid("insertItem", {'name' : resp['name'], 'objuuid' : resp['objuuid'], 'host' : resp['host']});
        }
    });
}

var viewTaskResult = function(result) {
    document.getElementById('section-header-' + result.host.objuuid).innerHTML = result.host.name + ' - ' + result.host.host + ' - ' + result.status.name;

    for(var i = 0; i < result.output.length; i++)
        document.getElementById('section-body-' + result.host.objuuid).innerHTML += '<div class="TaskResult">' + result.output[i] + '</div>';

    document.getElementById('section-header-' + result.host.objuuid).style.color = '#' + result.status.cfg;
    document.getElementById('section-header-' + result.host.objuuid).style.backgroundColor = '#' + result.status.cbg;
}

var executeTaskOnHost = function(hstuuid) {
    executedHosts.push(hstuuid);

    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : hstuuid},
        'success' : function(resp) {
            if(resp.type == 'host') {
                if(!document.getElementById('section-header-' + resp.objuuid)) {
                    document.getElementById('taskResultAccordion').innerHTML += '<div id="section-header-' + resp.objuuid + '"></div>';
                    document.getElementById('taskResultAccordion').innerHTML += '<pre id="section-body-' + resp.objuuid + '"></pre>';

                    $.ajax({
                        'url' : 'task/execute_task',
                        'dataType' : 'json',
                        'method': 'POST',
                        'data' : {'tskuuid' : inventoryObject.objuuid, 'hstuuid' : resp.objuuid},
                        'success' : function(resp) {
                            initTaskResultAccordion();
                            viewTaskResult(resp);
                        }
                    });
                }
            } else if(resp.type == 'host group') {
                for(var j = 0; j < resp.hosts.length; j++) {
                    if(executedHosts.indexOf(resp.hosts[j]) == -1) {
                        executeTaskOnHost(resp.hosts[j]);
                    }
                }
            }
        }
    });
}

var initTaskResultAccordion = function() {
    $("#taskResultAccordion").accordion({
        collapsible: true,
        heightStyle: "content"
    });
}

var executeTask = function() {
    initAttributes();
    addAttributeText('Task UUID', 'objuuid');
    addAttributeTextBox('Task Name', 'name');

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');
    document.getElementById('menuBarDynamic').innerHTML = '';

    document.getElementById('body').innerHTML = '<div id="taskResultAccordion"></div>';

    executedHosts = [];

    for(var i = 0; i < inventoryObject.hosts.length; i++) {
        executeTaskOnHost(inventoryObject.hosts[i]);
    }
}

var editTaskHosts = function() {
    initAttributes();
    addAttributeText('Task UUID', 'objuuid');
    addAttributeTextBox('Task Name', 'name');

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');

    document.getElementById('body').innerHTML = '<div id="hostGrid" style="padding:10px"></div>';

    $("#hostGrid").jsGrid({
        width: "calc(100% - 5px)",
        height: "calc(100% - 5px)",
        autoload: true,

        deleteButton: true,
        confirmDeleting: false,
        sorting: false,

        editing: true,
        onItemEditing: function(args) {
            if(args.item.type == 'host') {
                loadAndEditHost(args.item.objuuid);
            } else if (args.item.type == 'host group') {
                loadAndEditHostGroup(args.item.objuuid);
            }
        },

        rowClass: function(item, itemIndex) {
            return "client-" + itemIndex;
        },

        controller: {
            loadData: function(filter) {
                return $.ajax({
                    type: "POST",
                    url: "task/get_host_grid",
                    data: {'objuuid' : inventoryObject['objuuid']},
                    dataType: "JSON"
                });
            },
            insertItem: function(item) {
                inventoryObject['hosts'].push(item.objuuid);
                inventoryObject['changed'] = true;
            },
            deleteItem: function(item) {
                inventoryObject['hosts'].splice(inventoryObject['hosts'].indexOf(item.objuuid), 1);
                inventoryObject['changed'] = true;
            }
        },

        fields: [
            {name : "name", type : "text", title : "Host Name"},
            {name : "host", type : "text", title : "Host"},
            {name : "objuuid", type : "text", visible: false},
            {type : "control" }
        ],

        onRefreshed: function() {
            var $gridData = $("#hostGrid .jsgrid-grid-body tbody");

            $gridData.sortable({
                update: function(e, ui) {
                    // array of indexes
                    var clientIndexRegExp = /\s*client-(\d+)\s*/;
                    var indexes = $.map($gridData.sortable("toArray", { attribute: "class" }), function(classes) {
                        return clientIndexRegExp.exec(classes)[1];
                    });

                    // arrays of items
                    var items = $.map($gridData.find("tr"), function(row) {
                        return $(row).data("JSGridItem");
                    });

                    inventoryObject['hosts'] = [];
                    for(var i in items) {
                        inventoryObject['hosts'].push(items[i].objuuid);
                    }
                    inventoryObject['changed'] = true;
                }
            });
        }
    });

    setTimeout(refreshJSGrids, 1000);
}
