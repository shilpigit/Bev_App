(function () {
    'use strict';

    define(['services/core/config', 'model/item'],
        function (config, Item) {

            var Content = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.keyCodeValue = ko.observable();
                self.languageCode = ko.observable();
                self.text = ko.observable();
                self.categoryCodeValue = ko.observable();
                self.isPublic = ko.observable();
            };

            ko.utils.extend(Content.prototype, Item);

            return Content;
        });
})();
