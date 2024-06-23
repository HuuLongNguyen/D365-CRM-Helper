/// src/xmn_assistant.js

if (typeof (Assistant) === 'undefined') {
    Assistant = {}
}

Assistant.Request = (function () {
    var formContext = null;
    var globalContext = null;

    var onLoad = async function (executionContext) {
        'user strict';
        debugger;
        formContext = executionContext.getFormContext();
        globalContext = Xrm.Utility.getGlobalContext();
        setAttributedRequired();
    }

    var setAttributedRequired = function () {
        debugger;
        //Change field 1 to your current field
        Assistant.Helper.setAttributedRequired(formContext, "field1", true);
    }

    var onSave = function (executionContext) {
        'use strict'
        formContext = executionContext.getFormContext();
        globalContext = Xrm.Utility.getGlobalContext();
    }

    var onStatusChange = function () {
        setAttributedRequired();
    }
    return {
        OnLoad: onLoad,
        SetAttributedRequired: setAttributedRequired,
        OnSave: onSave,
        OnStatusChange: onStatusChange
    }
}
)()