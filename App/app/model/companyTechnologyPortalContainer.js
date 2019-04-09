(function () {
    'use strict';

    define(['model/companyTechnologyShowcasePortal', 'model/item'],
        function (companyTechnologyPortal, Item) {

            var CompanyTechnologyPortalContainer = function () {
                var self = this;
                self.state = function () { };
                self.id = ko.observable();
                self.technologyPortal = new companyTechnologyPortal();
                self.catalogueFileLocation = ko.observable();
                self.catalogueFileReference = ko.observable();
                self.categories = ko.observableArray();
            };

            ko.utils.extend(CompanyTechnologyPortalContainer.prototype, Item);

            return CompanyTechnologyPortalContainer;
        });
})();