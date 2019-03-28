(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var CodeMapping = function () {
                var self = this;

                self.state = function () {};
                self.fromCodeSetId = ko.observable();
                self.fromCode = ko.observable();
                self.toCodeSetId = ko.observable();
                self.toCode = ko.observable();
            };

            ko.utils.extend(CodeMapping.prototype, Item);

            return CodeMapping;
        });
})();