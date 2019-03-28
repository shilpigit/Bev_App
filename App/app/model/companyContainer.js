(function () {
    'use strict';

    define(['model/company', 'model/item', 'model/AccessListOperation', 'model/AccessRequest', 'model/User', 'model/PrincipalAccessList'],
        function (Company, Item, AccessListOperation, AccessRequest, User, PrincipalAccessList) {

            var CompanyContainer = function () {
                var self = this;

                self.state = function () {};
                self.id = ko.observable();
                self.companyName = ko.observable();
                self.company = new Company();
                self.owner = new User();
                self.principalAccessList = ko.observableArray();
                self.userGroups = ko.observableArray();
                self.accessRequests = ko.observableArray();
                self.operations = ko.observableArray();
                self.isOwner = ko.observable();
                self.logoImageLocation = ko.observable();
                self.logoImageReference = ko.observable();
                self.cvFileLocation = ko.observable();
                self.cvFileReference = ko.observable();

                self.state.mapping = {
                    'accessRequests': {
                        create: function (options) {
                            var request = new AccessRequest();

                            ko.mapping.fromJS(options.data, request.mapping || {}, request);

                            return request;
                        }
                    },
                    'userGroups': {
                        create: function (options) {
                            var request = new AccessRequest();

                            ko.mapping.fromJS(options.data, request.mapping || {}, request);

                            return request;
                        }
                    },
                    'principalAccessList': {
                        create: function (options) {
                            var accessList = new PrincipalAccessList();

                            ko.mapping.fromJS(options.data, accessList.mapping || {}, accessList);

                            return accessList;
                        }
                    },
                    'operations': {
                        create: function (options) {
                            var operation = new AccessListOperation();

                            ko.mapping.fromJS(options.data, operation.mapping || {}, operation);

                            return operation;
                        }
                    }
                };
            };

            ko.utils.extend(CompanyContainer.prototype, Item);

            CompanyContainer.prototype.checkAccess = function (objectTypeCode, operationTypeCode) {
                return this.isOwner() || this.operations().filter(function (operation) {
                        return operation.objectTypeCode() === objectTypeCode && (operation.operationTypeCode() === operationTypeCode || !operationTypeCode);
                    }).length > 0;
            };

            return CompanyContainer;
        });
})();
