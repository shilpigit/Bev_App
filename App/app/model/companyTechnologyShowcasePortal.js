(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var companyTechnologyPortal = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () { };
                self.token = ko.observable();
                self.countryCode = ko.observable();
                self.category = ko.observable();    
                self.description = ko.observable();
                self.catalogueFileId = ko.observable();
                self.contactPerson = ko.observable();
                self.email = ko.observable();
                self.telephoneNumber = ko.observable();
                self.categoryList = ko.observableArray([]);
                self.isflag = ko.observable();
            };
            ko.utils.extend(companyTechnologyPortal.prototype, Item);

            return companyTechnologyPortal;
        });
})();