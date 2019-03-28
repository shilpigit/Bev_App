(function () {
    'use strict';

    define(['model/item', 'model/user'],
        function (Item, User) {

            var UserPrincipal = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.accessLists = ko.observableArray();
                self.user = new User();
                self.hasPendingRequest = ko.observable();
            };

            ko.utils.extend(UserPrincipal.prototype, Item);

            return UserPrincipal;
        });
})();