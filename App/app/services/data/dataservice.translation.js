(function () {
    'use strict';

    define([
            'services/data/dataaccess',
            'model/model'
        ],
        function (dataaccess, model) {

            var service = {
                getItem: getItem,
                newItem: newItem
            };

            init();

            return service;

            function init() {
                
                dataaccess.defineGet('getDefinitions', 'language/{languageCode}');
            }

            function getItem(callbacks, languageCode) {
                return dataaccess.request('getDefinitions', callbacks, {
                    languageCode: languageCode
                });
            }

            function newItem() {
                return new model.Translation();
            }
        });
})();