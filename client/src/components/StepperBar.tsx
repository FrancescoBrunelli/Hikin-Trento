import React from "react";
import "../styles/StepperBar.css"

interface StepperBarProps {
    steps: string[];
    currentStep: number;
}

export default function StepperBar({ steps, currentStep }: StepperBarProps) {
  return (
      <div className="stepper">
          {steps.map((_step, index) => (
              <React.Fragment key={index}>
                  <div className={`stepper-step ${index <= currentStep ? 'completed' : ""}`}>
                      <div className="stepper-circle">
                          {index < currentStep ? "✓" : index + 1}
                      </div>
                      {index < steps.length - 1 && (
                          <div className={`stepper-line ${index < currentStep ? "completed" : ""}`} />
                      )}
                  </div>
              </React.Fragment>
        ))}
      </div>
    )
}
