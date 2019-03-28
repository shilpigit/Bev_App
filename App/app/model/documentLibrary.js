(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var DocumentLibrary = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.title = ko.observable();
                self.description = ko.observable();
                self.fileId = ko.observable();
                self.coverFileId = ko.observable();
                self.postedDateTime = ko.observable();
                self.lastUpdateDateTime = ko.observable();
                self.isActive = ko.observable();
                self.isPublic = ko.observable();
                self.formattedLastUpdateDateTime = ko.pureComputed(function () {
                    if (self.lastUpdateDateTime()) {
                        return moment(self.lastUpdateDateTime()).format('MMMM Do YYYY HH:mm');
                    }
                    else {
                        return '';
                    }
                });
                self.formattedPostedDateTime = ko.pureComputed(function () {
                    if (self.postedDateTime()) {
                        return moment(self.postedDateTime()).format('MMMM Do YYYY HH:mm');
                    }
                    else {
                        return '';
                    }
                });

            };

            ko.utils.extend(DocumentLibrary.prototype, Item);

            return DocumentLibrary;
        });
})();
