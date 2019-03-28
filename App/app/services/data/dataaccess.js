(function () {
    'use strict';

    define([
            'amplify',
            'services/core/config',
            'services/core/logger',
            'services/core/state'
        ],
        function (amplify, config, logger, state) {

            var service = {
                defineDelete: defineDelete,
                defineGet: defineGet,
                definePut: definePut,
                definePost: definePost,
                request: request,
                save: save
            };

            return service;

            function defineGet(resourceId, partialUrl) {
                amplify.request.define(resourceId, 'ajax', {
                    url: config.root + 'api/' + partialUrl,
                    dataType: 'json',
                    type: 'GET',
                    beforeSend: beforeSend
                });
            }

            function definePost(resourceId, partialUrl) {
                amplify.request.define(resourceId, 'ajax', {
                    url: config.root + 'api/' + partialUrl,
                    contentType: 'application/json',
                    dataType: 'json',
                    type: 'POST',
                    beforeSend: beforeSend
                });
            }

            function definePut(resourceId, partialUrl) {                
                amplify.request.define(resourceId, 'ajax', {
                    url: config.root + 'api/' + partialUrl,
                    contentType: 'application/json',
                    dataType: 'json',
                    type: 'PUT',
                    beforeSend: beforeSend
                });
            }

            function defineDelete(resourceId, partialUrl, cfg) {
                cfg = cfg || {id: true};

                if (cfg.id) {
                    partialUrl += '/{id}';
                }

                amplify.request.define(resourceId, 'ajax', {
                    url: config.root + 'api/' + partialUrl,
                    dataType: 'json',
                    type: 'DELETE',
                    beforeSend: beforeSend
                });
            }

            function request(resourceId, callbacks, data) {
                return amplify.request({
                    data: data,
                    resourceId: resourceId,
                    success: callbacks.success,
                    error: callbacks.error
                });
            }

            function save(resourceId, callbacks, data) {
                return request(resourceId, callbacks, ko.toJSON(data));
            }

            function beforeSend(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + state.token);
            }
        });
})();
