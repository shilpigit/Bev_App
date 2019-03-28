(function() {
    'use strict';

    define([
        'services/data/dataaccess', 'model/model'
        ],
    function(dataaccess, model) {

        var service = {
            getItems: getItems,
            newItem: newItem
        };

        init();

        return service;

        function init() {
            dataaccess.defineGet('getCodeSets', 'code/codeset');
        }

        function getItems(callbacks){
            return dataaccess.request('getCodeSets', callbacks);
        }

        function newItem() {
            return new model.CodeSet();
        }
    });
})();
