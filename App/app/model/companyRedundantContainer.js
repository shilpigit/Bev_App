(function () {
    'use strict';

    define(['model/companyRedundantProfile','model/item'],
        function (CompanyRedundantProfile, Item) {

            var CompanyRedundantContainer = function () {
                var self = this;

                self.state = function () {};
                self.id = ko.observable();
                self.redundant = new CompanyRedundantProfile();
                //self.catalogueFileLocation = ko.observable();
                //self.catalogueFileReference = ko.observable();

            };

            ko.utils.extend(CompanyRedundantContainer.prototype, Item);

            return CompanyRedundantContainer;
        });
})();
