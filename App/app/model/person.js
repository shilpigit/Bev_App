(function () {
    'use strict';

    define(['model/item', 'services/party'],
        function (Item, party) {

            var Person = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function() {};
                self.genderCode = ko.observable();
                self.languageCode = ko.observable();
                self.birthDateTime = ko.observable();
                self.expectedBirthDateTime = ko.observable();
                self.deathDateTime = ko.observable();
                self.preferredWeightUomCode = ko.observable();
                self.preferredHeightUomCode = ko.observable();
                self.weightKg = ko.observable(0);
                self.heightCm = ko.observable(0);
                self.subscribeForUpdate = ko.observable();
                self.photoImageId = ko.observable();
                self.photoImageLocation = ko.observable();
                self.photoImageReference = ko.observable();

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

                self.names.middleNames = ko.pureComputed({
                    read: function () {
                        var namePart = party.getPartyName(self.names, 'middleName');

                        return namePart && namePart.name();
                    },
                    write: function (value) {
                        party.setPartyName(self.names, 'middleName', value);
                    }
                });
            
                self.names.fullName = ko.pureComputed(function () {
                    return self.names.firstName() + ' ' + self.names.lastName();
                });

            };

            ko.utils.extend(Person.prototype,Item);

            return Person;
        });
})();
