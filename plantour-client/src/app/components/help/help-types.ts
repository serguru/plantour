export interface HelpSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  subsections?: HelpSubsection[];
}

export interface HelpSubsection {
  id: string;
  title: string;
}
