(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var AdminQuaterlyAwardsNominationForm = function () {
                var self = this;

                self.state = function () { };
                self.setSelectedView = ko.observableArray();
                self.firstName = ko.observable();
                self.lastName = ko.ob();
                self.lenthOfEmployment = ko.observable();
                self.currentPositionHeld = ko.observable();
                self.nomineeEmailAddress = ko.observable();
                self.nomineeContactNumber = ko.observable()
            };

            ko.utils.extend(AdminQuaterlyAwardsNominationForm.prototype, Item);

            return AdminQuaterlyAwardsNominationForm;
        });
})();
