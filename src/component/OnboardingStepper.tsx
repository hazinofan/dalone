// components/OnboardingStepper.tsx
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export type StepDef = {
  label: string;
  value: number;  // the “step” number in your parent component
};

export function OnboardingStepper({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: StepDef[];
}) {
  // find index of the current step in the array
  const idx = steps.findIndex((s) => s.value === currentStep);
  // guard against not-found
  const activeIndex = idx < 0 ? 0 : idx;
  // percent = how far along we are (0 → last index) in 0–100
  const percent = Math.round((activeIndex / (steps.length - 1)) * 100);

  return (
    <div className="flex items-center justify-between w-full px-10 mb-8">
      <Tabs defaultValue={`step${currentStep}`}>
        <TabsList className="flex-1 bg-transparent gap-2">
          {steps.map((stepDef, i) => (
            <TabsTrigger
              key={stepDef.value}
              aria-disabled="true"
              value={`step${stepDef.value}`}
              className={`
                flex-1 pointer-events-none py-2 gap-5 px-4 rounded-full
                data-[state=active]:bg-blue-900 data-[state=active]:text-white
                data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-600
                text-center font-medium
              `}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className={`
                    w-6 h-6 flex items-center justify-center rounded-full
                    ${i === activeIndex
                      ? "bg-white text-green-500"
                      : "bg-gray-300 text-gray-600"
                    }
                  `}
                >
                  {i + 1}
                </span>
                {stepDef.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="w-40 flex items-center">
        <Progress value={percent} />
        <span className="ml-2 text-sm font-medium">{percent}%</span>
      </div>
    </div>
  );
}
