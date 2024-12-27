var contextMenu = {};
var inventoryObject = {};
var saving = false;
var inventoryStateFlag = null;
var queueStateFlag = null;
var polling_messages = false;
var polling_queue = false;
var polling_inventory = false;
var selected_objuuids = [];

 $('#inventory').jstree({
    'contextmenu': {
        'items':
            function (obj) {
                return contextMenu;
        }
    },
    'core' : {
        'check_callback' : true,
        'data' : {
            'url' : function (node) {
                return node.id === '#' ?
                'inventory/get_child_tree_nodes' :
                'children';
            },
            'data' : function (node) {
                return { 'objuuid' : node.id };
            },
            'dataType' : "json",
            'method': 'POST',
        }
    },
    'search': {
        'case_insensitive': true,
        'show_only_matches' : true
    },
    'plugins' : ['contextmenu', 'dnd', 'checkbox', 'search', 'sort']
});

var to = false;
 $('#inventorySearchTextBox').keyup(function () {
            if(to) { clearTimeout(to); }
            to = setTimeout(function () {
                var v = $('#inventorySearchTextBox').val();
                $('#inventory').jstree(true).search(v);
            }, 500);
        });

var searchInventoryTree = function(item) {
    $('#inventory').jstree(true).search(item.value);
}

$(document).on('dnd_stop.vakata', function (e, data) {
    if(data.event.target.className == 'jsgrid-grid-body' ||
       data.event.target.className == 'jsgrid-cell') {
        var nodes = $('#inventory').jstree().get_selected(true);

        if(nodes.length == 0) {
            $.ajax({
                'url' : 'inventory/get_object',
                'dataType' : 'json',
                'method': 'POST',
                'data' : {'objuuid' : data.data.nodes[0]},
                'success' : function(resp) {
                    $('#inventory').jstree("deselect_all");

                    if(resp['type'] == 'task' && document.getElementById('taskGrid')) {
                        addProcedureTask(resp['objuuid']);
                    } else if(resp['type'] == 'host' &&
                              inventoryObject['hosts'].indexOf(resp['objuuid']) == -1 &&
                              document.getElementById('hostGrid')) {
                        addControllerHost(resp['objuuid']);
                    } else if(resp['type'] == 'host group' &&
                              inventoryObject['hosts'].indexOf(resp['objuuid']) == -1 &&
                              document.getElementById('hostGrid')) {
                        addControllerHost(resp['objuuid']);
                    } else if(resp['type'] == 'procedure' &&
                              inventoryObject['procedures'].indexOf(resp['objuuid']) == -1 &&
                              document.getElementById('procedureGrid')) {
                        addControllerProcedure(resp['objuuid']);
                    } else if(resp['type'] == 'task' &&
                              inventoryObject['procedures'].indexOf(resp['objuuid']) == -1 &&
                              document.getElementById('procedureGrid')) {
                        addControllerProcedure(resp['objuuid']);
                    }
                }
            });
        }

        for(i in nodes) {
            $.ajax({
                'url' : 'inventory/get_object',
                'dataType' : 'json',
                'data' : {'objuuid' : nodes[i].id},
                'method': 'POST',
                'success' : function(resp) {
                    $('#inventory').jstree("deselect_all");

                    if(resp['type'] == 'task' && document.getElementById('taskGrid')) {
                        addProcedureTask(resp['objuuid']);
                    } else if(resp['type'] == 'host' &&
                              inventoryObject['hosts'].indexOf(resp['objuuid']) == -1 &&
                              document.getElementById('hostGrid')) {
                        addControllerHost(resp['objuuid']);
                    } else if(resp['type'] == 'host group' &&
                              inventoryObject['hosts'].indexOf(resp['objuuid']) == -1 &&
                              document.getElementById('hostGrid')) {
                        addControllerHost(resp['objuuid']);
                    } else if(resp['type'] == 'procedure' &&
                              inventoryObject['procedures'].indexOf(resp['objuuid']) == -1 &&
                              document.getElementById('procedureGrid')) {
                        addControllerProcedure(resp['objuuid']);
                    } else if(resp['type'] == 'task' &&
                              inventoryObject['procedures'].indexOf(resp['objuuid']) == -1 &&
                              document.getElementById('procedureGrid')) {
                        addControllerProcedure(resp['objuuid']);
                    }
                }
            });
        }
    }
});

var exportObjectsZipFromInventory = function() {
    $('.nav-tabs a[href="#console"]').tab('show');

    var nodes = $('#inventory').jstree().get_selected(true);

    var objuuids = []
    for(i in nodes)
        objuuids.push(nodes[i].id);

    window.location = 'inventory/export_objects_zip?objuuids=' + objuuids.join(',');
}

var exportFilesZipFromInventory = function() {
    $('.nav-tabs a[href="#console"]').tab('show');

    var nodes = $('#inventory').jstree().get_selected(true);

    var objuuids = []
    for(i in nodes)
        objuuids.push(nodes[i].id);

    window.location = 'inventory/export_files_zip?objuuids=' + objuuids.join(',');
}

var importFileToInventory = function(item) {
    $('.nav-tabs a[href="#console"]').tab('show');

    var formData = new FormData();
    formData.append("file", item.files[0], item.files[0].name);

    $.ajax({
        url: 'inventory/import_file',  //Server script to process data
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(resp) {
            $('#inventory').jstree('refresh');
        }
    });
}

var importObjectsZipToInventory = function(item) {
    $('.nav-tabs a[href="#console"]').tab('show');

    var formData = new FormData();
    formData.append("file", item.files[0], item.files[0].name);

    $.ajax({
        url: 'inventory/import_objects_zip',  //Server script to process data
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(resp) {
            $('#inventory').jstree('refresh');
        }
    });
}

var importFilesZipToInventory = function(item) {
    $('.nav-tabs a[href="#console"]').tab('show');

    var formData = new FormData();
    formData.append("file", item.files[0], item.files[0].name);

    $.ajax({
        url: 'inventory/import_files_zip',  //Server script to process data
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(resp) {
            $('#inventory').jstree('refresh');
        }
    });
}

var createNode = function(object) {
    var parentNode = $('#inventory').find("[id='" + object['parent'] + "']");
    $('#inventory').jstree('create_node', parentNode, {'id' : object['objuuid'], 'parent' : object['parent'], 'text' : object['name'], 'icon' : object['icon']}, 'last', false, false);
}

var deleteNode = function(objuuid) {
    $('.nav-tabs a[href="#console"]').tab('show');
    var node = $('#inventory').find("[id='" + objuuid + "']");
    $('#inventory').jstree('delete_node', node);
    if(inventoryObject['objuuid'] == objuuid) {
        inventoryObject = {}
        document.getElementById('attributes').innerHTML = '';
        document.getElementById('body').innerHTML = '';
    }
    touchInventory();
}

$('#inventory').on('dblclick.jstree', function (evt, data) {
    obj = {};
    if('run' in contextMenu) {
        if(contextMenu.run.method == "run controller") {
            obj['item'] = contextMenu.run;
            contextMenu.run.action(obj);
        } else {
            obj['item'] = contextMenu.edit;
            contextMenu.edit.action(obj);
        }
    } else {
        obj['item'] = contextMenu.edit;
        contextMenu.edit.action(obj);
    }
});

$('#inventory').on('select_node.jstree', function (evt, data) {
        contextMenu = {};

        $.ajax({
            'url' : 'inventory/context',
            'dataType' : 'json',
            'method': 'POST',
            'data' : {
                'objuuid' : data.node.id
            },
            'success' : function(resp) {
                for(var item in resp) {
                    contextMenu[item] = {
                        'label' : resp[item]['label'],
                        'route' : resp[item]['action']['route'],
                        'params' : resp[item]['action']['params'],
                        'method' : resp[item]['action']['method'],
                        'action' : function (obj) {
                            $.ajax({
                                'url' : obj.item.route,
                                'dataType' : 'json',
                                'method': 'POST',
                                'data' : obj.item.params,
                                'success' : function(resp) {
                                    $('#inventory').jstree("deselect_all");
                                    if(obj.item.method == 'create container') {
                                        inventoryObject = resp;
                                        createNode(resp);
                                        editContainer();
                                    } else if(obj.item.method == 'create task') {
                                        inventoryObject = resp;
                                        createNode(resp);
                                        editTask();
                                        $('.nav-tabs a[href="#attributes"]').tab('show');
                                    } else if(obj.item.method == 'create text file') {
                                        inventoryObject = resp;
                                        createNode(resp);
                                        editTextFile();
                                        $('.nav-tabs a[href="#attributes"]').tab('show');
                                    } else if(obj.item.method == 'create host group') {
                                        inventoryObject = resp;
                                        createNode(resp);
                                        editHostGroup();
                                        $('.nav-tabs a[href="#attributes"]').tab('show');
                                    } else if(obj.item.method == 'create procedure') {
                                        document.title = resp.name;
                                        inventoryObject = resp;
                                        createNode(resp);
                                        editProcedure();
                                        $('.nav-tabs a[href="#attributes"]').tab('show');
                                    } else if(obj.item.method == 'create status') {
                                        inventoryObject = resp;
                                        createNode(resp);
                                        editStatusCode();
                                    } else if(obj.item.method == 'create host') {
                                        inventoryObject = resp;
                                        createNode(resp);
                                        editHost();
                                    } else if(obj.item.method == 'create console') {
                                        inventoryObject = resp;
                                        createNode(resp);
                                        editConsole();
                                        $('.nav-tabs a[href="#attributes"]').tab('show');
                                    } else if(obj.item.method == 'create controller') {
                                        inventoryObject = resp;
                                        createNode(resp);
                                        editController();
                                        $('.nav-tabs a[href="#attributes"]').tab('show');
                                    } else if(obj.item.method == 'edit task') {
                                        inventoryObject = resp;
                                        editTask();
                                    } else if(obj.item.method == 'edit configuration') {
                                        inventoryObject = resp;
                                        editConfig();
                                    } else if(obj.item.method == 'edit text file') {
                                        inventoryObject = resp;
                                        editTextFile();
                                    } else if(obj.item.method == 'edit binary file') {
                                        inventoryObject = resp;
                                        editBinaryFile();
                                    } else if(obj.item.method == 'edit task hosts') {
                                        inventoryObject = resp;
                                        editTaskHosts();
                                    } else if(obj.item.method == 'edit host group') {
                                        inventoryObject = resp;
                                        editHostGroup();
                                    } else if(obj.item.method == 'edit container') {
                                        inventoryObject = resp;
                                        editContainer();
                                    } else if(obj.item.method == 'edit procedure') {
                                        inventoryObject = resp;
                                        editProcedure();
                                    } else if(obj.item.method == 'edit status code') {
                                        inventoryObject = resp;
                                        editStatusCode();
                                    } else if(obj.item.method == 'edit host') {
                                        inventoryObject = resp;
                                        editHost();
                                    } else if(obj.item.method == 'edit controller') {
                                        inventoryObject = resp;
                                        editController();
                                        $('.nav-tabs a[href="#body"]').tab('show');
                                    } else if(obj.item.method == 'edit console') {
                                        inventoryObject = resp;
                                        editConsole();
                                    } else if(obj.item.method == 'run procedure') {
                                        inventoryObject = resp;
                                        executeProcedure();
                                    } else if(obj.item.method == 'run controller') {
                                        inventoryObject = resp;
                                        executeController();
                                    } else if(obj.item.method == 'open result') {
                                        inventoryObject = resp;
                                        openResult();
                                    } else if(obj.item.method == 'restart valarie') {
                                        restartValarie();
                                    } else if(obj.item.method == 'run task') {
                                        document.title = resp.name;
                                        document.getElementById('bodyTitle').innerHTML = resp.type.toUpperCase() + ': ' + resp.name;
                                        inventoryObject = resp;
                                        executeTask();
                                        $('.nav-tabs a[href="#body"]').tab('show');
                                    } else if(obj.item.method == 'delete node') {
                                        document.title = "ValARIE WebApp";
                                        document.getElementById('bodyTitle').innerHTML = '';
                                        deleteNode(resp['id']);
                                        touchInventory();
                                        $('.nav-tabs a[href="#console"]').tab('show');
                                    } else if(obj.item.method == 'copy node') {
                                        createNode(resp);
                                    }
                                },
                                'error' : function(resp, status, error) {
                                    $('.nav-tabs a[href="#console"]').tab('show');
                                    addMessage("console select failure " + resp);
                                    console.log(resp);
                                    console.log(status);
                                    console.log(error);
                                }
                            });
                        }
                    }
                }
            },
            'error' : function(resp, status, error) {
                $('.nav-tabs a[href="#console"]').tab('show');
                addMessage("context failure " + resp);
            }
        });
    }
);

$('#inventory').on("move_node.jstree", function(event, data) {
        $('#inventory').jstree("deselect_all");
        $.ajax({
            'url' : 'inventory/move_object',
            'dataType' : 'json',
            'method': 'POST',
            'data' : {
                'objuuid' : data.node.id,
                'parent_objuuid' : data.node.parent
            },
            'success' : function(resp) {
                $('.nav-tabs a[href="#console"]').tab('show');
                touchInventory();
            },
            'error' : function(resp, status, error) {
                addMessage('move failure');
                $('.nav-tabs a[href="#console"]').tab('show');
                $('#inventory').jstree('refresh');
            }
        });
});

var initAttributes = function() {
    document.getElementById('attributes').innerHTML = '<table id="attributesTable" class="table"></table>';
}

var addAttributeTextBox = function(fieldName, inventoryKey) {
    var attributeTable = document.getElementById("attributesTable");
    var attributeRow = attributeTable.insertRow(-1);
    var attributeCell;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = fieldName;

    attributeCell = attributeRow.insertCell(-1);
    var id = 'inventory-obj-key-' + inventoryKey;
    attributeCell.innerHTML = '<input type="text" id="' + id + '" onchange="setInventoryKey(&quot;' + inventoryKey + '&quot;, &quot;' + id + '&quot;)" onkeyup="setInventoryKey(&quot;' + inventoryKey + '&quot;, &quot;' + id + '&quot;)" style="width:99%"></input>';
    document.getElementById(id).value = inventoryObject[inventoryKey];
}

var addAttributeRadioGroup = function(fieldName, inventoryKey, radioButtons) {
    var attributeTable = document.getElementById("attributesTable");
    var attributeRow = attributeTable.insertRow(-1);
    var attributeCell;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = fieldName;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = '';
    for(var i = 0; i < radioButtons.length; i++) {
        if(inventoryObject[inventoryKey] == radioButtons[i].value) {
            attributeCell.innerHTML += '<input type="radio" name="radio-' + inventoryKey +
                                       '" value="' + radioButtons[i].value +
                                       '" checked=true onclick="inventoryObject[&quot;' + inventoryKey + '&quot;]=this.value;inventoryObject[&quot;changed&quot;]=true;">' +
                                       radioButtons[i].name + '<br>';
        } else {
            attributeCell.innerHTML += '<input type="radio" name="radio-' + inventoryKey +
                                       '" value="' + radioButtons[i].value +
                                       '" onclick="inventoryObject[&quot;' + inventoryKey + '&quot;]=this.value;inventoryObject[&quot;changed&quot;]=true;">' +
                                       radioButtons[i].name + '<br>';
        }
    }
}

var addAttributeTextArea = function(fieldName, inventoryKey) {
    var attributeTable = document.getElementById("attributesTable");
    var attributeRow = attributeTable.insertRow(-1);
    var attributeCell;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = fieldName;

    attributeCell = attributeRow.insertCell(-1);
    var id = 'inventory-obj-key-' + inventoryKey;
    attributeCell.innerHTML = '<textarea rows = "5" id="' + id + '" onchange="setInventoryKey(&quot;' + inventoryKey + '&quot;, &quot;' + id + '&quot;)" onkeyup="setInventoryKey(&quot;' + inventoryKey + '&quot;, &quot;' + id + '&quot;)" style="width:98%;"></textarea>';
    document.getElementById(id).value = inventoryObject[inventoryKey];
}

var addAttributePassword = function(fieldName, inventoryKey) {
    var attributeTable = document.getElementById("attributesTable");
    var attributeRow = attributeTable.insertRow(-1);
    var attributeCell;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = fieldName;

    attributeCell = attributeRow.insertCell(-1);
    var id = 'inventory-obj-key-' + inventoryKey;
    attributeCell.innerHTML = '<input type="password" id="' + id + '" onchange="setInventoryKey(&quot;' + inventoryKey + '&quot;, &quot;' + id + '&quot;)" onkeyup="setInventoryKey(&quot;' + inventoryKey + '&quot;, &quot;' + id + '&quot;)" style="width:99%"></input>';
    document.getElementById(id).value = inventoryObject[inventoryKey];
}

var addAttributeCheckBox = function(fieldName, inventoryKey) {
    var attributeTable = document.getElementById("attributesTable");
    var attributeRow = attributeTable.insertRow(-1);
    var attributeCell;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = fieldName;

    attributeCell = attributeRow.insertCell(-1);
    var id = 'inventory-obj-key-' + inventoryKey;
    attributeCell.innerHTML = '<input type="checkbox" id="' + id + '" onchange="this.value = this.checked;setInventoryKey(&quot;' + inventoryKey + '&quot;, &quot;' + id + '&quot;)"></input>';

    if(inventoryObject[inventoryKey] == 'true' || inventoryObject[inventoryKey] == true) {
        document.getElementById(id).checked = true;
        document.getElementById(id).value = true;
    } else {
        document.getElementById(id).checked = false;
        document.getElementById(id).value = false;
    }
}

var addAttributeColor = function(fieldName, inventoryKey) {
    var attributeTable = document.getElementById("attributesTable");
    var attributeRow = attributeTable.insertRow(-1);
    var attributeCell;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = fieldName;

    attributeCell = attributeRow.insertCell(-1);
    var id = 'inventory-obj-key-' + inventoryKey;
    attributeCell.innerHTML = '<input class="jscolor" id="' + id + '" onchange="setInventoryKey(&quot;' + inventoryKey + '&quot;, &quot;' + id + '&quot;)" onkeyup="setInventoryKey(&quot;' + inventoryKey + '&quot;, &quot;' + id + '&quot;)" style="width:99%"></input>';
    jsc.tryInstallOnElements([document.getElementById(id)], "jscolor");
    jsc.register();
    document.getElementById(id).jscolor.fromString(inventoryObject[inventoryKey]);
}

var addAttributeText = function(fieldName, inventoryKey) {
    var attributeTable = document.getElementById("attributesTable");
    var attributeRow = attributeTable.insertRow(-1);
    var attributeCell;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = fieldName;

    attributeCell = attributeRow.insertCell(-1);
    var id = 'inventory-obj-key-' + inventoryKey;
    attributeCell.innerHTML = '<div id="' + id + '"></div>';
    document.getElementById(id).innerHTML = inventoryObject[inventoryKey];
}

var addAttributeStatic = function(fieldName, value) {
    var attributeTable = document.getElementById("attributesTable");
    var attributeRow = attributeTable.insertRow(-1);
    var attributeCell;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = fieldName;

    attributeCell = attributeRow.insertCell(-1);
    attributeCell.innerHTML = value;
}


var inventoryApp = angular.module('inventoryApp', []);
inventoryApp.controller('inventoryCtrl', function($scope, $interval, $http, $sce) {
    $interval(function () {
        if(inventoryObject['changed'] && !saving) {
            inventoryObject['changed'] = false;
            document.getElementById('connectionStatus').innerHTML = '<font style="color:#F90">SAVING</font>';
            saving = true;
            $http.post('inventory/post_object', JSON.stringify(inventoryObject)
            ).then(function successCallback(response) {
                saving = false;

                if(inventoryObject['refreshTree']) {
                    $('#inventory').jstree('refresh');
                    inventoryObject['refreshTree'] = false;
                }

            }, function errorCallback(response) {
                $('.nav-tabs a[href="#console"]').tab('show');
                addMessage("save failure " + inventoryObject['objuuid']);
                saving = false;
                document.getElementById('connectionStatus').innerHTML = '<font style="color:#F00">NO CONN</font>';
            });
        }

        if(!polling_messages) {
            polling_messages = true;

            $http.post("messaging/get_messages").then(function (response) {
                polling_messages = false;
                var messageData = '<table>';
                var responseJSON = angular.fromJson(response)['data'];
                for(item in responseJSON) {
                    messageData += '<tr><td>' + responseJSON[item] + '</td></tr>';
                }
                messageData += '</table>'

                $scope.messages = $sce.trustAsHtml(messageData);
            }, function errorCallback(response) {
                polling_messages = false;
            });
        }

        if(!polling_inventory) {
            polling_inventory = true;

            $.ajax({
                'url' : 'flags/get',
                'dataType' : 'json',
                'method': 'POST',
                'data' : {
                    'key' : 'inventoryState'
                },
                'success' : function(resp) {
                    polling_inventory = false;

                    if(inventoryStateFlag != resp.value) {
                        inventoryStateFlag = resp.value;
                        $('#inventory').jstree('refresh');
                    }
                },
                'error' : function(resp) {
                    polling_inventory = false;
                }
            });
        }

        if(!polling_queue) {
            polling_queue = true;

            $.ajax({
                'url' : 'flags/get',
                'dataType' : 'json',
                'method': 'POST',
                'data' : {
                    'key' : 'queueState'
                },
                'success' : function(resp) {
                    polling_queue = false;

                    updateQueueState();
                    document.getElementById('connectionStatus').innerHTML = '<font style="color:#0F0">OK</font>';
                },
                'error' : function(resp) {
                    polling_queue = false;

                    document.getElementById('connectionStatus').innerHTML = '<font style="color:#F00">NO CONN</font>';
                }
            });
        }
    }, 1000);
});

var addMessage = function (message) {
    $.ajax({
        'url' : 'messaging/add_message',
        'method': 'POST',
        'dataType' : 'json',
        'data' : {
            'message' : message
        },
    });
};

var setInventoryKey = function (key, div) {
    inventoryObject[key] = document.getElementById(div).value;
    inventoryObject['changed'] = true;

    if(key == 'name') {
        $("#inventory").jstree('rename_node', inventoryObject['objuuid'] , inventoryObject[key]);
        document.title = inventoryObject.name;
        document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    }
}

var touchInventory = function() {
    $.ajax({
        'url' : 'flags/touch',
        'method': 'POST',
        'dataType' : 'json',
        'data' : {
            'key' : 'inventoryState'
        },
        'success' : function(resp) {
            inventoryStateFlag = resp.value;
        },
    });
}

/* Exists to mitigate css race condition
between BS transitions and jsgrid instantiation. */
var refreshJSGrids = function() {
    $('.jsgrid').each(function(){
        $(this).jsGrid('refresh');
    });
}

var cutInventoryItems = function() {
    var nodes = $('#inventory').jstree().get_selected(true);
    var objuuids = [];

    for(i in nodes)
        objuuids.push(nodes[i].id);

    for(i in objuuids) {
        var node = $("#inventory").jstree("get_node", "#" + objuuids[i]);
        var parent = $("#inventory").jstree("get_node", "#" + node.parent);
        if(!parent.state.selected) {
            selected_objuuids.push(objuuids[i]);
            $("#" + objuuids[i] + " >a").css("background", "yellow");
        }

    }

    $('#inventory').jstree("deselect_all");
}

var unCutInventoryItems = function() {
    for(i in selected_objuuids)
        $("#" + selected_objuuids[i] + " >a").css("background", "white");
    selected_objuuids = [];
}

var deleteInventoryItems = function() {
    var nodes = $('#inventory').jstree().get_selected(true);

    $('#inventory').jstree("deselect_all");

    var objuuids = [];

    for(i in nodes)
        objuuids.push(nodes[i].id);

    for(i in objuuids) {
        var node = $("#inventory").jstree("get_node", "#" + objuuids[i]);
        var parent = $("#inventory").jstree("get_node", "#" + node.parent);
        if(!parent.state.selected) {
            deleteNode(objuuids[i]);

            $.ajax({
                'url' : 'inventory/delete',
                'dataType' : 'json',
                'method': 'POST',
                'data' : {
                    'objuuid' : objuuids[i]
                },
                'success' : function(resp) {
                    $('.nav-tabs a[href="#console"]').tab('show');
                    addMessage('delete success');
                    touchInventory();
                },
                'error' : function(resp, status, error) {
                    addMessage('delete failure');
                    $('.nav-tabs a[href="#console"]').tab('show');
                    $('#inventory').jstree('refresh');
                }
            });
        }
    }
}

var pasteInventoryItems = function() {
    var parent_objuuid = $('#inventory').jstree().get_selected(true)[0];

    for(i in selected_objuuids) {
        $('#inventory').jstree("move_node", selected_objuuids[i], parent_objuuid.id, 0);
        $("#" + selected_objuuids[i] + " >a").css("background", "white");

        $.ajax({
            'url' : 'inventory/move_object',
            'dataType' : 'json',
            'method': 'POST',
            'data' : {
                'objuuid' : selected_objuuids[i],
                'parent_objuuid' : parent_objuuid.id
            },
            'success' : function(resp) {
                $('.nav-tabs a[href="#console"]').tab('show');
                touchInventory();
            },
            'error' : function(resp, status, error) {
                addMessage('move failure');
                $('.nav-tabs a[href="#console"]').tab('show');
                $('#inventory').jstree('refresh');
            }
        });
    }
    selected_objuuids = [];
}

var expandToNode = function(nodeID) {
    $('#inventory').jstree("deselect_all");
    $('#inventory').jstree(true).select_node(nodeID);
}