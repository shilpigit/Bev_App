(function () {
    'use strict';

    define(['model/item', 'model/user', 'model/accessList'],
        function (Item, User, AccessList) {

            var AccessRequest = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {
                };

                self.statusCode = ko.observable();

                self.accessList = new AccessList();
                self.user = new User();

            };

            ko.utils.extend(AccessRequest.prototype, Item);

            return AccessRequest;
        });
})();
