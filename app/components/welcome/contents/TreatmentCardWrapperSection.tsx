import React from "react";
import { Card, CardContent } from "../../../components/ui/card";

const infoCards = [
  {
    icon: "res://icons/icon-park-solid-check-one.svg",
    title: "Processus NORMAL",
    description:
      "La feuille de soins est lue automatiquement et l'ordonnance est insérée directement dans le dossier patient. Vous n'avez rien à faire !",
  },
  {
    icon: "res://icons/fluent-warning-12-filled.svg",
    title: "En cas d'ÉCHEC d'insertion",
    description:
      "Si le système ne peut pas insérer l'ordonnance dans le dossier patient (panne, problème technique), les boutons ci-dessous apparaîtront pour permettre l'envoi par mail en urgence.",
  },
];

export const TreatmentCardWrapperSection = () => {
  return (
    <section className="w-full bg-[linear-gradient(196deg,rgba(211,193,173,1)_0%,rgba(192,168,143,1)_15%,rgba(155,123,95,1)_82%,rgba(124,95,72,1)_100%)] flex flex-col gap-6 p-5 rounded-lg before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(98deg,rgba(255,255,255,1)_0%,rgba(155,123,95,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none relative">
      <header className="flex items-center gap-4 w-full">
        <div className="bg-[#faecd229] border-[#faecd28f] w-10 h-10 rounded-[20px] border-[0.62px] border-solid flex items-center justify-center">
          <img
            className="w-6 h-6"
            alt="Mingcute warning"
            src="res://icons/mingcute-warning-fill.svg"
          />
        </div>

        <h2 className="flex items-center justify-center flex-1 font-h6 font-[number:var(--h6-font-weight)] text-[#faecd2] text-[length:var(--h6-font-size)] tracking-[var(--h6-letter-spacing)] leading-[var(--h6-line-height)] [font-style:var(--h6-font-style)]">
          Fonctionnement du système
        </h2>
      </header>

      <div className="flex items-stretch gap-4 w-full">
        {infoCards.map((card, index) => (
          <Card
            key={index}
            className="flex-1 bg-[#faecd214] border-none rounded-lg"
          >
            <CardContent className="flex flex-col items-center gap-4 pt-4 pb-6 px-4">
              <div className="flex items-center justify-center gap-2.5 w-full">
                <div className="w-8 h-8 bg-[#faecd229] rounded-2xl border-[0.5px] border-solid border-[#faecd28f] flex items-center justify-center flex-shrink-0">
                  <img className="w-5 h-5" alt={card.title} src={card.icon} />
                </div>

                <h3 className="flex items-center justify-center flex-1 font-p3-bold font-[number:var(--p3-bold-font-weight)] text-[#faecd2] text-[length:var(--p3-bold-font-size)] tracking-[var(--p3-bold-letter-spacing)] leading-[var(--p3-bold-line-height)] [font-style:var(--p3-bold-font-style)]">
                  {card.title}
                </h3>
              </div>

              <div className="flex items-center justify-center gap-2.5 pl-[42px] pr-0 py-0 w-full">
                <p className="flex items-center justify-center flex-1 mt-[-1.00px] font-caption-1-regular font-[number:var(--caption-1-regular-font-weight)] text-[#faecd2] text-[length:var(--caption-1-regular-font-size)] tracking-[var(--caption-1-regular-letter-spacing)] leading-[var(--caption-1-regular-line-height)] [font-style:var(--caption-1-regular-font-style)]">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
