var drawQueue = function(resp) {
    queue = document.getElementById('queue');
    queue.innerHTML = '<table id="queueTable"></table>';

    var table = document.getElementById('queueTable');
    var numRows = 0;

    for (var i in resp)
        if (resp[i].displayrow + 1 > numRows)
            numRows = resp[i].displayrow + 1;

    for (var i=0; i<numRows; i++)
        table.insertRow(-1);

    for (var i=0; i<numRows; i++)
        table.rows[i].setAttribute('style', 'height: 20px');

    for (var i in resp) {
        table.rows[resp[i].displayrow].insertCell(-1).innerHTML = resp[i].runmode;
        table.rows[resp[i].displayrow].insertCell(-1).innerHTML = resp[i].runtimestring;
        table.rows[resp[i].displayrow].insertCell(-1).innerHTML = resp[i].name;

        var cell = table.rows[resp[i].displayrow].insertCell(-1);
        cell.innerHTML = '<font color="red">cancel</font>';
        cell.setAttribute('onclick', `cancelJob('${resp[i].jobuuid}')`);
    }
}

var updateQueueState = function () {
    $.ajax({
        'url' : 'procedure/get_queue_grid',
        'method': 'POST',
        'dataType' : 'json',
        'success' : function(resp) {
            drawQueue(resp);
        }
    });
}

var cancelJob = function (jobuuid) {
    $.ajax({
        'url' : 'procedure/cancel_job',
        'dataType' : 'json',
        'method': 'POST',
        'data' : {
            'jobuuid' : jobuuid,
        }
    });
}