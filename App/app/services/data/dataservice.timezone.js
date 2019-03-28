(function () {
    'use strict';

    define([
            'services/data/dataaccess',
            'model/model'
        ],
        function (dataaccess, model) {

            var service = {
                getItems: getItems,
                newItem: newItem
            };

            init();

            return service;

            function init() {
                dataaccess.defineGet('getTimeZones', 'timezone/items');
            }

            function getItems(callbacks) {
                return dataaccess.request('getTimeZones', callbacks);
            }

            function newItem(){
                return new model.timeZone();
            }
       });
})();