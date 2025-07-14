// components/OnboardingStepper.tsx
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export type StepDef = {
  label: string;
  value: number;
};

export function OnboardingStepper({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: StepDef[];
}) {
  const idx = steps.findIndex((s) => s.value === currentStep);
  const activeIndex = idx < 0 ? 0 : idx;
  const percent = Math.round((activeIndex / (steps.length - 1)) * 100);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full px-4 sm:px-6 md:px-10 mb-6 sm:mb-8 gap-4 sm:gap-0">
      <Tabs defaultValue={`step${currentStep}`} className="w-full sm:w-auto">
        <TabsList className="modal flex md:flex-row flex-col items-start gap-3">
          {steps.map((stepDef, i) => (
            <TabsTrigger
              key={stepDef.value}
              aria-disabled="true"
              value={`step${stepDef.value}`}
              className={`
                flex-1 sm:flex-auto pointer-events-none py-1 sm:py-2 gap-2 sm:gap-5 
                px-2 sm:px-4 rounded-full text-xs sm:text-sm md:text-base
                data-[state=active]:bg-blue-900 data-[state=active]:text-white
                data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-600
                font-medium min-w-[80px] sm:min-w-0
              `}
            >
              <span className="inline-flex items-center gap-1 sm:gap-2">
                <span
                  className={`
                    w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full
                    ${i === activeIndex
                      ? "bg-white text-green-500"
                      : "bg-gray-300 text-gray-600"
                    }
                  `}
                >
                  {i + 1}
                </span>
                <span className="truncate">{stepDef.label}</span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="w-full sm:w-40 flex items-center justify-end sm:justify-normal">
        <Progress value={percent} className="h-2 w-[80px] sm:w-full" />
        <span className="ml-2 text-xs sm:text-sm font-medium">{percent}%</span>
      </div>
    </div>
  );
}