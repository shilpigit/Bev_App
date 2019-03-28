(function () {
    'use strict';

    define([
            'durandal/app',
            'services/core/localization',
            'services/core/security',
            'services/data/datacontext',
            'viewmodels/behaviors/editor',
            'services/core/state',
            'services/company'
        ],
        function (app, localization, security, datacontext, editor, state, companySrv) {

            var Model = function () {
                this.title = 'Access Lists';
                this.loc = datacontext.translations.item;
                this.activate = activate;
                this.state = state;
                this.showError = ko.observable(false);
                this.accessLists = datacontext.principalAccessLists.items;
                this.loc = datacontext.translations.item;
                this.companies = datacontext.companies.items;
                this.userGroups = datacontext.userGroups.items;
                this.selectedCompany = ko.observable();
                this.selectedUserGroup = ko.observable();
                this.objects = ko.observableArray();
                this.enterEdit = enterEdit;
                this.enterDelete = enterDelete;
                this.postDelete = postDelete;
                this.enterSave = enterSave;
                this.getCompanyName = getCompanyName;
                this.getUserGroupName = security.getUserGroupName;
                this.loadData = reloadData();
            };

            var vm = new Model();

            editor.extend(vm, datacontext.principalAccessLists);

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            return vm;

            function activate() {

                vm.selectedItem(undefined);
                vm.canEdit(true);
                vm.canDelete(true);
                if (datacontext.userGroups.items().length === 0) {
                    state.systemIsBusy(true);
                    return datacontext.userGroups.getData().then(function () {
                        state.systemIsBusy(false);
                    });
                }

                return true;
            }

            function reloadData() {
                state.systemIsBusy(true);
                datacontext.principalAccessLists.getData().then(function () {
                    state.systemIsBusy(false);
                });
            }

            function enterDelete() {
                vm.selectedItem().id(vm.selectedItem().accessList.id());
            }

            function enterEdit() {

                vm.selectedItem().id(vm.selectedItem().accessList.id());

                if (vm.selectedItem().accessList.partyId()) {
                    // Set company
                    vm.selectedCompany(companySrv.getItemByOrganizationId(vm.selectedItem().accessList.partyId()));
                }

                if (vm.selectedItem().principalId()) {
                    vm.selectedUserGroup(datacontext.userGroups.getItemById(vm.selectedItem().principalId()));
                }

                vm.objects(security.getSecurityObjectsForEdit(vm.selectedItem().accessList));
            }

            function postDelete() {
                vm.selectedItem().id(vm.selectedItem().accessList.id());
            }

            function enterSave() {
                vm.selectedItem().accessList.partyId(null);
                vm.selectedItem().principalId(vm.selectedUserGroup().id());

                if (vm.selectedCompany()) {
                    vm.selectedItem().accessList.partyId(vm.selectedCompany().organizationId());
                }

                security.updateAccessList(vm.selectedItem().accessList, vm.objects());
            }

            function getCompanyName(partyId) {
                if (partyId()) {
                    try {
                        var company = companySrv.getItemByOrganizationId(partyId());
                        return company.companyName();
                    }
                    catch (err) {
                        return vm.loc.textCompanyIsRemovedExclumation() + err;
                    }

                }
                else {
                    return vm.loc.textCompanyIsRemovedExclumation();
                }
            }

        });
}());
