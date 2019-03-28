(function () {
    'use strict';

    define([
            'services/data/datacontext',
            'services/data/dataservice',
            'model/model',
            'services/core/logger'],
        function (datacontext, dataservice, model, logger) {

            var service = {
                acceptInvitation: acceptInvitation
            };

            return service;

            function acceptInvitation (acceptInvitationData) {

                var entityJson = ko.mapping.toJS(acceptInvitationData);

                return $.Deferred(function (def) {
                    dataservice.user.acceptInvitation({
                        success: function () {
                            def.resolve();
                        },
                        error: function (response) {
                            logger.log('Failed to Accept Invitation. ' + response);
                            def.reject();
                        }
                    }, entityJson);
                }).promise();
            }

        });
})();