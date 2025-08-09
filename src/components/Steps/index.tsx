import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import { MdOutlineArrowForward } from "react-icons/md";

export type Step = {
  name: string;
  step: string;
};

export const steps: Step[] = [
  { name: "Upload Bill", step: "upload" },
  { name: "Verify Info", step: "verify" },
  { name: "Complete", step: "complete" },
];

interface StepComponentProps {
  steps: Step[];
  currentStep: Step;
  updateCurrentStep: (step: Step) => void;
}

const StepComponent: FunctionComponent<StepComponentProps> = ({
  steps,
  currentStep,
  updateCurrentStep,
}) => {
  return (
    <div className="w-full max-w-[1180px] px-5 py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
                  step.step === currentStep.step
                    ? 'bg-accent'
                    : index < steps.findIndex(s => s.step === currentStep.step)
                    ? 'bg-lighter-green'
                    : 'bg-elevation text-dark-0-85'
                }`}
                onClick={() => updateCurrentStep(step)}
              >
                {index + 1}
              </div>
              <span className={`ml-2 text-body ${step.step === currentStep.step ? 'text-accent font-medium' : 'text-dark'}`}>
                {step.name}
              </span>
            </div>
            {index !== steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-4 ${index < steps.findIndex(s => s.step === currentStep.step) ? 'bg-lighter-green' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepComponent;
