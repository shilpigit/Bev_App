(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var VacancyApplicant = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.userAccountId = ko.observable();
                self.createdDateTime = ko.observable();
                self.isDeleted = ko.observable();
                self.isViewed = ko.observable();
                self.vacancyId = ko.observable();
                self.sentMessageTemplateId = ko.observable();
                self.messageSenderUserAccountId = ko.observable();
                self.sentMessageDateTime = ko.observable();

                self.formattedCreatedDateTime = ko.pureComputed(function () {                    
                    if (self.createdDateTime()) {
                        return moment(self.createdDateTime()).format('MMMM Do YYYY');
                    }
                    else {
                        return 'Who Knows!';
                    }
                });

                self.relativeFormattedCreatedDateTime = ko.pureComputed(function () {
                    if (self.createdDateTime()) {
                        return moment(self.createdDateTime()).fromNow();
                    }
                    else {
                        return 'Who Knows!';
                    }
                });

            };

            ko.utils.extend(VacancyApplicant.prototype, Item);

            return VacancyApplicant;
        });
})();
