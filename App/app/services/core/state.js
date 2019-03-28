(function () {
    'use strict';

    define([
            'knockout',
            'durandal/system',
            'services/core/logger',
            'services/core/instrumentation',
            'modernizr'
        ],
        function (ko, system, logger, instrumentationSvc) {

            var service = {
                isAdministrator: ko.observable(false),
                isCompanyAdmin: ko.observable(false),
                hasPendingRequest: ko.observable(false),
                isAuthenticated: ko.observable(false),
                isLoading: ko.observable(false),
                languageCode: ko.observable('en'),
                systemIsBusy: ko.observable(false),
                setAuthData: setAuthData,
                setIsAuthenticated: setIsAuthenticated
            };

            init();

            return service;

            function init() {
                if (Modernizr.localstorage){
                    try
                    {
                        service.userId = localStorage.getItem('odg.userId');
                        service.token = localStorage.getItem('odg.token');
                    }
                    catch(err){
                        logger.log('Local Storage IO Error. ' + err);
                    }
                }
            }

            function setAuthData(data) {
                data = data || { userId: null, token: null, password: null };

                service.userId = data.userId;
                service.password = data.password;
                service.token = data.token;

                if (!data.token) {
                    setIsAuthenticated(false);
                }
                else {
                    instrumentationSvc.setAuthenticatedUser(data.userId);
                }

                if (Modernizr.localstorage){
                    try
                    {
                        localStorage.setItem('odg.userId', data.userId);
                        localStorage.setItem('odg.token', data.token);
                    }
                    catch (err){
                        logger.log('Local Storage IO Error. ' + err);
                    }
                }
            }

            function setIsAuthenticated(isAuthenticated) {
                service.isAuthenticated(isAuthenticated);
            }
        });
})();
