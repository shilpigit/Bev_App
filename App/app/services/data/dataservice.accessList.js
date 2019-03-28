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
                saveItem: saveItem
            };

            init();

            return service;

            function init() {
                dataaccess.defineDelete('deleteAccessList', 'security/accessList');
                dataaccess.defineGet('getAccessLists', 'security/accessList/');
                dataaccess.definePut('putAccessList', 'security/accessList');
                dataaccess.definePost('postAccessList', 'security/accessList');
            }

            function deleteItem(callbacks, id) {
                dataaccess.request('deleteAccessList', callbacks, {id: id});
            }

            function getItems(callbacks) {
                return dataaccess.request('getAccessLists', callbacks);
            }

            function saveItem(callbacks, data) {
                return dataaccess.save('putAccessList', callbacks, data);
            }

            function newItem() {
                return new model.PrincipalAccessList();
            }
        });
})();