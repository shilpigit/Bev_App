(function() {
    'use strict';

    define(['durandal/app', 'services/core/logger', 'plugins/router', 'services/core/config'],
        function(app, logger, router, config) {

            var service = {
                appInsights: window.appInsights,
                setAuthenticatedUser: setAuthenticatedUser,
                trackEvent: trackEvent,
                trackPageView: trackPageView
            };

            init();

            return service;

            function init() {
                // Initialize
                service.appInsights.config.instrumentationKey = config.instrumentationKey;

                router.on('router:navigation:complete', function(instance) {
                    if (instance.title) {
                        var data = {};

                        if (instance.company) {
                            data.countryCode = instance.company().countryCode();
                            data.companyName = instance.company().name();
                        }

                        // We have a title, log page view.
                        service.trackPageView(instance.title,  { urlReferrer: document.referrer });
                    }
                });
            }

            function setAuthenticatedUser(userId) {
                service.appInsights.setAuthenticatedUserContext(userId);
            }

            function trackEvent(name, data) {
                service.appInsights.trackEvent(name, data);
            }

            function trackPageView(name, data) {
                var obj = '';

                if (data) {
                    obj = JSON.stringify(data);
                }

                service.appInsights.trackPageView(name, null, data);
            }
        });
})();
