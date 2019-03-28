(function () {
    'use strict';

    define(['model/item', 'model/AccessListOperation'],
        function (Item, AccessListOperation) {

            var AccessList = function () {
                var self = this;

                self.state = function () {};
                self.id = ko.observable();
                self.focusAreaCode = ko.observable();
                self.partyId = ko.observable();
                self.operations = ko.observableArray();

                self.state.mapping = {
                    'operations': {
                        create: function (options) {
                            var entry = new AccessListOperation();

                            ko.mapping.fromJS(options.data, {}, entry);

                            return entry;
                        }
                    }
                };
            };

            AccessList.prototype.checkAccess = function(objectTypeCode, operationTypeCode) {
                return this.operations().filter(function(item){
                    return item.objectTypeCode() === objectTypeCode && item.operationTypeCode() === operationTypeCode;
                }).length > 0;
            };

            return AccessList;
        });
})();
