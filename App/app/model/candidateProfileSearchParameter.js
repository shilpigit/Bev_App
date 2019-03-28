(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var CandidateProfileSearchParameter = function () {
                var self = this;

                self.state = function () {
                };

                self.token = ko.observable();
                self.searchPhrase = ko.observable();
                self.countryCodeValue = ko.observable();
                self.educationCodeValue = ko.observable();
                self.nationalityCodeValue = ko.observable();
                self.employmentTypeCodeValue = ko.observable();
                self.industryExperienceCodeValue = ko.observable();
                self.salarySoughtCurrencyCodeValue = ko.observable();
                self.salarySoughtAmount = ko.observable();
                self.summaryOfExperienceCategoryCodeValue = ko.observable();
                self.experienceDisciplineFirstLevelCodeValue = ko.observable();
                self.experienceDisciplineSecondLevelCodeValue = ko.observable();
                self.currentAvailabilityCodeValue = ko.observable();
                self.willingToRelocateCodeValue = ko.observable();
                self.authorizedToWorkCodeValue = ko.observable();
                self.willingToTravel = ko.observable();
                self.categoryOfPersonnelCodeValue = ko.observable();  
                self.resourceType = ko.observable('candidateProfile');
            };

            ko.utils.extend(CandidateProfileSearchParameter.prototype, Item);

            return CandidateProfileSearchParameter;
        });
})();
