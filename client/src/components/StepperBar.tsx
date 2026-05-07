interface StepperBarProps {
    steps: string[];
    currentStep: number;
}

export default function StepperBar({ steps, currentStep }: StepperBarProps) {
  return (
      <div className="stepper">
          {steps.map((step, index) => (
              <div key={index} className={`stepper-step ${index <= currentStep ? 'completed' : ""}`}>
                  <div className="stepper-circle">{index < currentStep ? "✓" : index + 1}</div>
                  <span className="stepper-label">{step}</span>
                  {index < steps.length - 1 && <div className={`stepper-line ${index < currentStep ? "completed" : ""}`}/>}
              </div>
        ))}
      </div>
    )
}
