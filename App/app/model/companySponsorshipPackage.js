(function () {
    'use strict';

    define(['services/core/config', 'model/item'],
        function (config, Item) {

            var CompanySponsorshipPackage = function () {
                var self = this;

                self.state = function () {};
                self.packageCodeValue = ko.observable();
                self.administratorsCount = ko.observable();
                self.executivesCount = ko.observable();
                self.employeesCount = ko.observable();
                self.vacanciesCount = ko.observable();
            };

            ko.utils.extend(CompanySponsorshipPackage.prototype, Item);

            return CompanySponsorshipPackage;
        });
})();
