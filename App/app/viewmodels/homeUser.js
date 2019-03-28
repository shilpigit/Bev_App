(function () {
    'use strict';

    define([
            'durandal/app',
            'plugins/router',
            'services/core/logger',
            'services/core/config',
            'services/data/dataservice',
            'services/data/datacontext',
            'services/core/instrumentation',
            'services/core/localization',
            'services/core/security'
        ],
        function (app, router, logger, config, dataservice, datacontext, instrumentationSrv) {
            var vm = {
                title: 'Candidates Panel',
                activate: activate,
                config: config,
                loc: datacontext.translations.item,
                selectedView: ko.observable('dashboard'),
                currentUser: datacontext.user.item.user,
                setSelectedView: setSelectedView
            };

            vm.activeView = ko.computed(function () {
                if (vm.selectedView() === 'dashboard') {
                    instrumentationSrv.trackEvent('UserDashboard', {'View': 'Dashboard'});
                    return 'viewmodels/homeUserDashboard';
                } else if (vm.selectedView() === 'candidateProfile') {
                    instrumentationSrv.trackEvent('UserDashboard', {'View': 'CandidateProfile'});
                    return 'viewmodels/homeUserCandidateProfile';
                } else if (vm.selectedView() === 'vacancySearch') {
                    instrumentationSrv.trackEvent('UserDashboard', {'View': 'VacancySearch'});
                    return 'viewmodels/homeUserVacancySearch';
                }
                return;
            });

            function setSelectedView(view) {
                vm.selectedView(view);
            }

            return vm;


            function activate(id) {
                if (id) {
                    return true;
                }
            }

        });
}());
