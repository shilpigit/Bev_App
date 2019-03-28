(function () {
    'use strict';

    define([
            'plugins/http',
            'services/core/config',
            'services/core/logger',
            'services/core/state'
        ],
        function (http, config, logger, state) {

            var service = {
                get: get,
                put: put,
                post: post,
                remove: remove
            };

            return service;

            function get(partialUrl, callbacks, query) {
                var url = config.root + 'api/' + partialUrl;

                return http.get(url, query, getHeaders()).done(function(data) {
                    callbacks.success(data);
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    callbacks.error(jqXHR, textStatus, errorThrown);
                });
            }

            function post(partialUrl, callbacks, data) {
                var url = config.root + 'api/' + partialUrl;

                return http.post(url, data, getHeaders()).done(function(response) {
                    callbacks.success(response);
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    callbacks.error(jqXHR, textStatus, errorThrown);
                });
            }

            function put(partialUrl, callbacks, data) {
                var url = config.root + 'api/' + partialUrl;

                return http.put(url, data, getHeaders()).done(function() {
                    callbacks.success();
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    callbacks.error(jqXHR, textStatus, errorThrown);
                });
            }

            function remove(partialUrl, callbacks) {
                var url = config.root + 'api/' + partialUrl;

                return http.remove(url, null, getHeaders()).done(function() {
                    callbacks.success();
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    callbacks.error(jqXHR, textStatus, errorThrown);
                });
            }

            function getHeaders() {
                return {
                    'Authorization': 'Bearer ' + state.token
                };
            }
        });
})();
