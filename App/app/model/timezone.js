(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var TimeZone = function () {
                var self = this;

                self.state = function () {};
                self.id = ko.observable();
                self.state = function () {};
                self.displayName = ko.observable();
            };

            ko.utils.extend(TimeZone.prototype, Item);

            return TimeZone;
        });
})();