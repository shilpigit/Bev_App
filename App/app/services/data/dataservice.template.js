(function () {
    'use strict';

    define([
            'services/data/dataaccess',
            'model/model'
        ],
        function (dataaccess, model) {

            var service = {
                getItems: getItems,
                newItem: newItem,
                saveItem: saveItem
            };

            init();

            return service;

            function init() {
                dataaccess.defineGet('getTemplates', 'template');
                dataaccess.definePut('putTemplate', 'template');
                dataaccess.definePost('postTemplate', 'template');
            }

            function getItems(callbacks) {
                return dataaccess.request('getTemplates', callbacks);
            }

            function saveItem(callbacks, data) {
                return dataaccess.save(data.id ? 'putTemplate' : 'postTemplate', callbacks, data);
            }

            function newItem() {
                return new model.Template();
            }

        });
})();
