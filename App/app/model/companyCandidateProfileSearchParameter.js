(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var CompanyCandidateProfileSearchParameter = function () {
                var self = this;

                self.state = function () {
                };

                self.token = ko.observable();
                self.searchPhrase = ko.observable();
                self.countryCodeValue = ko.observable();
                self.educationCodeValue = ko.observable();
                self.nationalityCodeValue = ko.observable();
                self.industryExperienceCodeValue = ko.observable();               
                self.summaryOfExperienceCategoryCodeValue = ko.observable();
                self.experienceDisciplineFirstLevelCodeValue = ko.observable();
                self.experienceDisciplineSecondLevelCodeValue = ko.observable();
                self.categoryOfPersonnelCodeValue = ko.observable();  
                self.resourceType = ko.observable('company');
            };

            ko.utils.extend(CompanyCandidateProfileSearchParameter.prototype, Item);

            return CompanyCandidateProfileSearchParameter;
        });
})();
