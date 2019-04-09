(function () {
    'use strict';

    define([
            'services/core/config',
            'services/core/localization',
            'services/data/datacontext',
            'viewmodels/behaviors/editor',
            'services/core/state',
            'services/core/security',
            'Clipboard',
            'services/core/logger',
            'model/model',
            'services/core/instrumentation',
            'services/contentManager',
            'services/utilities',
            'services/core/code'
        ],
        function (config, localization, datacontext, editor, state, security, Clipboard, logger, model, instrumentationSrv, contentSrv, utilities) {

            var Model = function () {
                this.loc = datacontext.translations.item;
                this.contents = datacontext.contents.items;
                this.utilities = utilities;
                this.config = config;
                this.state = state;
                this.activate = activate;
                this.title = 'Companies';
                this.companies = ko.observableArray();
                this.enterSave = enterSave;
                this.enterEdit = enterEdit;
                this.cancelEdit = cancelEdit;
                this.reloadData = reloadData;
            };

            var vm = new Model();

            vm.introductionText = ko.pureComputed(function () {
                return contentSrv.getByKeyCodeValue('cCompanyPanelGraduateShareSchemeIntroductionContentKey').text();
            }, this);

            editor.extend(vm, datacontext.companies);

            return vm;

            function activate() {
                debugger
                vm.selectedItem(undefined);
                vm.canDelete(false);
                vm.companies(security.listCompanyAccess());
            }

            function enterSave() {
                return true;
            }

            function enterEdit() {
            }

            function cancelEdit() {
                vm.isEditing(false);
            }

            function reloadData() {
                state.systemIsBusy(true);
                datacontext.companies.getData(state.userId).then(function () {

                    var searchVm = require('viewmodels/adminCompanyGraduateSchemeSearch');

                    searchVm.filterCompanies();
                    state.systemIsBusy(false);
                });
            }

        });
}());
