var ttRevert = (function() {

var d = document;

var app = {};

app.k = {
    SLOT_COLOR: '#CCFF33',
    SLOT_REGEX: /^(.*)-(.*)-(.*)-(.*)$/, // (1:CODE)-(2:TYPE)-(3:SLOT)-(4:VENUE)
    SLOT_REGEX_SLOT_IDX: 3,
    SLOT_REGEX_CODE_IDX: 1,
    SLOT_REGEX_VENUE_IDX: 4,        
    TABLE_REF: d.getElementsByClassName('paste-area')[0],
    USER_ERR_ELEMENT: d.getElementsByClassName('user-error-message')[0],
    WIDTH: 1600,
    HEIGHT: 500,
};

app.init = function init() {
    this.listenForPaste();
};

app.listenForPaste = function listenForPaste() {
    var self = this;

    d.addEventListener('paste', function(e) {
        var data = e.clipboardData.getData('text/html');
        e.preventDefault();

        self.resetTable();
        self.resetError();

        try {
            self.parseData(data);
            self.addDownloadButton();
        } catch (e) {
            self.error("Couldn't parse the copied text. Are you sure you copied the VTOP page?");
        }
    });
};

app.parseData = function parseData(data) {
    var self = this;

    var e = (new DOMParser).parseFromString(data, 'text/html');
    var t = e.querySelector("#timeTableStyle");

    if(!t) {
        throw Error("Didn't find valid HTML in clipboard. Query for table returned " + Object.toString(t));
    }

    console.log(t);
    this.fillTable(t);
}

app.fillTable = function fillTable(tableHtml) {
    var slots = this.getSlots(tableHtml);
    console.log(slots);

    Object.keys(slots).forEach(function (slot) {
        var tds = d.querySelectorAll('.' + slot);
        tds.forEach(function (td) {
            td.classList.add('highlight');
            var div = d.createElement('div');
            div.textContent = slots[slot];
            td.appendChild(div);
        });
    });
}

app.getSlots = function getSlots(tableHtml) {
    var k = this.k;
    var regSlotsList = tableHtml.querySelectorAll(
        'td[bgcolor="' + k.SLOT_COLOR + '"]'
    );
    return this.getSlotMapFromList(regSlotsList);
}

app.getSlotMapFromList = function getSlotMapFromList(list) {
    var k = this.k;
    var slotMap = {};
    [].forEach.call(list, function(slotCell) {
        var text = slotCell.textContent;
        var matches = text.match(k.SLOT_REGEX);
        var slot = matches[k.SLOT_REGEX_SLOT_IDX];
        if (!(slot in slotMap))
            slotMap[slot] = matches[k.SLOT_REGEX_CODE_IDX] + '-' + matches[k.SLOT_REGEX_VENUE_IDX];
    });

    return slotMap;
}

app.resetTable = function resetTable() {
    var te = this.k.TABLE_REF;
    var tds = te.querySelectorAll(".highlight");
    [].forEach.call(tds, function (td) {
        td.classList.remove('highlight');
        td.children[0].remove();
    });
}

app.error = function error(msg) {
    var e = this.k.USER_ERR_ELEMENT;
    e.textContent = msg;
}

app.resetError = function resetError() {
    var e = this.k.USER_ERR_ELEMENT;
    e.textContent = "";
}

app.addDownloadButton = function addDownloadButton() {
    var t = this.k.TABLE_REF,
        w = this.k.WIDTH;
    
    var button = document.createElement('a');
    button.textContent = "Download Image";
    button.className = 'download-button';
    document.body.appendChild(button);
    
    html2canvas(t, {
        onrendered: function (canvas) {
            button.href = canvas.toDataURL();
        },
        width: w,
        height: null,
    })
}

app.removeDownloadButton = function removeDownloadButton() {
    var elem = document.getElementsByClassName('download-button')[0];
    elem
        .parentElement
        .removeChild(elem);
}

return app;

})();

ttRevert.init();