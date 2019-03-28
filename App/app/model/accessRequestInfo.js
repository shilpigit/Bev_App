(function () {
    'use strict';

    define(['model/item', 'model/user', 'model/accessRequest'],
        function (Item, User, AccessRequest) {

            var AccessRequestInfo = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {
                };

                self.relatedGroupId = ko.observable();
                self.confirmUser = ko.observable();

                self.accessRequest = new AccessRequest();

            };

            ko.utils.extend(AccessRequest.prototype, Item);

            return AccessRequestInfo;
        });
})();
