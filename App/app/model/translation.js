(function () {
    'use strict';

    define(['model/item'],
        function (Item) {

            var Translation = function () {
                var self = this;

                self.state = function() {};
            };

            ko.utils.extend(Translation.prototype, Item);

            return Translation;
        });
})();
