var procedureStateFlag = null;

var populateProcedureAttributes = function() {
    initAttributes();

    addAttributeText('Procedure UUID', 'objuuid');
    addAttributeTextBox('Procedure Name', 'name');
    addAttributeTextBox('Procedure Title', 'title');
    addAttributeTextArea('Description', 'description');
    addAttributeCheckBox('Enabled', 'enabled');
    addAttributeTextBox('Seconds', 'seconds');
    addAttributeTextBox('Minutes', 'minutes');
    addAttributeTextBox('Hours', 'hours');
    addAttributeTextBox('Day of Month', 'dayofmonth');
    addAttributeTextBox('Day of Week', 'dayofweek');
    addAttributeTextBox('Year', 'year');
    addAttributeTextBox('Result Expiration Period', 'resultexpirationperiod');
    addAttributeCheckBox('Refresh Inventory on Result', 'resultinventoryupdate');
    addAttributeCheckBox('Single Result', 'resultoverwrite');
    addAttributeCheckBox('Result Link', 'resultlinkenable');

    $.ajax({
        'url' : 'inventory/get_status_objects',
        'dataType' : 'json',
        'method': 'POST',
        'success' : function(resp) {
            for(var i = 0; i < resp.length; i++) {
                resp[i];

                var continueKey = 'continue ' + resp[i].code;

                if(!(inventoryObject.hasOwnProperty(continueKey))) {
                    inventoryObject[continueKey] = false;
                }

                addAttributeCheckBox('Continue on ' + resp[i].name, continueKey);
            }
        }
    });
}

var addProcedureTask = function(objuuid) {
    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'GET',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            $("#taskGrid").jsGrid("insertItem", {'name' : resp['name'], 'objuuid' : resp['objuuid']});
        }
    });
}

var loadAndEditProcedure = function(objuuid) {
    document.getElementById('body').innerHTML = '';
    document.getElementById('menuBarDynamic').innerHTML = '';

    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'GET',
        'data' : {'objuuid' : objuuid},
        'success' : function(resp) {
            inventoryObject = resp;
            editProcedure();
            expandToNode(inventoryObject.objuuid);
        }
    });
}

var editProcedure = function() {
    populateProcedureAttributes();
    document.getElementById('body').innerHTML = '<div id="taskGrid" style="padding:10px;float:left"></div><div id="hostGrid" style="padding:10px; margin-left:50%"></div><div id="RFCGrid" style="padding:10px;margin-left:50%"></div>';
    document.getElementById('menuBarDynamic').innerHTML = '';

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Run";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'executeProcedure(); runProcedure();');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Details";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'executeProcedure();');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);

    $("#taskGrid").jsGrid({
        height: "calc(100% - 5px)",
        width: "calc(50% - 5px)",
        autoload: true,

        deleteButton: true,
        confirmDeleting: false,
        sorting: false,

        rowClass: function(item, itemIndex) {
            return "client-" + itemIndex;
        },

        editing: true,
        onItemEditing: function(args) {
            loadAndEditTask(args.item.objuuid);
        },

        controller: {
            loadData: function(filter) {
                return $.ajax({
                    type: "POST",
                    url: "/procedure/get_task_grid",
                    data: {'objuuid' : inventoryObject['objuuid']},
                    dataType: "JSON"
                });
            },
            insertItem: function(item) {
                inventoryObject['tasks'].push(item.objuuid);
                inventoryObject['changed'] = true;
            },
            deleteItem: function(item) {
                inventoryObject['tasks'].splice(inventoryObject['tasks'].indexOf(item.objuuid), 1);
                inventoryObject['changed'] = true;
            }
        },

        fields: [
            {name : "name", type : "text", title : "Task Name"},
            {name : "objuuid", type : "text", visible: false},
            {type : "control" }
        ],

        onRefreshed: function() {
            var $gridData = $("#taskGrid .jsgrid-grid-body tbody");

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

                    inventoryObject['tasks'] = [];
                    for(var i in items) {
                        inventoryObject['tasks'].push(items[i].objuuid);
                    }
                    inventoryObject['changed'] = true;

                    setTimeout(function(){$("#taskGrid").jsGrid("loadData")}, 1000);
                }
            });
        }
    });

    $("#hostGrid").jsGrid({
        height: "calc(100% - 5px)",
        width: "calc(50% - 5px)",
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
                    url: "/procedure/get_host_grid",
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

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

var viewProcedureResult = function(result) {
    document.getElementById('section-header-' + result.host.objuuid + '-' + result.procedure.objuuid).innerHTML = result.procedure.name + ' - ' + result.host.name + ' - ' + result.status.name;

    document.getElementById('section-body-' + result.host.objuuid + '-' + result.procedure.objuuid).innerHTML = '<table class="ProcedureResult" id="section-body-procedure-header-' + result.host.objuuid + '-' + result.procedure.objuuid + '"></table>';

    var table = document.getElementById('section-body-procedure-header-' + result.host.objuuid + '-' + result.procedure.objuuid);
    var row;

    row = table.insertRow(-1);
    row.insertCell(-1).innerHTML = '<div id="section-body-tasks-' + result.host.objuuid + '-' + result.procedure.objuuid + '"></div>';

    title = document.createElement("div");
    taskOutput = document.createElement("div");
    taskOutput.setAttribute('style', 'width:100%');

    document.getElementById('section-body-tasks-' + result.host.objuuid + '-' + result.procedure.objuuid).appendChild(title);
    document.getElementById('section-body-tasks-' + result.host.objuuid + '-' + result.procedure.objuuid).appendChild(taskOutput);

    for(var j = 0; j < result.output.length; j++)
        taskOutput.innerHTML += result.output[j] + '<br>';

    for(var i = 0; i < result.tasks.length; i++) {
        taskOutput = document.createElement("div");

        document.getElementById('section-body-tasks-' + result.host.objuuid + '-' + result.procedure.objuuid).appendChild(taskOutput);

        taskOutput.innerHTML += '<br>';
        taskOutput.innerHTML += '-------------------------------------------------------------------------<br>';
        taskOutput.innerHTML += '  Task Name:  ' + result.tasks[i].name + '<br>';
        taskOutput.innerHTML += '  Start Time: ' + new Date(result.tasks[i].start * 1000).toLocaleString() + '<br>';
        taskOutput.innerHTML += '  Stop Time:  ' + new Date(result.tasks[i].stop * 1000).toLocaleString() + '<br>';
        taskOutput.innerHTML += '  Duration:   ' + String(result.tasks[i].stop - result.tasks[i].start).toHHMMSS() + '<br>';
        taskOutput.innerHTML += '  Status:     ' + result.tasks[i].status.name + '<br>';
        taskOutput.innerHTML += '-------------------------------------------------------------------------<br>';
        taskOutput.innerHTML += '<br>';

        for(var j = 0; j < result.tasks[i].output.length; j++)
            taskOutput.innerHTML += result.tasks[i].output[j] + '<br>';

        taskOutput.innerHTML += '<br>';
    }

    document.getElementById('section-header-' + result.host.objuuid + '-' + result.procedure.objuuid).style.color = '#' + result.status.cfg;
    document.getElementById('section-header-' + result.host.objuuid + '-' + result.procedure.objuuid).style.backgroundColor = '#' + result.status.cbg;
}

var insertProcedureResultDiv = function(hstuuid) {
    if(!document.getElementById('section-header-' + hstuuid + '-' + inventoryObject.objuuid)) {
        document.getElementById('procedureResultAccordion').innerHTML += '<div id="section-header-' + hstuuid + '-' + inventoryObject.objuuid + '"></div>';
        document.getElementById('procedureResultAccordion').innerHTML += '<pre id="section-body-' + hstuuid + '-' + inventoryObject.objuuid + '"></pre>';
    }
}

var initProcedureResultAccordion = function() {
    $("#procedureResultAccordion").accordion({
        collapsible: true,
        heightStyle: "content"
    });
}

var discoveredHostGroups = [];

var populateProcedureResultDivs = function(hstuuid) {
    $.ajax({
        'url' : 'inventory/get_object',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {'objuuid' : hstuuid},
        'success' : function(resp) {
            if(resp.type == 'host') {
                insertProcedureResultDiv(resp.objuuid);
            } else if(resp.type == 'host group') {
                if(discoveredHostGroups.indexOf(resp.objuuid) == -1) {
                    for(var j = 0; j < resp.hosts.length; j++) {
                        populateProcedureResultDivs(resp.hosts[j]);
                    }
                }
                discoveredHostGroups.push(resp.objuuid);
            }
        }
    });
}

var executeProcedure = function() {
    discoveredHostGroups = [];

    populateProcedureAttributes();

    document.getElementById('body').innerHTML = '<div id="procedureResultAccordion"></div>';
    document.getElementById('menuBarDynamic').innerHTML = '';

    document.title = inventoryObject.name;
    document.getElementById('bodyTitle').innerHTML = inventoryObject.type.toUpperCase() + ': ' + inventoryObject.name;
    $('.nav-tabs a[href="#body"]').tab('show');

    for(var i = 0; i < inventoryObject.hosts.length; i++) {
        populateProcedureResultDivs(inventoryObject.hosts[i]);
    }

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Run";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'runProcedure()');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);

    link = document.createElement("a");
    link.setAttribute("href", "#");
    link.innerHTML = "Edit";
    cell = document.createElement("li");
    cell.setAttribute('onclick', 'editProcedure()');
    cell.appendChild(link);
    document.getElementById('menuBarDynamic').appendChild(cell);

    updateProcedureTimer();
    updateProcedureStateData();
}

var runProcedure = function () {
    var items = [];

    for(var i = 0; i < inventoryObject.hosts.length; i++) {
        items.push({
            "prcuuid" : inventoryObject.objuuid,
            "hstuuid" : inventoryObject.hosts[i]
        });
    }

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

var updateProcedureTimer = function() {
    if(document.getElementById('procedureResultAccordion')) {
        $.ajax({
            'url' : 'flags/get',
            'dataType' : 'json',
            'method': 'POST',
            'data' : {
                'key' : 'procedure-' + inventoryObject.objuuid
            },
            'success' : function(resp) {
                if(procedureStateFlag != resp.value) {
                    procedureStateFlag = resp.value;
                    updateProcedureStateData();
                }

                if(inventoryObject.type == 'procedure') {
                    setTimeout(updateProcedureTimer, 1000);
                }
            },
        });
    }
}

var updateProcedureStateData = function() {
    for(var i = 0; i < inventoryObject.hosts.length; i++) {
        $.ajax({
            'url' : 'results/get_procedure',
            'dataType' : 'json',
            'method': 'POST',
            'data' : {
                'prcuuid' : inventoryObject.objuuid,
                'hstuuid' : inventoryObject.hosts[i]
            },
            'success' : function(resp) {
                for(var j = 0; j < resp.length; j++) {
                    viewProcedureResult(resp[j]);
                }
                initProcedureResultAccordion();
            }
        });
    }
}