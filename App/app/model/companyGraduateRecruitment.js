(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var companyGraduateRecruitment = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.campaignTitle = ko.observable();
                self.contactPersonFullName = ko.observable();
                self.contactPersonTitle = ko.observable();
                self.contactPersonNumber = ko.observable();
                self.contactPersonEmailAddress = ko.observable();
                self.availablePositions = ko.observable();
                self.dateOfIntake = ko.observable();
                self.createdDateTime = ko.observable();
                self.preferredContactMethod = ko.observable();

            };

            ko.utils.extend(companyGraduateRecruitment.prototype, Item);

            return companyGraduateRecruitment;
        });
})();
