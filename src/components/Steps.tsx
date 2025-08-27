// components/Steps.tsx
import { CheckCircle2, Circle } from "lucide-react"

const steps = [
    { id: 1, name: "Creează cont" },
    { id: 2, name: "Alege abonament" },
    { id: 3, name: "Generează pagini" },
]

export default function Steps({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex items-center justify-center gap-6 my-8">
            {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                    {step.id < currentStep ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : step.id === currentStep ? (
                        <Circle className="w-8 h-8 text-blue-500" />
                    ) : (
                        <Circle className="w-8 h-8 text-gray-400" />
                    )}
                    <span className="mt-2 text-sm">{step.name}</span>
                </div>
            ))}
        </div>
    )
}
