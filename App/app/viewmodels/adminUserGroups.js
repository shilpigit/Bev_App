(function () {
    'use strict';

    define([
            'durandal/app',
            'services/core/localization',
            'services/data/datacontext',
            'viewmodels/behaviors/editor',
            'services/userGroup',
            'services/core/logger',
            'services/company'
        ],
        function (app, localization, datacontext, editor, groupSrv, logger, companySrv) {

            var Model = function () {
                this.title = 'User Groups';
                this.loc = datacontext.translations.item;
                this.activate = activate;
                this.compositionComplete = compositionComplete;
                this.enterEmailAddress = ko.observable();
                this.userGroups = datacontext.userGroups.items;
                this.showError = ko.observable(false);
                this.selectedUserId = ko.observable();
                this.enterDelete = enterDelete;
                this.addSelectedUser = addSelectedUser;
                this.deleteUserFromGroup = deleteUserFromGroup;
                this.setSelectedUserId = setSelectedUserId;
                this.reloadData = reloadData;

            };

            var vm = new Model();

            editor.extend(vm, datacontext.userGroups);


            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            return vm;

            function reloadData(){
                companySrv.hardReload();
            }

            function activate() {
                vm.selectedItem(undefined);
                return true;
            }

            function setSelectedUserId(val) {

                vm.selectedUserId(val.id());
            }

            function deleteUserFromGroup(item) {

                groupSrv.deleteUserFromGroup(vm.selectedItem().id(), item.id()).then(function () {
                    ko.utils.arrayForEach(vm.selectedItem().users(), function (iterationItem) {
                        if (iterationItem.id() === item.id()) {
                            vm.selectedItem().users.remove(iterationItem);
                            return;
                        }
                    });
                });
            }

            function addSelectedUser() {

                vm.messageDetail.message(null);
                datacontext.userLookup.getItem(vm.enterEmailAddress()).then(function () {
                    var userIsAlreadyAMember = false;

                    ko.utils.arrayForEach(vm.selectedItem().users(), function (item) {
                        if (item.emailAddress() === vm.enterEmailAddress()) {
                            vm.messageDetail.message(vm.loc.textUserIsAlreadyAMemberMessage());
                            vm.messageDetail.type('warning');
                            userIsAlreadyAMember = true;
                            return;
                        }
                    });

                    if (!userIsAlreadyAMember) {
                        vm.selectedItem().users.push(datacontext.userLookup.item);
                        vm.enterEmailAddress(null);
                        return;
                    }
                }).fail(function () {
                    vm.messageDetail.message(vm.loc.stringUserNotFound());
                    vm.messageDetail.type('danger');
                    return;
                });
            }

            function enterDelete() {

                for (var i = 0; i < datacontext.companies.items().length; i++) {
                    var companyContainer = datacontext.companies.items()[i];

                    if (vm.selectedItem().id() === companyContainer.company.administratorsGroupId() ||
                        vm.selectedItem().id() === companyContainer.company.executivesGroupId() ||
                        vm.selectedItem().id() === companyContainer.company.employeesGroupId()) {
                        vm.isDeleting(false);
                        vm.messageDetail.message(vm.loc.textGroupCannotBeDeleted());
                        vm.messageDetail.type('info');
                        return;
                    }
                }

                vm.messageDetail.message('');
            }

            function compositionComplete(){


            }
        });
}());
