(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var companyRequirement = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () { };
                self.regionCodeValue = ko.observable();
                self.expertiseIndustryCodeValue = ko.observable();
                self.subject = ko.observable();
                self.description = ko.observable();
                self.expireDateTime = ko.observable();
                self.createdDateTime = ko.observable();
                self.contactPersonFullName = ko.observable();
                self.contactPersonEmailAddress = ko.observable();
                self.contactPersonPhoneNumber = ko.observable();
                self.sectionCodeValue = ko.observable();

            };

            ko.utils.extend(companyRequirement.prototype, Item);

            return companyRequirement;
        });
})();
