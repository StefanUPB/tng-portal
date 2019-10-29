import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSort, MatTableDataSource } from '@angular/material';

import { ValidationAndVerificationPlatformService } from '../validation-and-verification.service';
import { UtilsService } from '../../shared/services/common/utils.service';

@Component({
	selector: 'app-test-plan-list',
	templateUrl: './test-plan-list.component.html',
	styleUrls: [ './test-plan-list.component.scss' ],
	encapsulation: ViewEncapsulation.None
})
export class TestPlanListComponent implements OnInit, OnDestroy {
	loading: boolean;
	displayedColumns = [ 'testName', 'serviceName', 'updatedAt', 'status', 'execute', 'stop' ];
	subscription: Subscription;
	@ViewChild(MatSort) sort: MatSort;
	dataSource = new MatTableDataSource();

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private utilsService: UtilsService,
		private verificationAndValidationPlatformService: ValidationAndVerificationPlatformService
	) { }

	ngOnInit() {
		this.requestTestPlans();

		// Reloads the list when children are closed
		this.subscription = this.router.events.subscribe(event => {
			if (
				event instanceof NavigationEnd &&
				event.url === '/validation-and-verification/test-plans' &&
				this.route.url[ 'value' ].length === 2 &&
				this.route.url[ 'value' ][ 1 ].path === 'test-plans'
			) {
				this.requestTestPlans();
			}
		});
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	searchFieldData(search) {
		this.requestTestPlans(search);
	}

	/**
     * Generates the HTTP request to get the list of test plans.
     *
     * @param search [Optional] Test plan attributes that
     *                          must be matched by the returned
     *                          list of tests.
     */
	async requestTestPlans(search?) {
		this.loading = true;
		const testPlans = await this.verificationAndValidationPlatformService.getTestPlans(search);

		this.loading = false;
		if (testPlans) {
			this.dataSource.data = testPlans;
			this.dataSource.sort = this.sort;
		} else {
			this.utilsService.openSnackBar('Unable to fetch any test plan', '');
		}
	}

	async confirmExecution(plan) {
		this.loading = true;
		const uuid = plan.uuid;
		const status = plan.status === 'WAITING_FOR_CONFIRMATION' ? 'SCHEDULED' : 'RETRIED';

		const response = await this.verificationAndValidationPlatformService.putNewTestPlanStatus(uuid, status);

		this.loading = false;
		if (response) {
			this.utilsService.openSnackBar('The test plan was executed', '');
			this.requestTestPlans();
		} else {
			this.utilsService.openSnackBar('Unable to execute the test plan', '');
		}
	}

	async cancelExecution(plan) {
		this.loading = true;
		const response = await this.verificationAndValidationPlatformService.deleteTestPlan(plan.uuid);

		this.loading = false;
		if (response) {
			this.utilsService.openSnackBar('The test plan was cancelled', '');
			this.requestTestPlans();
		} else {
			this.utilsService.openSnackBar('Unable to cancel the test plan', '');
		}

	}

	canShowMessage() {
		return (!this.dataSource.data || !this.dataSource.data.length) && !this.loading;
	}

	canShowCancelExecution(testPlan) {
		return testPlan.status === 'PENDING' || testPlan.status === 'NOT_CONFIRMED'
			|| testPlan.status === 'STARTING' || testPlan.status === 'SCHEDULED';
	}

	canShowExecute(testPlan) {
		return testPlan.required &&
			(testPlan.status === 'CANCELLED' || testPlan.status === 'ERROR');
	}

	canShowRequiredConfirmation(testPlan) {
		return testPlan.required && testPlan.status === 'WAITING_FOR_CONFIRMATION';
	}

	openTest(uuid) {
		this.router.navigate([ uuid ], { relativeTo: this.route });
	}
}
