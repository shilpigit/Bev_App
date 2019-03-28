(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var VacancySearchParameter = function () {
                var self = this;

                self.searchPhrase = ko.observable();
                self.orderByCodeValue = ko.observable();
                self.countryCodeValue = ko.observable();
                self.industryExperienceCodeValue = ko.observable();
                self.employmentTypeCodeValue = ko.observable();
                self.salarySoughtCurrencyCodeValue = ko.observable();
                self.salarySoughtAmount = ko.observable();
                self.educationCodeValue = ko.observable();
                self.summaryOfExperienceCategoryCodeValue = ko.observable();
                self.experienceDisciplineFirstLevelCodeValue = ko.observable();
                self.experienceDisciplineSecondLevelCodeValue = ko.observable();
                self.token = ko.observable();

            };

            ko.utils.extend(VacancySearchParameter.prototype, Item);

            return VacancySearchParameter;
        });
})();
