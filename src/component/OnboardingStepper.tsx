// components/OnboardingStepper.tsx
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export function OnboardingStepper({ currentStep }: { currentStep: number }) {
  // manual map from step → percent
  const percent = 
    currentStep === 2 ? 25 :
    currentStep === 3 ? 50 :
    currentStep === 4 ? 100 :
    0;

  return (
    <div className="flex items-center justify-between w-full px-10 mb-8">
      <Tabs defaultValue={`step${currentStep}`}>
        <TabsList className="flex-1 bg-transparent gap-2">
          {["Personal Info", "Professional Info", "Account Security"].map((label, i) => {
            const step = i + 2; // now your steps are 2,3,4
            return (
              <TabsTrigger
                key={step}
                aria-disabled="true"
                value={`step${step}`}
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
                      ${step === currentStep
                        ? "bg-white text-green-500"
                        : "bg-gray-300 text-gray-600"
                      }
                    `}
                  >
                    {step}
                  </span>
                  {label}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="w-40 flex items-center">
        <Progress value={percent} />
        <span className="ml-2 text-sm font-medium">{percent}%</span>
      </div>
    </div>
  );
}
