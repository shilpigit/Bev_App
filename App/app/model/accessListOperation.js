(function () {
    'use strict';

    define([],
        function () {

            var AccessListOperation = function () {
                var self = this;

                self.objectTypeCode = ko.observable();
                self.operationTypeCode = ko.observable();
            };

            return AccessListOperation;
        });
})();