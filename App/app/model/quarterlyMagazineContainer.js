(function () {
    'use strict';

    define(['model/quarterlyMagazine', 'model/item'],
        function (QuarterlyMagazine, Item) {

            var QuarterlyMagazineContainer = function () {
                var self = this;

                self.state = function () {};
                self.id = ko.observable();
                self.quarterlyMagazine = new QuarterlyMagazine();
                self.fileLocation = ko.observable();
                self.fileReference = ko.observable();
                self.coverFileLocation = ko.observable();
                self.coverFileReference = ko.observable();

            };

            ko.utils.extend(QuarterlyMagazineContainer.prototype, Item);

            return QuarterlyMagazineContainer;
        });
})();
