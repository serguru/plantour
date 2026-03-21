import getStartedSectionManifest from './sections/get-started/section.json';
import featuresSectionManifest from './sections/features/section.json';
import workflowsSectionManifest from './sections/workflows/section.json';
import getStartedHowCanPlanturHelpMeSolveMyProblemsJsonQuestion from './sections/get-started/How can Plantur help me solve my problems.json';
import getStartedCanITryPlantourWithoutTheAccountCreationJsonQuestion from './sections/get-started/Can I try Plantour without the account creation.json';
import getStartedWhatAreMyFirstStepsWithPlantourJsonQuestion from './sections/get-started/What are my first steps with Plantour.json';
import getStartedHowCanISwitchMyAccountFromTemporaryToRegularJsonQuestion from './sections/get-started/How can I switch my account from temporary to regular.json';
import featuresWhatAreTheMainEntitiesThatPlniurOperatesWithJsonQuestion from './sections/features/What are the main entities that Plniur operates with.json';
import featuresWhatIsToolbarJsonQuestion from './sections/features/What is toolbar.json';
import featuresHowDoIAddUpdateOrDeleteEntitiesJsonQuestion from './sections/features/How do I add update or delete entities.json';
import featuresWhatIsDictionaryJsonQuestion from './sections/features/What is dictionary.json';
import workflowsHowDoIAddItemsToATripJsonQuestion from './sections/workflows/How do I add items to a trip.json';

export const GENERATED_SECTION_MANIFEST_ENTRIES: [string, unknown][] = [
  ['get-started', getStartedSectionManifest],
  ['features', featuresSectionManifest],
  ['workflows', workflowsSectionManifest]
];

export const GENERATED_QUESTION_SOURCE_ENTRIES: [string, unknown][] = [
  ['get-started/How can Plantur help me solve my problems.json', getStartedHowCanPlanturHelpMeSolveMyProblemsJsonQuestion],
  ['get-started/Can I try Plantour without the account creation.json', getStartedCanITryPlantourWithoutTheAccountCreationJsonQuestion],
  ['get-started/What are my first steps with Plantour.json', getStartedWhatAreMyFirstStepsWithPlantourJsonQuestion],
  ['get-started/How can I switch my account from temporary to regular.json', getStartedHowCanISwitchMyAccountFromTemporaryToRegularJsonQuestion],
  ['features/What are the main entities that Plniur operates with.json', featuresWhatAreTheMainEntitiesThatPlniurOperatesWithJsonQuestion],
  ['features/What is toolbar.json', featuresWhatIsToolbarJsonQuestion],
  ['features/How do I add update or delete entities.json', featuresHowDoIAddUpdateOrDeleteEntitiesJsonQuestion],
  ['features/What is dictionary.json', featuresWhatIsDictionaryJsonQuestion],
  ['workflows/How do I add items to a trip.json', workflowsHowDoIAddItemsToATripJsonQuestion]
];
