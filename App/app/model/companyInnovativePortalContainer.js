(function () {
    'use strict';

    define(['model/companyInnovativePortal','model/item'],
        function (companyInnovativePortal, Item) {

            var CompanyInnovativePortalContainer = function () {
                var self = this;

                self.state = function () {};
                self.id = ko.observable();
                self.innovativePortal = new companyInnovativePortal();
                self.catalogueFileLocation = ko.observable();
                self.catalogueFileReference = ko.observable();
                self.categories = ko.observableArray();               
            };

            ko.utils.extend(CompanyInnovativePortalContainer.prototype, Item);

            return CompanyInnovativePortalContainer;
        });
})();
