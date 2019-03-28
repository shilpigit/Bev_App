(function () {
    'use strict';

    define(['model/item', 'services/core/logger', 'services/party'],
        function (Item, logger, party) {

            var Organization = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () { };
                self.countryCode = ko.observable();
                self.names = ko.observableArray();

                self.names.displayName = ko.pureComputed({
                    read: function () {
                        var namePart = party.getPartyName(self.names, 'displayName');

                        return namePart && namePart.name();
                    },
                    write: function (value) {
                        party.setPartyName(self.names, 'displayName', value);
                    }
                });
            };

            ko.utils.extend(Organization.prototype, Item);

            return Organization;
        });
})();
