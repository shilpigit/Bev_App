(function () {
    'use strict';

    define([
            'services/data/datacontext',
            'services/core/logger',
            'services/core/security',
            'model/accessRequestInfo',
            'services/core/state'
        ],
        function (datacontext, logger, security, AccessRequestInfo,state) {

            var vm = {
                activate: activate,
                title: 'Access Requests',
                companyId: ko.observable(),
                selectedItemId: ko.observable(),
                accessRequests: ko.observableArray(),
                principalAccessList: ko.observableArray(),
                userGroups: ko.observableArray(),
                pendingAccessRequests: ko.observableArray(),
                approvedAccessRequests: ko.observableArray(),
                approvedExecutivesCount: ko.observable(0),
                approvedEEmployeesCount: ko.observable(0),
                loc: datacontext.translations.item,
                isRejecting: ko.observable(),
                isApproving: ko.observable(),
                approveRequest: approveRequest,
                canApproveRequest: canApproveRequest,
                //approveRequestIsEnabled: approveRequestIsEnabled,
                canRejectRequest: canRejectRequest,
                rejectRequest: rejectRequest,
                makeRequestPending: makeRequestPending,
                setSelectedItem: setSelectedItem,
                askForRejectRequest: askForRejectRequest,
                askForApproveRequest: askForApproveRequest,
                cancelOperation: cancelOperation,
                getGroupName: getGroupName
            };

            vm.approveRequestIsEnabled = ko.pureComputed(function () {
                // todo: have a look at company view
                return  state.isAdministrator() || vm.approvedAccessRequests().length < vm.approvedExecutivesCount();
            }, this);

            return vm;

            function activate(activationData) {

                vm.companyId(activationData.companyId());
                vm.accessRequests(activationData.companyContainer.accessRequests());
                vm.principalAccessList(activationData.companyContainer.principalAccessList());
                vm.userGroups(activationData.companyContainer.userGroups());
                vm.approvedExecutivesCount(activationData.companyContainer.company.sponsorshipPackage.executivesCount());
                getRequestsByStatus();
                return true;
            }

            function approveRequest(request) {

                request.statusCode('joined');
                var data = new AccessRequestInfo();
                data.accessRequest = request;
                data.relatedGroupId(getGroupId(request));
                data.confirmUser(true);

                datacontext.accessRequests.saveItem(data).then(function () {
                    vm.pendingAccessRequests.remove(function (item) {
                        return item.id() === request.id();
                    });
                    vm.approvedAccessRequests.push(request);
                    vm.selectedItemId(null);
                    vm.isApproving(false);
                }).fail(function () {
                    logger.error('Failed to Approve User');
                });
            }

            function canApproveRequest() {
                return security.checkPartyAccess(vm.companyId(), 'accessRequest', 'approve');
            }

            function canRejectRequest() {
                return security.checkPartyAccess(vm.companyId(), 'accessRequest', 'reject');
            }

            function rejectRequest(request) {
                request.statusCode('rejected');

                var data = new AccessRequestInfo();

                data.accessRequest = request;
                data.relatedGroupId(getGroupId(request));
                data.confirmUser(false);

                datacontext.accessRequests.saveItem(data).then(function () {
                    vm.approvedAccessRequests.remove(function (item) {
                        return item.id() === request.id();
                    });

                    vm.selectedItemId(null);
                    vm.isRejecting(false);
                }).fail(function () {
                    logger.error('Failed to Reject User');
                });
            }

            function makeRequestPending(request) {
                request.statusCode('joinPending');

                var data = new AccessRequestInfo();

                data.accessRequest = request;
                data.relatedGroupId(getGroupId(request));
                data.confirmUser(false);

                datacontext.accessRequests.saveItem(data).then(function () {
                    vm.approvedAccessRequests.remove(function (item) {
                        return item.id() === request.id();
                    });

                    vm.selectedItemId(null);
                    vm.isRejecting(false);
                }).fail(function () {
                    logger.error('Failed to Suspend User');
                });
            }

            function askForRejectRequest() {
                vm.isRejecting(true);
            }

            function askForApproveRequest() {
                vm.isApproving(true);
            }

            function cancelOperation() {
                vm.isRejecting(false);
                vm.isApproving(false);
            }

            function setSelectedItem(item) {
                vm.selectedItemId(item.id());
            }

            function getRequestsByStatus() {

                vm.pendingAccessRequests.removeAll();
                vm.approvedAccessRequests.removeAll();

                ko.utils.arrayFirst(vm.accessRequests(), function (request) {

                        if (request && request.statusCode()) {
                            if (request.statusCode() === 'joinPending') {
                                vm.pendingAccessRequests.push(request);
                            } else if (request.statusCode() === 'joined') {
                                vm.approvedAccessRequests.push(request);
                            }
                        }

                    }
                );

            }

            function getGroupName(item) {
                var foundPrincipalAccessList = ko.utils.arrayFirst(vm.principalAccessList(), function (principalAccessListItem) {
                    return principalAccessListItem && principalAccessListItem.accessList.id() === item.accessList.id();
                });
                var foundUserGroup = ko.utils.arrayFirst(vm.userGroups(), function (userGroupItem) {
                    return userGroupItem && userGroupItem.id() === foundPrincipalAccessList.principalId();
                });

                return foundUserGroup.name();
            }

            function getGroupId(item) {

                var foundPrincipalAccessList = ko.utils.arrayFirst(vm.principalAccessList(), function (principalAccessListItem) {
                    return principalAccessListItem && principalAccessListItem.accessList.id() === item.accessList.id();
                });
                var foundUserGroup = ko.utils.arrayFirst(vm.userGroups(), function (userGroupItem) {
                    return userGroupItem && userGroupItem.id() === foundPrincipalAccessList.principalId();
                });

                return foundUserGroup.id();
            }
        });
}());
