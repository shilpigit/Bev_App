(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var CompanyEquipment = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.name = ko.observable();
                self.category = ko.observable();
                self.typeCodeValue = ko.observable();
                self.regionCodeValue = ko.observable();
                self.yearCodeValue = ko.observable();
                self.features = ko.observable();
                self.createdDateTime = ko.observable();
                self.contactPersonFullName = ko.observable();
                self.contactPersonEmailAddress = ko.observable();
                self.contactPersonPhoneNumber = ko.observable();
                self.catalogueFileId = ko.observable();

            };

            ko.utils.extend(CompanyEquipment.prototype, Item);

            return CompanyEquipment;
        });
})();
