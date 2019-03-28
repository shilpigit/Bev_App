(function () {
    'use strict';

    define(['model/candidateProfile', 'model/item', 'model/user'],
        function (CandidateProfile, Item, User) {

            var CompanyContainer = function () {
                var self = this;

                self.state = function () {
                };

                self.id = ko.observable();
                self.candidateProfile = new CandidateProfile();
                self.owner = new User();
                self.isOwner = ko.observable();
                self.cvFileLocation = ko.observable();
                self.cvFileReference = ko.observable();
                self.cvHighlightedText = ko.observable();

            };

            ko.utils.extend(CompanyContainer.prototype, Item);

            return CompanyContainer;
        });
})();
