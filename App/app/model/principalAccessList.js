(function () {
    'use strict';

    define(['model/item', 'model/accessList', 'model/User'],
        function (Item, AccessList, User) {

            var PrincipalAccessList = function () {
                var self = this;

                self.state = function () {};
                self.principalId = ko.observable();
                self.accessList = new AccessList();
                self.id = ko.observable();
                self.user = new User();

                self.state.mapping = {
                    'accessList': {
                        create: function (options) {
                            var request = new AccessList();

                            ko.mapping.fromJS(options.data, request.mapping || {}, request);

                            return request;
                        }
                    }
                };
            };


            ko.utils.extend(PrincipalAccessList.prototype, Item);

            return PrincipalAccessList;
        });
})();