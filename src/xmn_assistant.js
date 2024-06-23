    ///Page UI

///Common Error Callback Handler
function commonErrorHandler(error) {
    console.log(error.message);
    throw error;
}

///Retrieves an entity record.
///successCallback - Function - A function to call when a record is retrieved.A JSON object with the retrieved properties and values will be passed to the function.
///errorCallback - Function - A function to call when the operation fails.
function XrmWebApiGet(entityLogicalName, id, attributes, successCallback, errorCallback) {
    //use common handler if no error callback passed in
    if (errorCallback == null)
        errorCallback = commonErrorHandler;

    Xrm.WebApi.retrieveRecord(entityLogicalName, id, '?$select=' + attributes).then(successCallback, errorCallback);
}

if (typeof (Assistant) === 'undefined') {
    Assistant = {}
}

Assistant.Helper = (function () {

    //Retrieve record query 
    var retrieveRecordQuery = async function(tableName, data, queryOption) {
        'use strict';
        var tempResult = null;
        if (queryOption === null) {
         await Xrm.WebApi.retrieveRecord(tableName, data).then(
             async function success(result) {
                 tempResult = result;
                },
                function (error) {
                    alert(error.message);
                }
            );
        }
        else {
         await   Xrm.WebApi.retrieveRecord(tableName, data, queryOption).then(
             async function success(result) {
                 tempResult = result
                },
                function (error) {
                    alert(error.message);
                }
            );

        }
        return tempResult;

    }
    var retrieveRecordFromLookUp = function (objectValue) {
        'use strict';
        return new Promise((resolve, reject) => {
            Xrm.WebApi.retrieveRecord(objectValue[0].entityType, objectValue[0].id.slice(1, -1).toLowerCase()).then(
                function success(result) {
                    resolve(result)
                },
                function (error) {
                    resolve(error)
                }
            );
        });
    }
    //Update Record Query
    var updateRecordQuery = function(tableName, data, Id) {
        'use strict';
        return new Promise((resolve, reject) => {
            Xrm.WebApi.updateRecord(tableName, Id, data).then(
                function success(result) {
                    resolve(result)
                },
                function (error) {
                    resolve(error)
                }
            );
        });

    }
    //Create Record Query
    var createRecordQuery = function(tableName, data) {
        'use strict';
        return new Promise((resolve, reject) => {
            Xrm.WebApi.createRecord(tableName, data).then(
                function success(result) {
                    resolve(result)
                },
                function (error) {
                    resolve(error)
                }
            );
        });
    }

    // Retrieve Multiple Query
    var retrieveMultipleRecordQuery = async function(tableName, query) {
        'use strict';
        debugger;
        var tempResult = null;
       await Xrm.WebApi.online.retrieveMultipleRecords(tableName, query).then(
           async function success(result) {

               tempResult = result;
            },
            function (error) {

                alert(error.message);
                // handle error conditions
            }
        );
        return tempResult;

    }
    var isUserHasRolesAccess = async function(user, roles) {
        'use strict';
        var result = false;
        var ctr = 0;
        var message = '';
        //Check if User has a Memebership
       

        if (roles.length >= 1) {
            for (var x = 0; x < roles.length; x++) {

                var teamFilter = "?$filter=(startswith(name, '" + roles[x] + "'))";
                var teamResults = await retrieveMultipleRecordQuery("team", teamFilter);
                if (teamResults.entities.length >= 1)
                {
                    for (var z = 0; z < teamResults.entities.length; z++) {
                        var teamMembershipFilter = "?$filter=(teamid eq " + teamResults.entities[z].teamid + " and systemuserid eq " + user.systemuserid +")";
                        var teamMembershipResults = await retrieveMultipleRecordQuery("teammembership", teamMembershipFilter);
                        if (teamMembershipResults.entities.length >= 1) {
                            ctr++;
                        }
                    }
                }

            }
        }
        if (ctr >= 1)
            result = true;

        return result;

    }
    var isUserRoleAndOwnAccess = async function (user,role, owner) {
        'use strict';
        var result = false;
        var ctr = 0;
        var message = '';

        var teamFilter = "?$filter=(startswith(name, '" + role + "'))";
        var teamResults = await retrieveMultipleRecordQuery("team", teamFilter);
        if (teamResults.entities.length >= 1) {
            for (var z = 0; z < teamResults.entities.length; z++) {
                var teamMembershipFilter = "?$filter=(teamid eq " + teamResults.entities[z].teamid + " and systemuserid eq " + user.systemuserid + ")";
                var teamMembershipResults = await retrieveMultipleRecordQuery("teammembership", teamMembershipFilter);
                if (teamMembershipResults.entities.length >= 1) {
                    result = true;
                    break;
                }
            }
        }
        
        if (result === true) {
            if (owner == user.systemuserid) {
                result = true;
            }
            else {
                result = false;
            }
        }

        return result;
    }

    var isUserRoleAccess = async function (user,role) {
        'use strict';
        var result = false;
        var ctr = 0;
        var message = '';

        var teamFilter = "?$filter=(startswith(name, '" + role + "'))";
        var teamResults = await retrieveMultipleRecordQuery("team", teamFilter);
        if (teamResults.entities.length >= 1) {
            for (var z = 0; z < teamResults.entities.length; z++) {
                var teamMembershipFilter = "?$filter=(teamid eq " + teamResults.entities[z].teamid + " and systemuserid eq " + user.systemuserid + ")";
                var teamMembershipResults = await retrieveMultipleRecordQuery("teammembership", teamMembershipFilter);
                if (teamMembershipResults.entities.length >= 1) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }
    var getControl =function(formContext, attributeName) {
        return formContext.getControl(attributeName);
    }
    ///Get Attribute
    var getAttribute = function(formContext, attributeName) {
        return formContext.getAttribute(attributeName);
    }

    ///Get Attribute value
    var getAttributeValue = function(formContext, attributeName) {
        var attr = getAttribute(formContext, attributeName);
        if (attr != null)
            return attr.getValue();
        return null;
    }

    ///Clear a field if it is hidden
    var clearHiddenField = function(formContext, attributeName) {
        var ctrl = getControl(formContext, attributeName);
        var visible = ctrl.getVisible();
        if (!visible) {
            setAttributeValue(formContext, attributeName, null);
        }
    }

    ///Set Attribute value
    var setAttributeValue =function(formContext, attributeName, value) {
        var attr = getAttribute(formContext, attributeName);
        if (attr != null)
            attr.setValue(value);
    }

    ///Set Attribute Lookup value
    var setAttributeLookupValue = function(formContext, attributeName, lookupEntityName, lookupRecordId, lookupName) {
        var attr = getAttribute(formContext, attributeName);
        if (attr != null) {
            var value = new Array();
            value[0] = new Object();
            value[0].entityType = lookupEntityName;
            value[0].name = lookupName;
            value[0].id = lookupRecordId;
            attr.setValue(value);
        }
    }

    ///Set Control Read-Only
    var setControlReadOnly = function(formContext, attributeName, isReadOnly) {
        var ctrl = getControl(formContext, attributeName);
        if (ctrl != null)
            ctrl.setDisabled(isReadOnly);
    }
    var setBPFControlReadOnly = function (formContext, attributeName, isReadOnly) {
        var ctrl = getControl(formContext,"header_process_" + attributeName);
        if (ctrl != null)
            ctrl.setDisabled(isReadOnly);
    }

    ///Set Control Visibility
    var setControlVisible =function(formContext, attributeName, isVisible) {
        var ctrl = getControl(formContext, attributeName);
        if (ctrl != null)
            ctrl.setVisible(isVisible);
    }
    var setBPFControlVisible = function (formContext, attributeName, isVisible) {
        var ctrl = getControl(formContext, "header_process_"+ attributeName);
        if (ctrl != null)
            ctrl.setVisible(isVisible);
    }

    ///Set Attribute Required
    var setAttributeRequired =function(formContext, attributeName, isRequired) {
        var attr = getAttribute(formContext, attributeName);
        if (attr != null) {
            if (isRequired)
                attr.setRequiredLevel('required');
            else
                attr.setRequiredLevel('none');
        }
    }

    ///Return today's date
    var getCurrentDateTime = function() {
        return new Date();
    }

    ///Set pre search filters on lookup fields
    var setPreSearch = function(formContext, attributeName, fetchXMLfilter, entityLogicalName) {
        var ctrl = getControl(formContext, attributeName);
        if (ctrl != null) {
            var SetFilter = function () {
                ctrl.addCustomFilter(fetchXMLfilter, entityLogicalName);
            }
            ctrl.addPreSearch(SetFilter);
        }
    }

    ///Set pre stage change custom process and return the current process
    var setPreStageChange =function(formContext, funcCall) {
        //get process
        var currentProcess = formContext.data.process;

        //add logic to run before BPF stage change
        if (currentProcess != null)
            currentProcess.addOnPreStageChange(funcCall);

        return currentProcess;
    }

    ///Trigger Attribute On Change event
    var triggerAttributeOnChange =function(formContext, attributeName) {
        var attr = getAttribute(formContext, attributeName);
        if (attr != null)
            attr.fireOnChange();
    }

    ///Common Error Callback Handler
    var commonErrorHandler =function(error) {
        console.log(error.message);
        throw error;
    }
    ///Pop-Up a confirmation dialog with OK and Cancel button, to run synchronously, the browser dialog will be used
    var  xrmConfirmationDialog =function(issync, message, subject, okCallback, cancelCallback, asyncHeight, asyncWidth) {
        if (issync) {
            //use browser classic dialog to run as synchronous
            var confirmOK = confirm(message);
            if (confirmOK == true) {
                if (okCallback != null)
                    okCallback();
            }
            else {
                if (cancelCallback != null)
                    cancelCallback();
            }
        }
        else {
            //use the Xrm Client dialog that run as asynchronous
            var confirmStrings = { text: message, title: subject };
            var confirmOptions = { height: 200, width: 450 };
            if (asyncHeight != null && asyncHeight != null)
                confirmOptions = { height: asyncHeight, width: asyncWidth };

            Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                function (success) {
                    if (success.confirmed) {
                        if (okCallback != null)
                            okCallback();
                    }
                    else {
                        if (cancelCallback != null)
                            cancelCallback();
                    }
                });
        }

        return true;
    }

    ///Pop-Up an alert dialog with OK button, to run synchronously, the browser dialog will be used
    var xrmAlertDialog = function(issync, message, subject, okButtonLabel, okCallback, asyncHeight, asyncWidth) {
        if (issync) {
            //use browser classic dialog to run as synchronous
            alert(message);
            if (okCallback != null)
                okCallback();
        }
        else {
            //use the Xrm Client dialog that run as asynchronous
            var confirmLabel = 'OK';
            if (okButtonLabel != null)
                confirmLabel = okButtonLabel;

            var alertStrings = { confirmButtonLabel: confirmLabel, text: message, title: subject };
            var alertOptions = { height: 120, width: 260 };
            if (asyncHeight != null && asyncHeight != null)
                alertOptions = { height: asyncHeight, width: asyncWidth };

            Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
                function (success) {
                    if (okCallback != null)
                        okCallback();
                });
        }

        return true;
    }

    ///Pop-up alert dialog to prevent saving even on a form
    var preventOnSave =function(context, buttonLabel, messageText, titleText) {
        var closeButton = "Close";
        var alertText = "Unable to save record.";
        var alertTitle = "Error";

        if (buttonLabel != null)
            closeButton = buttonLabel;
        if (messageText != null)
            alertText = messageText;
        if (titleText != null)
            alertTitle = titleText;

        context.getEventArgs().preventDefault();
        var alertStrings = { confirmButtonLabel: closeButton, text: alertText, title: alertTitle };
        var alertOptions = { height: 120, width: 260 };
        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
            function (success) {
                console.log("Alert Dialog Closed.");
            },
            function (error) {
                console.log(error.message);
            }
        );
    }



    var disableForm = function (formContext) {
        var formControls = formContext.ui.controls;
        formControls.forEach(element => {
            if (element.getName() != "" && element.getName() != null) {
                element.setDisabled(true);
            }
        });
    }

    var GenerateGUID = function ()
    {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
    }

    var FilterMarket = function (formContext, fieldName, userId)
    {
        var fetchXml = ["<fetch distinct='true' no-lock='true'>",
        "<entity name='zpwfma_market'>",
        "<attribute name='zpwfma_name' />",
        "<attribute name='zpwfma_businessunitid' />",
        "<attribute name='zpwfma_abbr' />",
        "<link-entity name='businessunit' from='businessunitid' to='zpwfma_businessunitid'>",
        "<link-entity name='team' from='businessunitid' to='businessunitid'>",
        "<link-entity name='teammembership' from='teamid' to='teamid'>",
        "<filter>",
        "<condition attribute='systemuserid' operator='eq' value='" + userId + "' />",
        "</filter>",
        "</link-entity>",
        "</link-entity>",
        "</link-entity>",
        "</entity>",
        "</fetch>"
        ].join("");

        var customViewId = this.GenerateGUID();
        var entity = "zpwfma_market";
        var viewDisplayName = "Available Market";

        var layout = "<grid name='resultset' jump='name' select='1' icon='1' preview='1'>" +
            "<row name = 'result' id = 'accountid' >" +
            "<cell name='zpwfma_name' width='150' />" +
            "<cell name='zpwfma_businessunitid' width='150' />" +
            "<cell name='zpwfma_abbr' width='100' />" +
            "</row></grid>";

        formContext.getControl(fieldName).addCustomView(customViewId, entity, viewDisplayName, fetchXml, layout, true);
    }
    var addCustomView = function (formContext, fieldName, entity, customViewName, customXmL, customLayout, isDefault) {

        var customViewId = this.GenerateGIUD();
        formContext.getControl(fieldName).addCustomView(customViewId, entity, customViewName, customXmL, customLayout, isDefault);
    }

    var filterChoices = function (columnName, choiceValues, formContext) {
        var attribute = formContext.getAttribute(columnName);
        if (!attribute)
            throw new Error("Attribute with name: " + columnName + " doesn't exists.");

        attribute.controls.forEach(function (control) {
            var attribute = control.getAttribute();
            var options = attribute.getOptions();
            if (!control.getOptions) { return; }

            var controlOptions = control.getOptions();
            if (!controlOptions) { return; }

            var controlValues = controlOptions.map(function (option) { return option.value; });
            for (var k = 0; k < controlValues.length; k++) {
                control.removeOption(controlValues[k]);
            }

            for (var i = 0; i < choiceValues.length; i++) {
                var value = choiceValues[i];
                for (var j = 0; j < options.length; j++) {
                    var option = options[j];
                    if (option.value === value) {
                        control.addOption(option);
                        break;
                    }
                }
            }
        });
    }



    return {
        RetrieveRecordQuery: retrieveRecordQuery,
        UpdateRecordQuery: updateRecordQuery,
        CreateRecordQuery: createRecordQuery,
        RetrieveMultipleRecordQuery: retrieveMultipleRecordQuery,
        IsUserHasRolesAccess: isUserHasRolesAccess,
        GetControl: getControl,
        GetAttribute: getAttribute,
        GetAttributeValue: getAttributeValue,
        ClearHiddenField: clearHiddenField,
        SetAttributeValue: setAttributeValue,
        SetAttributeLookupValue: setAttributeLookupValue,
        SetControlReadOnly: setControlReadOnly,
        SetControlVisible: setControlVisible,
        SetAttributeRequired: setAttributeRequired,
        GetCurrentDateTime: getCurrentDateTime,
        SetPreSearch: setPreSearch,
        SetPreStageChange: setPreStageChange,
        TriggerAttributeOnChange: triggerAttributeOnChange,
        CommonErrorHandler: commonErrorHandler,
        XrmConfirmationDialog: xrmConfirmationDialog,
        XrmAlertDialog: xrmAlertDialog,
        PreventOnSave: preventOnSave,
        IsUserRoleAndOwnAccess: isUserRoleAndOwnAccess, 
        IsUserRoleAccess: isUserRoleAccess,
        RetrieveRecordFromLookUp: retrieveRecordFromLookUp,
        DisableForm: disableForm,
        SetBPFControlReadOnly: setBPFControlReadOnly,
        SetBPFControlVisible: setBPFControlVisible,
        GenerateGIUD: GenerateGUID,
        FilterMarket: FilterMarket,
        AddCustomView: addCustomView,
        FilterChoices: filterChoices
    }
})()