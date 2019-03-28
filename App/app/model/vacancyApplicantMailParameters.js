(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var VacancyApplicantMailParameter = function () {
                var self = this;

                self.templateId = ko.observable();
                self.body = ko.observable();
                self.subject = ko.observable();
                self.tos = ko.observableArray();
                self.vacancyId = ko.observable();
                self.companyId = ko.observable();

            };

            ko.utils.extend(VacancyApplicantMailParameter.prototype, Item);

            return VacancyApplicantMailParameter;
        });
})();
