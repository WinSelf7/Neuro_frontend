import React from "react";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";

export const TreatmentDetailsSection = () => {
  return (
    <section className="w-full">
      <Card className="border-[none] bg-[linear-gradient(196deg,rgba(211,193,173,0.24)_0%,rgba(192,168,143,0.24)_15%,rgba(155,123,95,0.24)_82%,rgba(124,95,72,0.24)_100%)] rounded-lg before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,rgba(255,255,255,1)_0%,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <CardContent className="flex flex-col gap-6 p-5">
          <header className="flex items-center gap-4 w-full">
            <h2 className="flex-1 font-h6 font-[number:var(--h6-font-weight)] text-[#4e3117] text-[length:var(--h6-font-size)] tracking-[var(--h6-letter-spacing)] leading-[var(--h6-line-height)] [font-style:var(--h6-font-style)]">
              Ordonnance en cours de traitement
            </h2>

            <Badge className="inline-flex flex-col items-center gap-4 p-4 bg-[#4e311714] rounded-lg border border-solid border-[#4e311780] h-auto hover:bg-[#4e311714]">
              <div className="inline-flex items-center justify-center gap-2.5">
                <div className="w-4 h-4 bg-[#4e3117] rounded-lg" />
                <span className="font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#4e3117] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)] [font-style:var(--p3-bold-font-style)]">
                  TRAITEMENT EN COURS
                </span>
              </div>
            </Badge>
          </header>

          <div className="flex justify-center">
            <img
              className="w-full max-w-[667.8px] h-auto"
              alt="Prescription document"
              src="res://icons/image-97.png"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
