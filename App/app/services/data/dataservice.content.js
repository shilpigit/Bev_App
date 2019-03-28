(function () {
    'use strict';

    define([
            'services/data/dataaccess',
            'model/model'
        ],
        function (dataaccess, model) {

            var service = {
                getItems: getItems,
                getItemByKey: getItemByKey,
                newItem: newItem,
                saveItem: saveItem
            };

            init();

            return service;

            function init() {
                dataaccess.defineGet('getContents', 'content');
                dataaccess.defineGet('getContentByKey', 'content');
                dataaccess.definePut('putContent', 'content');
                dataaccess.definePost('postContent', 'content');
            }

            function getItems(callbacks) {
                return dataaccess.request('getContents', callbacks);
            }

            function getItemByKey(callbacks, keyCodeValue) {
                return dataaccess.request('getContents', callbacks, keyCodeValue);
            }

            function saveItem(callbacks, data) {
                return dataaccess.save(data.id ? 'putContent' : 'postContent', callbacks, data);
            }

            function newItem() {
                return new model.Content();
            }

        });
})();
