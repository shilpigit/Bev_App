(function () {
    'use strict';

    define(['services/core/logger'],
        function (logger) {

            var Item = {

                commit: function () {
                    if (this === window || !this) {
                        return;
                    }

                    this.state.latestData = ko.toJS(this);
                },

                update: function (data) {
                    if (this === window || !this) {
                        return;
                    }

                    if (!this.state){
                        logger.logError('State implementation not found for the item:' + this);
                    }

                    var mapping = this.state.mapping || {};

                    ko.mapping.fromJS(data, mapping, this);

                    this.state.latestData = data;
                },

                revert: function () {
                    if (this === window || !this) {
                        return;
                    }

                    this.update(this.state.latestData);
                }
            };

            return Item;
        });
})();
