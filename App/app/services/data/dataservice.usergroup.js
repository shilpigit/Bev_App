(function () {
    'use strict';

    define(['services/data/dataaccess',
            'services/data/dataaccessAlt',
            'model/model'],
        function (dataaccess, dataaccessAlt, model) {

            var service = {
                getItems: getItems,
                newItem: newItem,
                saveItem: saveItem,
                deleteItem: deleteItem,
                deleteUserFromGroup: deleteUserFromGroup
            };

            init();

            return service;

            function init() {
                dataaccess.defineGet('getUserGroups', 'usergroup');
                dataaccess.definePut('putUserGroup', 'usergroup');
                dataaccess.definePost('postUserGroup', 'usergroup');
                dataaccess.defineDelete('deleteUserGroup', 'usergroup');
            }

            function deleteItem(callbacks, id) {
                dataaccess.request('deleteUserGroup', callbacks, {id: id});
            }

            function deleteUserFromGroup(callbacks, groupId, userAccountId) {
                return dataaccessAlt.remove('usergroup/' + groupId + '/' + userAccountId, callbacks);
            }

            function getItems(callbacks, id) {
                return dataaccess.request('getUserGroups', callbacks, {id: id});
            }

            function newItem() {
                return new model.UserGroup();
            }

            function saveItem(callbacks, data) {
                // Save (put/post)
                return dataaccess.save(data.id ? 'putUserGroup' : 'postUserGroup', callbacks, data);
            }
        });
})();