(function () {
    'use strict';

    define(['services/core/logger',
            'services/data/datacontext',
            'services/data/dataservice',
            'services/core/security',
            'model/model'],
        function (logger, datacontext) {

            var service = {
                getByKeyCodeValue: getByKeyCodeValue
            };

            return service;

            function getByKeyCodeValue(keyCodeValue) {
                var matchingItems = ko.utils.arrayFilter(datacontext.contents.items(), function (el) {
                    return el.keyCodeValue() === keyCodeValue;
                });

                if (matchingItems.length === 1) {
                    return matchingItems[0];
                }

                throw new Error('Unable to find item with id ' + keyCodeValue);
            }
        });
})();
