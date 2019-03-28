(function () {
    'use strict';

    define(['services/party'],
        function (party) {

            var User = function () {
                var self = this;

                self.id = ko.observable();
                self.userName = ko.observable();
                self.names = ko.observableArray();

                self.names.firstName = ko.pureComputed({
                    read: function () {
                        var namePart = party.getPartyName(self.names, 'firstName');

                        return namePart ? namePart.name() : '';
                    },
                    write: function (value) {
                        party.setPartyName(self.names, 'firstName', value);
                    }
                });

                self.names.lastName = ko.pureComputed({
                    read: function () {
                        var namePart = party.getPartyName(self.names, 'lastName');

                        return namePart ? namePart.name() : '';
                    },
                    write: function (value) {
                        party.setPartyName(self.names, 'lastName', value);
                    }
                });

                self.names.fullName = ko.pureComputed(function () {
                    return self.names.firstName() + ' ' + self.names.lastName();
                });
            };

            return User;
        });
})();
