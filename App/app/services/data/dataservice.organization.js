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
            dataaccess.defineGet('getOrganizations', 'organization');
            dataaccess.definePut('putOrganization', 'organization');
            dataaccess.definePost('postOrganization', 'organization');
        }

        function getItems(callbacks) {
            return dataaccess.request('getOrganizations', callbacks);
        }

        function newItem() {
            return new model.Organization();
        }

        function saveItem(callbacks, data) {
            return dataaccess.save(data.id ? 'putOrganization' : 'postOrganization', callbacks, data);
        }
    });
})();