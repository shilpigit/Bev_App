(function () {
    'use strict';

    define(['model/companyEquipment','model/item'],
        function (CompanyEquipment, Item) {

            var CompanyEquipmentContainer = function () {
                var self = this;

                self.state = function () {};
                self.id = ko.observable();
                self.equipment = new CompanyEquipment();
                self.catalogueFileLocation = ko.observable();
                self.catalogueFileReference = ko.observable();

            };

            ko.utils.extend(CompanyEquipmentContainer.prototype, Item);

            return CompanyEquipmentContainer;
        });
})();
