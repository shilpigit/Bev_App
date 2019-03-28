(function () {
    'use strict';

    define(['services/core/config', 'model/item'],
        function (config, Item) {

            var Template = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.typeCode = ko.observable();
                self.languageCode = ko.observable();
                self.subject = ko.observable();
                self.templateId = ko.observable();
                self.text = ko.observable();
            };

            ko.utils.extend(Template.prototype, Item);

            return Template;
        });
})();
