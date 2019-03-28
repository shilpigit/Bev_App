(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var companyDiscipline = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.regionCodeValue = ko.observable();
                self.expertiseIndustryCodeValue = ko.observable();
                self.positionCodeValue = ko.observable();
                self.description = ko.observable();
                self.fullName = ko.observable();
                self.emailAddress = ko.observable();

            };

            ko.utils.extend(companyDiscipline.prototype, Item);

            return companyDiscipline;
        });
})();
