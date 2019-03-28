(function() {
    'use strict';

    define([
        'services/data/dataaccessAlt',
        'model/model'
    ],
    function(dataaccess, model) {

        var service = {
            deleteEvent: deleteEvent,
            getItems: getItems,
            newItem: newItem,
            saveEvent: saveEvent
        };

        return service;

        function deleteEvent(callbacks, collectionId, partyEventId) {
            dataaccess.remove(getUrl(collectionId) + '/' + partyEventId, callbacks);
        }

        function getItems(callbacks, partyId) {
            return dataaccess.request('getCollections', callbacks, { partyId: partyId });
        }

        function saveEvent(callbacks, data, collectionId) {
            if (ko.unwrap(data.id)) {
                dataaccess.put(getUrl(collectionId), callbacks, data);
            }
            else{
                dataaccess.post(getUrl(collectionId), callbacks, data);
            }
        }

        function newItem() {
            return new model.Event();
        }

        function getUrl(collectionId) {
            return 'collection/' + collectionId + '/items';
        }
    });
})();
