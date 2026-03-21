import getStartedSectionManifest from './sections/get-started/section.json';
import whyPlantourSectionManifest from './sections/why-plantour/section.json';
import plantourFeaturesSectionManifest from './sections/plantour-features/section.json';
import getStartedWhyDoINeedToUsePlantourJsonQuestion from './sections/get-started/Why do I need to use Plantour.json';
import getStartedCanITryPlantourWithoutTheAccountCreationJsonQuestion from './sections/get-started/Can I try Plantour without the account creation.json';
import getStartedWhatAreMyFirstStepsWithPlantourJsonQuestion from './sections/get-started/What are my first steps with Plantour.json';
import getStartedHowCanISwitchMyAccountFromTemporaryToRegularJsonQuestion from './sections/get-started/How can I switch my account from temporary to regular.json';
import whyPlantourWhatIsDictionaryJsonQuestion from './sections/why-plantour/What is dictionary.json';
import whyPlantourWhatAreTheMainEntitiesThatPlniurOperatesWithJsonQuestion from './sections/why-plantour/What are the main entities that Plniur operates with.json';
import whyPlantourWhatArePlantourSCoreWorkflowsJsonQuestion from './sections/why-plantour/What are Plantour\'s core workflows.json';
import plantourFeaturesHowDoIAddUpdateOrDeleteEntitiesJsonQuestion from './sections/plantour-features/How do I add update or delete entities.json';

export const GENERATED_SECTION_MANIFEST_ENTRIES: [string, unknown][] = [
  ['get-started', getStartedSectionManifest],
  ['why-plantour', whyPlantourSectionManifest],
  ['plantour-features', plantourFeaturesSectionManifest]
];

export const GENERATED_QUESTION_SOURCE_ENTRIES: [string, unknown][] = [
  ['get-started/Why do I need to use Plantour.json', getStartedWhyDoINeedToUsePlantourJsonQuestion],
  ['get-started/Can I try Plantour without the account creation.json', getStartedCanITryPlantourWithoutTheAccountCreationJsonQuestion],
  ['get-started/What are my first steps with Plantour.json', getStartedWhatAreMyFirstStepsWithPlantourJsonQuestion],
  ['get-started/How can I switch my account from temporary to regular.json', getStartedHowCanISwitchMyAccountFromTemporaryToRegularJsonQuestion],
  ['why-plantour/What is dictionary.json', whyPlantourWhatIsDictionaryJsonQuestion],
  ['why-plantour/What are the main entities that Plniur operates with.json', whyPlantourWhatAreTheMainEntitiesThatPlniurOperatesWithJsonQuestion],
  ['why-plantour/What are Plantour\'s core workflows.json', whyPlantourWhatArePlantourSCoreWorkflowsJsonQuestion],
  ['plantour-features/How do I add update or delete entities.json', plantourFeaturesHowDoIAddUpdateOrDeleteEntitiesJsonQuestion]
];
