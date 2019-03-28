(function () {
    'use strict';

    define(['services/data/datacontext', 'services/core/code', 'model/model'],
        function (datacontext, codeSvc, model) {

            var service = {
                checkAccess: checkAccess,
                checkAdminAccess: checkAdminAccess,
                checkCompanyAdminAccess: checkCompanyAdminAccess,
                checkCompanyUserAccess: checkCompanyUserAccess,
                checkEntityAccess: checkEntityAccess,
                checkPartyAccess: checkPartyAccess,
                listCompanyAccess: listCompanyAccess,
                listCompanyVacancyAccess: listCompanyVacancyAccess,
                getSecurityObjectsForEdit: getSecurityObjectsForEdit,
                getUserGroupName: getUserGroupName,
                updateAccessList: updateAccessList
            };

            return service;

            function checkEntityAccess(entityId, objectTypeCode, operation) {
                return checkAccess({
                    entityId: entityId,
                    objectTypeCode: objectTypeCode,
                    operationTypeCode: operation
                });
            }

            function checkPartyAccess(partyId, objectTypeCode, operation) {
                return checkAccess({
                    partyId: partyId,
                    objectTypeCode: objectTypeCode,
                    operationTypeCode: operation
                });
            }

            function checkAccess(options) {

                var partyId = options.partyId;
                var entityId = options.entityId;
                var objectTypeCode = options.objectTypeCode;
                var operationTypeCode = options.operationTypeCode;

                for (var i = 0; i < datacontext.user.item.accessLists().length; i++) {

                    var accessList = datacontext.user.item.accessLists()[i];

                    if ((accessList.partyId() === partyId || !partyId) && (accessList.entityId() === entityId || !entityId)) {
                        for (var o = 0; o < accessList.operations().length; o++) {
                            var operation = accessList.operations()[o];

                            if (operation.objectTypeCode() === objectTypeCode && (operation.operationTypeCode() === operationTypeCode || !operationTypeCode)) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            }

            function checkAdminAccess() {
                var objectTypeCodes = ['accessList'];

                for (var i = 0; i < objectTypeCodes.length; i++) {
                    if (!checkAccess({objectTypeCode: objectTypeCodes[i]})) {
                        return false;
                    }
                }

                return true;
            }

            function checkCompanyAdminAccess() {
                var objectTypeCodes = ['company', 'vacancy'];

                for (var i = 0; i < objectTypeCodes.length; i++) {
                    if (!checkAccess({objectTypeCode: objectTypeCodes[i]})) {
                        return false;
                    }
                }

                return true;
            }

            function checkCompanyUserAccess() {
                var objectTypeCodes = ['vacancy'];

                for (var i = 0; i < objectTypeCodes.length; i++) {
                    if (checkAccess({objectTypeCode: objectTypeCodes[i]})) {
                        return true;
                    }
                }

                return false;
            }

            function getSecurityObjectsForEdit(accessList) {
                var codeSet = codeSvc.getLocalizedCodeSet('objectType');
                var objects = [];

                codeSet.codes.forEach(function (item) {

                    var objectType = {
                        code: item,
                        operations: ko.observableArray()
                    };

                    codeSvc.getMappedCodes('objectType', 'operationType', item.codeValue()).forEach(function (operationCode) {
                        objectType.operations.push({
                            isSelected: ko.observable(accessList.checkAccess(item.codeValue(), operationCode.codeValue())),
                            code: operationCode
                        });
                    });

                    objects.push(objectType);
                });

                return objects;
            }

            function getUserGroupName(id) {
                var item = ko.utils.arrayFirst(datacontext.userGroups.items(), function (item) {
                    return item && item.id() === id;
                });

                return item ? item.name() : '<i class="fa fa-ban make-danger"></i>';
            }

            function listCompanyAccess() {
                var objectTypeCodes = ['company'];
                var companies = [];

                for (var i = 0; i < datacontext.companies.items().length; i++) {
                    var company = datacontext.companies.items()[i];

                    for (var o = 0; o < objectTypeCodes.length; o++) {
                        if (checkAccess({partyId: company.organizationId(), objectTypeCode: objectTypeCodes[o]})) {
                            companies.push(company);
                            continue;
                        }
                    }
                }

                return companies;
            }

            function listCompanyVacancyAccess() {
                var objectTypeCodes = ['vacancy'];
                var companies = [];

                for (var i = 0; i < datacontext.companies.items().length; i++) {
                    var company = datacontext.companies.items()[i];

                    for (var o = 0; o < objectTypeCodes.length; o++) {
                        if (checkAccess({partyId: company.organizationId(), objectTypeCode: objectTypeCodes[o]})) {
                            companies.push(company);
                            continue;
                        }
                    }
                }

                return companies;
            }

            function updateAccessList(accessList, objects) {
                var operations = [];

                accessList.operations([]);

                objects.forEach(function (objectType) {
                    objectType.operations().filter(function (operation) {
                        return operation.isSelected();
                    }).forEach(function (selectedOperation) {
                        var operation = new model.AccessListOperation();

                        operation.objectTypeCode(objectType.code.codeValue());
                        operation.operationTypeCode(selectedOperation.code.codeValue());

                        operations.push(operation);
                    });
                });

                accessList.operations(operations);
            }
        }
    );
})();
