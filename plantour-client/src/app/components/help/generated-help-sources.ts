import getStartedSectionManifest from './sections/get-started/section.json';
import featuresSectionManifest from './sections/features/section.json';
import workflowsSectionManifest from './sections/workflows/section.json';
import getStartedHowCanPlanturHelpMeSolveMyProblemsJsonQuestion from './sections/get-started/How can Plantur help me solve my problems.json';
import getStartedCanITryPlantourWithoutTheAccountCreationJsonQuestion from './sections/get-started/Can I try Plantour without the account creation.json';
import getStartedWhatAreMyFirstStepsWithPlantourJsonQuestion from './sections/get-started/What are my first steps with Plantour.json';
import getStartedHowCanISwitchMyAccountFromTemporaryToRegularJsonQuestion from './sections/get-started/How can I switch my account from temporary to regular.json';
import featuresWhatAreTheMainEntitiesThatPlantourOperatesWithJsonQuestion from './sections/features/What are the main entities that Plantour operates with.json';
import featuresHowDoIFilterSortAndTargetEntitiesJsonQuestion from './sections/features/How do I filter, sort and target entities.json';
import featuresWhyAdminsTravelersAndParticipantsJsonQuestion from './sections/features/Why Admins, Travelers and Participants.json';
import featuresWhatIsToolbarJsonQuestion from './sections/features/What is toolbar.json';
import featuresHowDoIAddUpdateOrDeleteEntitiesJsonQuestion from './sections/features/How do I add update or delete entities.json';
import featuresWhatAreDictionariesJsonQuestion from './sections/features/What are dictionaries.json';
import featuresWhatAreItemTemplatesJsonQuestion from './sections/features/What are item templates.json';
import featuresHowToAskAIForItemRecommendationsJsonQuestion from './sections/features/How to ask AI for item recommendations.json';
import workflowsWhatIsMainPlantourWorkflowJsonQuestion from './sections/workflows/What is main Plantour workflow.json';
import workflowsHowDoIInviteTravelersJsonQuestion from './sections/workflows/How do I invite travelers.json';
import workflowsHowDoIWorkWithMyItemsDictionaryJsonQuestion from './sections/workflows/How do I work with my items dictionary.json';

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
  ['features/What are the main entities that Plantour operates with.json', featuresWhatAreTheMainEntitiesThatPlantourOperatesWithJsonQuestion],
  ['features/How do I filter, sort and target entities.json', featuresHowDoIFilterSortAndTargetEntitiesJsonQuestion],
  ['features/Why Admins, Travelers and Participants.json', featuresWhyAdminsTravelersAndParticipantsJsonQuestion],
  ['features/What is toolbar.json', featuresWhatIsToolbarJsonQuestion],
  ['features/How do I add update or delete entities.json', featuresHowDoIAddUpdateOrDeleteEntitiesJsonQuestion],
  ['features/What are dictionaries.json', featuresWhatAreDictionariesJsonQuestion],
  ['features/What are item templates.json', featuresWhatAreItemTemplatesJsonQuestion],
  ['features/How to ask AI for item recommendations.json', featuresHowToAskAIForItemRecommendationsJsonQuestion],
  ['workflows/What is main Plantour workflow.json', workflowsWhatIsMainPlantourWorkflowJsonQuestion],
  ['workflows/How do I invite travelers.json', workflowsHowDoIInviteTravelersJsonQuestion],
  ['workflows/How do I work with my items dictionary.json', workflowsHowDoIWorkWithMyItemsDictionaryJsonQuestion]
];
