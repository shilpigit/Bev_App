(function () {
    'use strict';

    define(['model/documentLibrary', 'model/item'],
        function (DocumentLibrary, Item) {

            var DocumentLibraryContainer = function () {
                var self = this;

                self.state = function () {};
                self.id = ko.observable();
                self.documentLibrary = new DocumentLibrary();
                self.fileLocation = ko.observable();
                self.fileReference = ko.observable();
                self.coverFileLocation = ko.observable();
                self.coverFileReference = ko.observable();

            };

            ko.utils.extend(DocumentLibraryContainer.prototype, Item);

            return DocumentLibraryContainer;
        });
})();
