var controllerStateFlag = null;
var controllerStateData;
var showControllerDetails = false;
var controllerStateUpdating = false;
var controllerLastUpdateTime = (new Date).getTime() / 1000;

var addControllerProcedure = function(objuuid) {
    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            $("#procedureGrid").jsGrid("insertItem", {'name' : resp['name'], 'objuuid' : resp['objuuid']});
        }
    });
}

var addControllerHost = function(objuuid) {
    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            if(resp.type == 'host') {
                $("#hostGrid").jsGrid("insertItem", {'type' : resp['type'], 'name' : resp['name'], 'objuuid' : resp['objuuid'], 'host' : resp['host']});
            } else if(resp.type == 'host group') {
                $("#hostGrid").jsGrid("insertItem", {'type' : resp['type'], 'name' : resp['name'], 'objuuid' : resp['objuuid'], 'host' : resp['hosts'].join('<br>')});
            }
        }
    });
}

var executeController = function() {
    controllerStateUpdating = false;

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');

    document.getElementById('body').innerHTML = '<div id="controllerTableDiv" style="width:inherit;height:inherit"><table id="controllerTable"></table></div><div id="procedureResultAccordion" style="display:none"></div>';
    document.getElementById('menuBarDynamic').innerHTML = '';

    initAttributes();
    addAttributeText('Controller UUID', 'objuuid');
    addAttributeTextBox('Controller Name', 'name');

    $.ajax({
        'url' : 'controller/get_tiles',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : inventoryObject.objuuid},
        'success' : function(resp) {
            var table = document.getElementById('controllerTable');
            var row;
            var cell;

            row = table.insertRow(-1);
            cell = row.insertCell(-1);

            if(resp.procedures.length >= resp.hosts.length) {
                for(var x = 0; x < resp.hosts.length; x++) {
                    cell = row.insertCell(-1);
                    cell.setAttribute('data-host-objuuid', resp.hosts[x].objuuid);
                    cell.setAttribute('data-selected', 'false');
                    cell.setAttribute('class', 'controllerHostCell');
                    cell.setAttribute('onclick', 'hostClick(this)');
                    cell.innerHTML = resp.hosts[x].name;
                }

                for(var y = 0; y < resp.procedures.length; y++) {
                    row = table.insertRow(-1);

                    cell = row.insertCell(-1);
                    cell.innerHTML = resp.procedures[y].name;
                    cell.setAttribute('data-procedure-objuuid', resp.procedures[y].objuuid);
                    cell.setAttribute('data-selected', 'false');
                    cell.setAttribute('onclick', 'procedureClick(this)');
                    cell.setAttribute('class', 'controllerProcedureCell');

                    for(var x = 0; x < resp.hosts.length; x++) {
                        cell = row.insertCell(-1);
                        cell.setAttribute('id', 'controller-cell-' + resp.hosts[x].objuuid + '-' + resp.procedures[y].objuuid);
                        cell.setAttribute('data-host-objuuid', resp.hosts[x].objuuid);
                        cell.setAttribute('data-host-name', resp.hosts[x].name);
                        cell.setAttribute('data-host-host', resp.hosts[x].host);
                        cell.setAttribute('data-procedure-objuuid', resp.procedures[y].objuuid);
                        cell.setAttribute('data-procedure-name', resp.procedures[y].name);
                        cell.setAttribute('data-selected', 'false');
                        cell.setAttribute('onclick', 'cellClick(this)');
                        cell.setAttribute('class', 'controllerCell');

                        cell.style.borderColor = '#CCC';

                        document.getElementById('procedureResultAccordion').innerHTML += '<div id="section-header-' + resp.hosts[x].objuuid + '-' + resp.procedures[y].objuuid + '"></div>';
                        document.getElementById('procedureResultAccordion').innerHTML += '<pre><code id="section-body-' + resp.hosts[x].objuuid + '-' + resp.procedures[y].objuuid + '"></code></pre>';
                    }
                }
            } else {
                for(var x = 0; x < resp.procedures.length; x++) {
                    cell = row.insertCell(-1);
                    cell.innerHTML = resp.procedures[x].name;
                    cell.setAttribute('data-procedure-objuuid', resp.procedures[x].objuuid);
                    cell.setAttribute('data-selected', 'false');
                    cell.setAttribute('onclick', 'procedureClick(this)');
                    cell.setAttribute('class', 'controllerProcedureCell');
                }

                for(var y = 0; y < resp.hosts.length; y++) {
                    row = table.insertRow(-1);

                    cell = row.insertCell(-1);
                    cell.setAttribute('data-host-objuuid', resp.hosts[y].objuuid);
                    cell.setAttribute('data-selected', 'false');
                    cell.setAttribute('class', 'controllerHostCell');
                    cell.setAttribute('onclick', 'hostClick(this)');
                    cell.innerHTML = resp.hosts[y].name;

                    for(var x = 0; x < resp.procedures.length; x++) {
                        cell = row.insertCell(-1);
                        cell.setAttribute('id', 'controller-cell-' + resp.hosts[y].objuuid + '-' + resp.procedures[x].objuuid);
                        cell.setAttribute('data-host-objuuid', resp.hosts[y].objuuid);
                        cell.setAttribute('data-host-name', resp.hosts[y].name);
                        cell.setAttribute('data-host-host', resp.hosts[y].host);
                        cell.setAttribute('data-procedure-objuuid', resp.procedures[x].objuuid);
                        cell.setAttribute('data-procedure-name', resp.procedures[x].name);
                        cell.setAttribute('data-selected', 'false');
                        cell.setAttribute('onclick', 'cellClick(this)');
                        cell.setAttribute('class', 'controllerCell');

                        cell.style.borderColor = '#CCC';

                        document.getElementById('procedureResultAccordion').innerHTML += '<div id="section-header-' + resp.hosts[y].objuuid + '-' + resp.procedures[x].objuuid + '"></div>';
                        document.getElementById('procedureResultAccordion').innerHTML += '<pre><code id="section-body-' + resp.hosts[y].objuuid + '-' + resp.procedures[x].objuuid + '"></code></pre>';
                    }
                }
            }

            updateControllerStateData();
            updateControllerTimer();

            $("#procedureResultAccordion").accordion({
                collapsible: true,
                heightStyle: "content",
                active: false
            });
        }
    });

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Edit";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'editController()');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Details";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'toggleControllerDetails()');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Run";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'executeSelectedProcedures()');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Select All";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'selectAllProcedures()');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Clear Selected";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'deselectAllProcedures()');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);
}

var toggleControllerDetails = function(item) {
    if(showControllerDetails) {
        document.getElementById('controllerTableDiv').style.display = 'block';
        document.getElementById('procedureResultAccordion').style.display = 'none';
        showControllerDetails = false;
    } else {
        document.getElementById('controllerTableDiv').style.display = 'none';
        document.getElementById('procedureResultAccordion').style.display = 'block';
        showControllerDetails = true;

        $('#controllerTable tr').each(function(){
            $(this).find('td').each(function(){
                if($(this)[0].id) {
                    if($(this)[0].attributes['data-selected'].value == 'true') {
                        document.getElementById('section-header-' + $(this)[0].attributes['data-host-objuuid'].value + '-' + $(this)[0].attributes['data-procedure-objuuid'].value).style.display = 'block';
                    } else {
                        document.getElementById('section-header-' + $(this)[0].attributes['data-host-objuuid'].value + '-' + $(this)[0].attributes['data-procedure-objuuid'].value).style.display = 'none';
                    }
                }
            });
        });
    }
}

var cellClick = function(item) {
    if(item.getAttribute('data-selected') == 'true') {
        item.setAttribute('data-selected', false);
        item.style.borderColor = '#CCC';
    } else {
        item.setAttribute('data-selected', true);
        item.style.borderColor = '#000';
    }
}

var hostClick = function(item) {
    if(item.getAttribute('data-selected') == 'true') {
        item.setAttribute('data-selected', false);

        $('#controllerTable tr').each(function(){
            $(this).find('td').each(function(){
                if($(this)[0].id) {
                    if($(this)[0].attributes['data-host-objuuid'].value == item.getAttribute('data-host-objuuid')) {
                        $(this)[0].setAttribute('data-selected', false);
                        $(this)[0].style.borderColor = '#CCC';
                    }
                }
            });
        });
    } else {
        item.setAttribute('data-selected', true);

        $('#controllerTable tr').each(function(){
            $(this).find('td').each(function(){
                if($(this)[0].id) {
                    if($(this)[0].attributes['data-host-objuuid'].value == item.getAttribute('data-host-objuuid')) {
                        $(this)[0].setAttribute('data-selected', true);
                        $(this)[0].style.borderColor = '#000';
                    }
                }
            });
        });
    }
}

var procedureClick = function(item) {
    if(item.getAttribute('data-selected') == 'true') {
        item.setAttribute('data-selected', false);

        $('#controllerTable tr').each(function(){
            $(this).find('td').each(function(){
                if($(this)[0].id) {
                    if($(this)[0].attributes['data-procedure-objuuid'].value == item.getAttribute('data-procedure-objuuid')) {
                        $(this)[0].setAttribute('data-selected', false);
                        $(this)[0].style.borderColor = '#CCC';
                    }
                }
            });
        });
    } else {
        item.setAttribute('data-selected', true);

        $('#controllerTable tr').each(function(){
            $(this).find('td').each(function(){
                if($(this)[0].id) {
                    if($(this)[0].attributes['data-procedure-objuuid'].value == item.getAttribute('data-procedure-objuuid')) {
                        $(this)[0].setAttribute('data-selected', true);
                        $(this)[0].style.borderColor = '#000';
                    }
                }
            });
        });
    }
}

var executeSelectedProcedures = function() {
    var items = [];

    $('#controllerTable tr').each(function(){
        $(this).find('td').each(function(){
            if($(this)[0].id) {
                if($(this)[0].attributes['data-selected'].value == 'true') {
                    items.push({
                        "prcuuid" : $(this)[0].attributes['data-procedure-objuuid'].value,
                        "hstuuid" : $(this)[0].attributes['data-host-objuuid'].value,
                        "ctruuid" : inventoryObject.objuuid
                    });
                }
            }
        });
    });

    $.ajax({
        'url' : 'procedure/queue_procedures',
        'dataType' : 'json',
        'contentType' : 'application/json',
        'method': 'POST',
        'data' : JSON.stringify(items),
        'success' : function(resp){
            $('.nav-tabs a[href="#queue"]').tab('show');
        },
        'failure' : function(resp){
            $('.nav-tabs a[href="#console"]').tab('show');
        }
    });
}

var selectAllProcedures = function() {
    $('#controllerTable tr').each(function(){
        $(this).find('td').each(function(){
            if($(this)[0].id) {
                document.getElementById($(this)[0].id).setAttribute('data-selected', true);
                document.getElementById($(this)[0].id).style.borderColor = '#000';
            }
        });
    });
}

var deselectAllProcedures = function() {
    $('#controllerTable tr').each(function(){
        $(this).find('td').each(function(){
            if($(this)[0].id) {
                document.getElementById($(this)[0].id).setAttribute('data-selected', false);
                document.getElementById($(this)[0].id).style.borderColor = '#CCC';
            }
        });
    });
}

var drawCells = function(resultItems) {
    var cell;

    for(var i = 0; i < resultItems.length; i++) {
        cell = document.getElementById('controller-cell-' + resultItems[i].host.objuuid + '-' + resultItems[i].procedure.objuuid);

        if(resultItems[i].stop) {
            if(resultItems[i].age > 60) {
                cell.style.color = '#' + resultItems[i].status.sfg;
                cell.style.backgroundColor = '#' + resultItems[i].status.sbg;
            } else {
                cell.style.color = '#' + resultItems[i].status.cfg;
                cell.style.backgroundColor = '#' + resultItems[i].status.cbg;
            }

            cell.innerHTML = resultItems[i].status.abbreviation;
        } else {
            cell.style.color = '#' + resultItems[i].status.cfg;
            cell.style.backgroundColor = '#' + resultItems[i].status.cbg;
            cell.innerHTML = resultItems[i].status.abbreviation;
        }
    }
}

var drawResults = function(resultItems) {
    for(var i = 0; i < resultItems.length; i++) {
        viewProcedureResult(resultItems[i]);
    }
}



var updateControllerTimer = function() {
    if(document.getElementById('controllerTable')) {
        $.ajax({
            'url' : 'flags/get',
            'dataType' : 'json',
            'method': 'POST',
            'data' : {
                'key' : 'controller-' + inventoryObject.objuuid
            },
            'success' : function(resp) {
                if(inventoryObject.type == 'controller') {
                    setTimeout(updateControllerTimer, 1000);
                }

                if(controllerStateFlag != resp.value && !controllerStateUpdating) {
                    controllerStateFlag = resp.value;
                    controllerStateUpdating = true;
                    updateControllerStateData();
                }
            },
        });
    }
}

var updateControllerStateData = function() {
    $.ajax({
        'url' : 'results/get_controller',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : inventoryObject.objuuid},
        'success' : function(resp) {
            controllerLastUpdateTime = (new Date).getTime() / 1000;
            controllerStateUpdating = false;
            controllerStateData = resp;
            drawCells(controllerStateData);
            drawResults(controllerStateData);
        }
    });
}

var loadAndEditController = function(objuuid) {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            inventoryObject = resp;
            editController();
            expandToNode(inventoryObject.objuuid);
        }
    });
}

var editController = function() {
    initAttributes();
    addAttributeText('Controller UUID', 'objuuid');
    addAttributeTextBox('Controller Name', 'name');

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');

    document.getElementById('body').innerHTML = '<div id="procedureGrid" style="padding:10px;float:left"></div><div id="hostGrid" style="padding:10px;margin-left:50%"></div>';
    document.getElementById('menuBarDynamic').innerHTML = '';

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Open";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'executeController()');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);

    $("#procedureGrid").jsGrid({
        height: "calc(100% - 5px)",
        width: "calc(50% - 10px)",
        autoload: true,

        deleteButton: true,
        confirmDeleting: false,
        sorting: false,

        rowClass: function(item, itemIndex) {
            return "client-" + itemIndex;
        },

        editing: true,
        onItemEditing: function(args) {
            if(args.item.type == "procedure")
                loadAndEditProcedure(args.item.objuuid);
            else if(args.item.type == "task")
                loadAndEditTask(args.item.objuuid);
        },

        controller: {
            loadData: function(filter) {
                return $.ajax({
                    type: "POST",
                    url: "/controller/get_procedure_grid",
                    data: {'objuuid' : inventoryObject['objuuid']},
                    dataType: "JSON"
                });
            },
            insertItem: function(item) {
                inventoryObject['procedures'].push(item.objuuid);
                inventoryObject['changed'] = true;
            },
            deleteItem: function(item) {
                inventoryObject['procedures'].splice(inventoryObject['procedures'].indexOf(item.objuuid), 1);
                inventoryObject['changed'] = true;
            }
        },

        fields: [
            {name : "name", type : "text", title : "Procedure Name"},
            {name : "objuuid", type : "text", visible: false},
            {name : "type", type : "text", visible: false},
            {type : "control" }
        ],

        onRefreshed: function() {
            var $gridData = $("#procedureGrid .jsgrid-grid-body tbody");

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

                    inventoryObject['procedures'] = [];
                    for(var i in items) {
                        inventoryObject['procedures'].push(items[i].objuuid);
                    }
                    inventoryObject['changed'] = true;
                }
            });
        }
    });

    $("#hostGrid").jsGrid({
        height: "calc(100% - 5px)",
        width: "calc(50% - 10px)",
        autoload: true,

        deleteButton: true,
        confirmDeleting: false,

        rowClass: function(item, itemIndex) {
            return "client-" + itemIndex;
        },

        editing: true,
        onItemEditing: function(args) {
            if(args.item.type == 'host') {
                loadAndEditHost(args.item.objuuid);
            } else if (args.item.type == 'host group') {
                loadAndEditHostGroup(args.item.objuuid);
            }
        },
        sorting: false,

        controller: {
            loadData: function(filter) {
                return $.ajax({
                    type: "POST",
                    url: "/controller/get_host_grid",
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