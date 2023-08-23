import { RecordTestStepActionWebdriverClick } from '../record-test-step-action-webdriver-click.entity';
import { RecordTestStepActionWebdriverInput } from '../record-test-step-action-webdriver-input.entity';
import { Team } from '../team.entity';
import { User } from '../user.entity';

export type Member = User | Team;

export type RecordTestStepAction = RecordTestStepActionWebdriverClick | RecordTestStepActionWebdriverInput;
