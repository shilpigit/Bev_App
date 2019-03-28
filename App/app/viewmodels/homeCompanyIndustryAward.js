(function () {
    'use strict';

    define([
        'durandal/app',
        'plugins/router',
        'services/core/logger',
        'services/core/config',
        'services/core/security',
        'services/core/state',
        'services/data/dataservice',
        'services/data/datacontext'
    ],
        function (app, router, logger, config, security, state, dataservice, datacontext) {
            var vm = {
                activate: activate,
                canActivate: canActivate,
                title: 'Industry Award',
                config: config,
                loc: datacontext.translations.item,
                state: state,
                showForm: ko.observable(true),
                contentToShow: ko.observable(),
                currentUser: datacontext.user.item.user,
                selectedView: ko.observable(''),
                setSelectedView: setSelectedView,
                activeView: ko.computed(first)
            };


            function canActivate() {

                return true;
            }

            vm.activeView = ko.computed(function () {
                     if (vm.selectedView() === 'quaterly') {
                        vm.showForm(false);
                        return 'viewmodels/adminQuaterlyAwardsNominationForm';
                    }
                    return '';
                });

            function first() {
                return '';
            }

            function setSelectedView(view) {
                vm.selectedView('quaterly');
            }

            return vm;

            function activate() {
                vm.showForm(true);
                vm.selectedView('');
                ko.utils.arrayFilter(datacontext.contents.items(), function (el) {

                    if (el.keyCodeValue() === 'cCompanyPanelIndustryAwardsContentKey') {
                        vm.contentToShow(el.text());
                    }
                });
                return true;
            }
            
        });
}());
