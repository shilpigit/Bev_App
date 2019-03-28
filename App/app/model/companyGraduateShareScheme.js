(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var companyGraduateShareScheme = function () {
                var self = this;

                self.state = function () {};
                self.contactPersonFullName = ko.observable();
                self.contactPersonTitle = ko.observable();
                self.contactPersonNumber = ko.observable();
                self.contactPersonEmailAddress = ko.observable();

            };

            ko.utils.extend(companyGraduateShareScheme.prototype, Item);

            return companyGraduateShareScheme;
        });
})();
