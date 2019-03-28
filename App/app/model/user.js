(function () {
    'use strict';

    define(['services/core/config', 'model/item', 'model/person', 'moment'],
        function (config, Item, Person, moment) {

            var User = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.userName = ko.observable();
                self.emailAddress = ko.observable();
                self.uomLengthCode = ko.observable();
                self.uomWeightCode = ko.observable();
                self.createdDateTime = ko.observable();
                self.person = new Person();

                self.formattedCreatedDateTime = ko.computed(function () {
                    return moment(self.createdDateTime()).format(config.dateTimeFormat);
                });
            };

            ko.utils.extend(User.prototype, Item);

            return User;
        });
})();
