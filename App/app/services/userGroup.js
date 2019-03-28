(function () {
    'use strict';

    define(['services/core/logger',
            'services/data/dataservice'],
        function (logger, dataservice) {

            var service = {
                deleteUserFromGroup: deleteUserFromGroup
            };

            return service;


            function deleteUserFromGroup( groupId, userAccountId) {
                return $.Deferred(function (def) {
                    dataservice.userGroup.deleteUserFromGroup({
                        success: function () {
                            def.resolve();
                        },
                        error: function (response) {
                            logger.logError('Failed to remove User from Group. ' + response);
                            def.reject(response);
                        }
                    }, groupId, userAccountId);
                }).promise();
            }

        });
})();
