(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var SalarySought = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.currencyCodeValue = ko.observable();
                self.amount  = ko.observable();

            };

            ko.utils.extend(SalarySought.prototype, Item);

            return SalarySought;
        });
})();
