(function () {
    'use strict';

    define([
            'services/data/dataaccess',
            'model/model'
        ],
        function (dataaccess, model) {

            var service = {
                deleteItem: deleteItem,
                getItems: getItems,
                newItem: newItem,
                saveItem: saveItem,
                getItem: getItem
            };

            init();

            return service;

            function init() {

                dataaccess.defineGet('getQuarterlyMagazineContainer', 'quarterlymagazine/QuarterlyMagazineContainer/{id}');
                dataaccess.defineGet('getQuarterlyMagazineContainers', 'quarterlymagazine/quarterlymagazinecontainer');
                dataaccess.defineGet('getQuarterlyMagazines', 'quarterlymagazine');

                dataaccess.defineDelete('deleteQuarterlyMagazine', 'quarterlymagazine');

                dataaccess.definePut('putQuarterlyMagazine', 'quarterlymagazine');
                dataaccess.definePost('postQuarterlyMagazine', 'quarterlymagazine');
            }

            function deleteItem(callbacks, id) {
                dataaccess.request('deleteQuarterlyMagazine', callbacks, {id: id});
            }

            function saveItem(callbacks, data) {
                return dataaccess.save(data.id ? 'putQuarterlyMagazine' : 'postQuarterlyMagazine', callbacks, data);
            }

            function getItems(callbacks) {
                return dataaccess.request('getQuarterlyMagazineContainers', callbacks);
            }

            function getItem(callbacks, id) {
                return dataaccess.request('getQuarterlyMagazineContainer', callbacks, {id: id});
            }

            function newItem() {
                return new model.QuarterlyMagazineContainer();
            }
        });
})();
