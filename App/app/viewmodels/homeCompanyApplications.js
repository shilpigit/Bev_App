(function () {
    'use strict';

    define([
            'durandal/app',
            'services/core/localization',
            'services/data/datacontext',
            'viewmodels/behaviors/editor',
            'services/core/security',
            'services/core/state',
            'Clipboard',
            'services/core/logger',
            'services/core/instrumentation',
            'services/core/config',
            'services/vacancy',
            'model/model',
            'services/utilities'
        ],
        function (app, localization, datacontext, editor, security, state, Clipboard, logger, instrumentationSrv, config, vacancySrv, model, utilities) {

            var Model = function () {
                this.title = 'Vacancies';
                this.config = config;
                this.activate = activate;
                this.state = state;
                this.loc = datacontext.translations.item;
                this.countries = localization.getLocalizedCodeSet('country');
                this.currencies = localization.getLocalizedCodeSet('currency');
                this.educations = localization.getLocalizedCodeSet('education');
                this.templates = datacontext.templates.items;
                this.vacancies = ko.observableArray();
                this.companies = ko.observableArray();
                this.selectedCompany = ko.observable();
                this.canCreate = ko.observable(false);
                this.isShowingApplications = ko.observable(false);
                this.selectedVacancy = ko.observable();
                this.allApplicantsAreSelected = ko.observable(false);
                this.atLeastOneApplicantsIsDeselected = ko.observable(false);
                this.messagePanelIsShowing = ko.observable(false);
                this.mailBody = ko.observable();
                this.mailSubject = ko.observable();
                this.messageTemplateTypeCode = ko.observable();
                this.isBusy = ko.observable(false);
                this.applicantStatus = ko.observable('');
                this.pagingTokens = ko.observableArray(['', '']);
                this.recordsCount = ko.observable(0);
                this.isPaging = ko.observable(false);
                this.hasResult = ko.observable(false);
                this.applications = ko.observableArray();
                this.selectedCompany.subscribe(selectedCompanyChanged, this);
                this.allApplicantsAreSelected.subscribe(selectAllApplicants, this);
                this.applicantStatus.subscribe(refreshSearch, this);
                this.enterSave = enterSave;
                this.reloadData = reloadData;
                this.postDelete = postDelete;
                this.applicantSelect = applicantSelect;
                this.showSendMail = showSendMail;
                this.backToList = backToList;
                this.cancelSend = cancelSend;
                this.startSearchNext = startSearchNext;
                this.startSearchBack = startSearchBack;
                this.getApplicationsCount = getApplicationsCount;

            };

            var vm = new Model();

            function getApplicationsCount(data) {

                if (data.applicationsCountIsLoaded()) {
                    return;
                }

                var sendResult = vacancySrv.getApplicationsCount(data.id());

                sendResult.done(function (c) {
                    ko.utils.arrayFilter(vm.vacancies(), function (el) {
                        if (el.id() === data.id()) {
                            el.applicationsCount(c);
                            el.applicationsCountIsLoaded(true);
                        }
                    });
                });
                sendResult.fail(function () {
                    data.applicationsCount('open to see');
                    data.applicationsCountIsLoaded(false);
                });
            }

            function findTemplate(typeCode) {
                var foundTemplates = ko.utils.arrayFilter(vm.templates(), function (template) {
                    return template.typeCode() === typeCode;

                });

                if (!foundTemplates || foundTemplates.length === 0) {
                    logger.logError('Loading templates failed');
                    return null;
                }

                return foundTemplates[0];
            }

            vm.pagesCount = ko.pureComputed({
                read: function () {
                    return Math.ceil(vm.recordsCount() / 10);
                }
            });

            vm.currentPageIndex = ko.pureComputed({
                read: function () {
                    return vm.pagingTokens().length - 2;
                }
            });

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.canSendMail = ko.pureComputed({
                read: function () {

                    if (vm.allApplicantsAreSelected()) {
                        return true;
                    }

                    var foundAny = false;
                    ko.utils.arrayFilter(vm.applications(), function (el) {
                        if (el.isSelected()) {
                            foundAny = true;
                        }
                    });

                    return foundAny;
                }
            });

            vm.loadApplicationsCmd = ko.command({
                execute: function (data) {

                    instrumentationSrv.trackEvent('CompanyApplications', {'Command': 'LoadApplication'});

                    vm.selectedVacancy(data);

                    vm.pagingTokens(['', '']);

                    loadSearchPage(vm.selectedVacancy());

                },
                canExecute: function (isExecuting) {
                    return !isExecuting;
                }
            });

            vm.sendCommand = ko.command({
                execute: function () {

                    vm.isBusy(true);
                    instrumentationSrv.trackEvent('CompanyApplications', {'Command': 'SendMailToApplicants'});

                    var vacancyApplicantMailParameters = new model.VacancyApplicantMailParameters();

                    var foundTemplate = findTemplate(vm.messageTemplateTypeCode());

                    if (foundTemplate === null) {
                        vm.messagePanelIsShowing(false);
                        return;
                    }

                    vacancyApplicantMailParameters.templateId(foundTemplate.typeCode());
                    vacancyApplicantMailParameters.body(vm.mailBody());
                    vacancyApplicantMailParameters.subject(vm.mailSubject());
                    vacancyApplicantMailParameters.companyId(vm.selectedCompany().id());
                    vacancyApplicantMailParameters.vacancyId(vm.selectedVacancy().id());

                    ko.utils.arrayFilter(vm.applications(), function (el) {
                        if (el.isSelected()) {
                            vacancyApplicantMailParameters.tos.push(el.applicantProfileContainer.owner.emailAddress());
                        }
                    });

                    var sendResult = vacancySrv.sendMailToApplicants(vacancyApplicantMailParameters);

                    sendResult.done(function () {
                        logger.logInfo(vm.loc.stringMailSentSuccessfully());
                        refreshSearch();
                        vm.isBusy(false);
                        hideSendMail();
                    });
                    sendResult.fail(function () {
                        logger.logError(vm.loc.stringMailNotSent());
                        vm.isBusy(false);
                    });
                },
                canExecute: function (isExecuting) {
                    return !isExecuting;
                }
            });

            vm.getLinkMailToCandidate = function (item) {

                return 'mailto:' + item.applicantProfileContainer.owner.emailAddress();
            };

            vm.getCandidateCvUrl = function (item) {

                if (item.applicantProfileContainer.candidateProfile.cvFileId()) {
                    return config.root + 'api/storage/redirect?id=' + item.applicantProfileContainer.candidateProfile.cvFileId();
                }

                return '';
            };

            vm.getCandidateProfileUrl = function (item) {
                if (item.applicantProfileContainer.candidateProfile.id() === config.guidEmpty) {
                    return '#';
                }
                return '#/viewcandidateprofile/' + item.applicantProfileContainer.candidateProfile.id();
            };

            vm.getCandidateProfileUrlText = function (item) {
                if (item.applicantProfileContainer.candidateProfile.id() === config.guidEmpty) {
                    return vm.loc.linkProfileIsNotCompleted();
                }
                return vm.loc.linkVisitCandidateProfile();
            };

            vm.getLinkMailToApplicant = function (item) {

                return 'mailto:' + item.applicantUser.emailAddress();
            };

            vm.getEducationLevel = function (item) {

                var matches = ko.utils.arrayFilter(vm.educations.codes, function (el) {
                    return el.codeValue() === item.applicantProfileContainer.candidateProfile.educationCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                }
                else {
                    return vm.loc.stringUnknown();
                }
            };

            vm.getSalarySought = function (item) {

                var matches = ko.utils.arrayFilter(vm.currencies.codes, function (el) {
                    return el.codeValue() === item.applicantProfileContainer.candidateProfile.salarySought.currencyCodeValue();
                });

                if (matches.length > 0) {
                    return item.applicantProfileContainer.candidateProfile.salarySought.amount() ? matches[0].name() + ' ' + item.applicantProfileContainer.candidateProfile.salarySought.amount() : vm.loc.stringUnknown();
                } else {
                    return vm.loc.stringUnknown();
                }
            };

            vm.getCurrentLocationName = function (item) {

                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.applicantProfileContainer.candidateProfile.countryCode();
                });

                if (matches.length > 0) {
                    return item.applicantProfileContainer.candidateProfile.cityName() ? matches[0].name() + '/' + item.applicantProfileContainer.candidateProfile.cityName() : matches[0].name();
                } else {
                    return vm.loc.stringUnknown();
                }
            };

            vm.getCandidateImageUrl = function (item) {

                return utilities.resolveFileUrl(item.applicantProfileContainer.owner.person.photoImageId());
            };

            editor.extend(vm, datacontext.vacancies);

            return vm;

            function loadSearchPage(data, direction) {

                var searchToken = ko.observable('');
                if (!direction) {
                    searchToken('');
                }
                else if (direction === 'next') {
                    if (vm.pagingTokens()[vm.pagingTokens().length - 1] !== '') {
                        searchToken(vm.pagingTokens()[vm.pagingTokens().length - 1]);
                    }
                    vm.isPaging(true);
                }
                else if (direction === 'back') {

                    if (vm.pagingTokens().length - 2 >= 2) {

                        searchToken(vm.pagingTokens()[vm.pagingTokens().length - 3]);
                        vm.pagingTokens.splice(vm.pagingTokens().length - 2, 2);
                    }
                    vm.isPaging(true);
                }

                data.isShowingApplications(true);
                vm.isBusy(true);
                vm.isPaging(true);

                datacontext.vacancyApplicantPagedSearch.getItem({
                    vacancyId: data.id(),
                    sentMessageTemplateId: vm.applicantStatus(),
                    token: searchToken()
                }).then(function () {

                    ko.utils.arrayFilter(vm.vacancies(), function (el) {
                        el.vacancyIsLoaded(false);
                    });

                    vm.isShowingApplications(true);
                    data.vacancyIsLoaded(true);
                    data.isShowingApplications(false);

                    if (datacontext.vacancyApplicantPagedSearch.item) {

                        vm.applications(datacontext.vacancyApplicantPagedSearch.item.applications());

                        vm.pagingTokens.push(datacontext.vacancyApplicantPagedSearch.item.continuationToken());

                        if (!direction) {
                            vm.recordsCount(datacontext.vacancyApplicantPagedSearch.item.recordsCount());
                        }

                        if (vm.recordsCount() > 0) {
                            vm.hasResult(true);
                        }

                    }
                    else {
                        vm.messageDetail.type('info');
                        vm.applications([]);
                        vm.hasResult(false);
                        vm.messageDetail.message(vm.loc.stringCandidateProfileSearchHasNoResult());
                    }

                    vm.isBusy(false);
                    vm.isPaging(false);
                });
            }

            function refreshSearch() {
                vm.recordsCount(0);
                vm.pagingTokens([]);

                loadSearchPage(vm.selectedVacancy());
            }

            function startSearchNext() {
                loadSearchPage(vm.selectedVacancy(), 'next');
            }

            function startSearchBack() {
                loadSearchPage(vm.selectedVacancy(), 'back');
            }

            function selectedCompanyChanged() {
                listVacancies(vm.selectedCompany().id());
            }

            function selectAllApplicants(newState) {

                if (vm.atLeastOneApplicantsIsDeselected()) {

                    logger.log('At least one application must be selected: ' + vm.atLeastOneApplicantsIsDeselected());
                    return;
                }

                ko.utils.arrayFilter(vm.applications(), function (el) {
                    el.isSelected(newState);
                });
            }

            function listVacancies(companyId) {

                instrumentationSrv.trackEvent('CompanyApplications', {'Command': 'ListVacancies'});

                vm.vacancies.removeAll();
                ko.utils.arrayFilter(datacontext.vacancies.items(), function (el) {
                    if (el.companyId() === companyId) {
                        vm.vacancies.push(el);
                    }
                });

            }

            function enterSave() {

                vm.selectedItem().companyId(vm.selectedCompany().id());
                return vm.selectedCompany().id();
            }

            function reloadData() {
                listVacancies(vm.selectedCompany().id());
                return true;
            }

            function postDelete() {

                vm.vacancies.remove(function (item) {
                    return item.id() === vm.selectedItem().id();
                });
                return true;
            }

            function showSendMail(typeCode) {
                vm.messagePanelIsShowing(true);
                vm.messageTemplateTypeCode(typeCode);

                var foundTemplate = findTemplate(typeCode);

                if (foundTemplate === null) {
                    vm.messagePanelIsShowing(false);
                    return;
                }

                vm.mailBody(foundTemplate.text());
                vm.mailSubject(vm.selectedVacancy().jobTitle());

                utilities.scrollToElement($('#mailSenderSection'));

            }

            function hideSendMail() {

                vm.messagePanelIsShowing(false);
                vm.messageTemplateTypeCode('');
                vm.mailBody('');
                vm.mailSubject('');

                utilities.scrollToElement($('#applicantsList'));
            }

            function cancelSend() {
                hideSendMail();
            }

            function backToList() {
                vm.isShowingApplications(false);
            }

            function applicantSelect() {

                var allSelected = true;
                ko.utils.arrayFilter(vm.applications(), function (el) {
                    if (!el.isSelected()) {
                        allSelected = false;
                        vm.atLeastOneApplicantsIsDeselected(true);
                    }
                });

                vm.allApplicantsAreSelected(allSelected);
                vm.atLeastOneApplicantsIsDeselected(false);

                return false;
            }

            function activate() {

                ko.bindingHandlers.wysiwyg.defaults = {
                    'toolbar': 'undo redo | bold italic | bullist numlist ',
                    'menubar': false,
                    'statusbar': false,
                    'setup': function (ed) {
                        ed.on('keydown', function (event) {
                            if (event.keyCode === 9) { // tab pressed
                                if (event.shiftKey) {
                                    ed.execCommand('Outdent');
                                }
                                else {
                                    ed.execCommand('Indent');
                                }

                                event.preventDefault();
                                return false;
                            }
                        });
                    }
                };

                var clipboard = new Clipboard('.copy-applicant-email-address');

                clipboard.on('success', function () {
                    logger.logInfo(vm.loc.stringApplicationEmailAddressCopiedToClipboard());
                });

                vm.selectedItem(undefined);
                vm.companies.removeAll();

                ko.utils.arrayFirst(security.listCompanyAccess(), function (company) {
                        if (security.checkPartyAccess(company.organizationId(), 'vacancy', 'view')) {
                            vm.companies.push(company);
                        }
                    }
                );

                if (vm.companies().length > 0) {
                    vm.selectedCompany(vm.companies()[0]);
                    vm.reloadData();
                    vm.canEdit(false);
                    vm.canDelete(false);
                    vm.companies.sort(function (left, right) {
                        return left.companyName() < right.companyName() ? -1 : 1;
                    });
                }
                else {
                    vm.messageDetail.message(vm.loc.testNoCompanyAccess());
                    vm.messageDetail.type('info');
                }

                vm.messagePanelIsShowing(false);
                vm.isShowingApplications(false);

                return true;
            }
        });
}());
