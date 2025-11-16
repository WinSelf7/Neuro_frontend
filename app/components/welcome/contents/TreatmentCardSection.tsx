import { ChevronLeftIcon } from "lucide-react";
import React from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

export const TreatmentCardSection = () => {
  return (
    <Card className="w-full rounded-lg overflow-hidden border-[none] bg-[linear-gradient(196deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,rgba(255,255,255,1)_0%,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
      <CardContent className="flex items-center justify-between gap-6 px-5 py-4 relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-2 hover:bg-transparent"
        >
          <ChevronLeftIcon className="w-6 h-6 text-[#faecd2]" />
        </Button>

        <img className="w-36 h-16" alt="Frame" src="res://icons/frame.svg" />

        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center gap-4">
            <h1 className="font-h4 font-[number:var(--h4-font-weight)] text-[#faecd2] text-[length:var(--h4-font-size)] tracking-[var(--h4-letter-spacing)] leading-[var(--h4-line-height)] whitespace-nowrap [font-style:var(--h4-font-style)]">
              Centre Médical La Boule
            </h1>
          </div>

          <p className="font-p3-regular font-[number:var(--p3-regular-font-weight)] text-[#faecd2] text-[length:var(--p3-regular-font-size)] text-center tracking-[var(--p3-regular-letter-spacing)] leading-[var(--p3-regular-line-height)] [font-style:var(--p3-regular-font-style)]">
            Ophtalmologie
          </p>
        </div>

        <div className="flex flex-col items-start">
          <p className="font-p3-regular font-[number:var(--p3-regular-font-weight)] text-[#faecd2cc] text-[length:var(--p3-regular-font-size)] text-center tracking-[var(--p3-regular-letter-spacing)] leading-[var(--p3-regular-line-height)] [font-style:var(--p3-regular-font-style)]">
            Système
          </p>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#beffad] rounded-lg" />

            <span className="font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#faecd2] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)] [font-style:var(--p3-bold-font-style)]">
              Opérationnel
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
