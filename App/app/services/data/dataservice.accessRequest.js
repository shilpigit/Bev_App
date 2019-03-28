(function() {
    'use strict';
    
    define([
        'services/data/dataaccess',
        'model/model'
    ],
    function(dataaccess, model) {

        var service = {
            deleteItem: deleteItem,
            getItems: getItems,
            newItem: newItem,
            saveItem: saveItem
        };

        init();

        return service;

        function init() {
            dataaccess.defineDelete('deleteRequest', 'security/accessRequest');
            dataaccess.defineGet('getRequests', 'security/accessRequest/{partyId}');
            dataaccess.definePut('putRequest', 'security/accessRequest');
            dataaccess.definePost('postRequest', 'security/accessRequest');
        }

        function deleteItem(callbacks, id){
            dataaccess.request('deleteRequest', callbacks, { id: id });
        }

        function getItems(callbacks, partyId) {
            return dataaccess.request('getRequests', callbacks, { partyId: partyId });
        }

        function saveItem(callbacks, data) {
            return dataaccess.save('putRequest', callbacks, data);
        }

        function newItem(){
            return new model.AccessRequest();
        }
    });
})();