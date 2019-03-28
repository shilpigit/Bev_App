(function () {
    'use strict';

    define([
            'services/data/dataaccess', 'model/model'
        ],
        function (dataaccess, model) {

            var service = {
                getItems: getItems,
                newItem: newItem
            };

            init();

            return service;

            function init() {
                dataaccess.defineGet('getCodeMappings', 'code/mapping');
            }

            function getItems(callbacks) {
                return dataaccess.request('getCodeMappings', callbacks);
            }

            function newItem() {
                return new model.CodeMapping();
            }
        });
})();
