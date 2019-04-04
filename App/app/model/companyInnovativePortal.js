(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var companyInnovativePortal = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () { };
                //self.candidateProfile = new CandidateProfile();
                self.token = ko.observable();               
                self.countryCode = ko.observable();
                self.category = ko.observable();
                self.idea = ko.observable();
                self.seekingCodeValues = ko.observableArray([]);
                self.description = ko.observable();
                self.catalogueFileId = ko.observable();
                self.contactPerson = ko.observable();
                self.email = ko.observable();
                self.telephoneNumber = ko.observable();
                self.categoryList = ko.observableArray([]);
                self.isflag = ko.observable();
            };
            ko.utils.extend(companyInnovativePortal.prototype, Item);

            return companyInnovativePortal;
        });
})();