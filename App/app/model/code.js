(function () {
    'use strict';

    define([],
        function () {

            var Code = function () {
                var self = this;

                self.codeValue = ko.observable();
                self.dataDefinitionId = ko.observable();
                self.defaultText = ko.observable();
            };

            return Code;
        });
})();