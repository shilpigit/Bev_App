(function () {
    'use strict';

    define(['services/data/dataaccess', 'model/model'],
        function (dataaccess, model) {

            var service = {
                getItem: getItem,
                getByUserName: getByUserName,
                newUser: newUser,
                newPrincipal: newPrincipal,
                saveItem: saveItem,
                acceptInvitation: acceptInvitation,
                getUpdateSubscribers:getUpdateSubscribers
            };

            init();

            return service;

            function init() {
                dataaccess.defineGet('getUser', 'user/{id}');
                dataaccess.definePut('putUser', 'user');
                dataaccess.defineGet('getUserByName', 'user/search/{userName}/');
                dataaccess.definePut('acceptInvitation', 'invitation/accept/');
                dataaccess.defineGet('getUpdateSubscribers', 'useraccount/getupdatesubscribers');
            }

            function getItem(callbacks, id) {
                return dataaccess.request('getUser', callbacks, {id: id});
            }

            function getUpdateSubscribers(callbacks) {
                return dataaccess.request('getUpdateSubscribers', callbacks);
            }

            function getByUserName(callbacks, userName) {
                return dataaccess.request('getUserByName', callbacks, {userName: userName});
            }

            function newPrincipal() {
                return new model.UserPrincipal();
            }

            function newUser() {
                return new model.User();
            }

            function saveItem(callbacks, data) {
                return dataaccess.save('putUser', callbacks, data.user);
            }

            function acceptInvitation(callbacks, data) {
                return dataaccess.save('acceptInvitation', callbacks, data);
            }
        });
})();
