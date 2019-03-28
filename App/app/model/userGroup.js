(function () {
    'use strict';

    define(['model/item', 'model/user'],
        function (Item, User) {

            var UserGroup = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.name = ko.observable();
                self.users = ko.observableArray();

                self.state.mapping = {
                    'users': {
                        create: function (options) {
                            var user = new User();

                            ko.mapping.fromJS(options.data, user.mapping || {}, user);

                            return user;
                        }
                    }
                };
            };

            ko.utils.extend(UserGroup.prototype, Item);

            return UserGroup;
        });
})();
