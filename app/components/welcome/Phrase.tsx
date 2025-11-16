import React from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";

export const PhraseLightMode = () => {
  const phraseInputs = Array.from({ length: 12 }, (_, i) => i);

  const modeOptions = [
    { value: "light", label: "Light Mode" },
    { value: "balance", label: "Balance Mode" },
    { value: "dark", label: "Dark Mode" },
  ];

  return (
    <main className="w-[400px] h-[710px] flex flex-col items-center bg-[url(/light-background-1.png)] bg-cover bg-[50%_50%]">
      <img
        className="ml-px h-[115px] w-[175px] mt-[21px] object-cover"
        alt="Logo light"
        src="res://icons/logo-light.png"
      />

      <img
        className="h-[27px] w-[202px] mt-[15px] object-cover"
        alt="Name light"
        src="res://icons/name-light.png"
      />

      <p className="flex items-center justify-center h-[19px] w-52 mt-2.5 [font-family:'Open_Sans',Helvetica] font-normal text-d-9d-9d-9 text-sm text-center tracking-[0] leading-[normal]">
        Votre gestion, notre intelligence
      </p>

      <p className="flex items-center justify-center h-11 w-[318px] mt-6 [font-family:'Open_Sans',Helvetica] font-normal text-[#7e6c52] text-base text-center tracking-[0] leading-[22px]">
        Enter your 12-phrase recovery code when completing account creation.
      </p>

      <div className="flex h-[196px] w-[318px] mt-6 flex-wrap items-center gap-[12px_15px]">
        {phraseInputs.map((index) => (
          <div
            key={index}
            className="flex w-24 h-10 items-center justify-center gap-[5.86px] px-3.5 py-3 rounded-[28px] border-2 border-solid border-[#816a4a] shadow-[4.69px_4.69px_7.03px_#00000026]"
          >
            <Input
              className="flex-1 h-auto border-0 bg-transparent p-0 text-center [font-family:'Open_Sans',Helvetica] font-semibold text-d-9d-9d-9 text-xs tracking-[0] leading-[normal] focus-visible:ring-0 focus-visible:ring-offset-0"
              defaultValue="|"
            />
          </div>
        ))}
      </div>

      <ToggleGroup
        type="single"
        defaultValue="light"
        className="inline-flex ml-px h-6 w-[169px] mt-[65px] items-center gap-[3px] px-[5px] py-[3px] rounded-xl border-[0.59px] border-solid border-[#816a4a]"
      >
        {modeOptions.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={`flex w-[51px] h-4 items-center justify-center gap-1 px-2 py-[3px] rounded-xl border-[0.5px] border-solid border-[#816a4a] data-[state=on]:bg-[linear-gradient(90deg,rgba(172,145,109,1)_0%,rgba(175,161,132,1)_50%,rgba(129,109,81,1)_100%)] data-[state=off]:bg-transparent ${
              option.value === "light" ? "" : "border-0"
            }`}
          >
            <span
              className={`w-fit [font-family:'Open_Sans',Helvetica] font-normal text-[7px] text-center tracking-[0] leading-[10.5px] whitespace-nowrap data-[state=on]:text-[#fff8dc] data-[state=off]:text-[#5b4c36] ${
                option.value === "light" ? "text-[#fff8dc]" : "text-[#5b4c36]"
              }`}
            >
              {option.label}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="flex h-12 w-80 mt-[17px] items-center gap-4">
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-[28px] border-2 border-solid border-[#816a4a] shadow-[4.69px_4.69px_7.03px_#00000026] bg-transparent [text-shadow:0px_4px_4px_#00000040] [font-family:'Open_Sans',Helvetica] font-normal text-[#7e6c52] text-[17.6px] tracking-[0] leading-[normal] hover:bg-transparent"
        >
          Back
        </Button>

        <Button
          disabled
          className="h-12 flex-1 bg-[#c6beb3] rounded-[28px] shadow-[4.69px_4.69px_7.03px_#00000026] [font-family:'Open_Sans',Helvetica] font-normal text-[#8f8f8f] text-[17.6px] tracking-[0] leading-[normal] hover:bg-[#c6beb3]"
        >
          Continue
        </Button>
      </div>

      <footer className="ml-px h-4 w-[375px] mt-[24.1px] [font-family:'Open_Sans',Helvetica] font-normal text-d-9d-9d-9 text-[11.7px] tracking-[0] leading-[normal]">
        <span className="font-semibold text-[#7d6c51]">NeuroX-TMAX </span>
        <span className="[font-family:'Montserrat',Helvetica] font-medium text-[#7d6c51]">
          - Design{" "}
        </span>
        <span className="text-[#7d6c51]">exclusif</span>
        <span className="[font-family:'Montserrat',Helvetica] font-medium text-[#7d6c51]">
          , Toute reproduction est interdite.
        </span>
      </footer>
    </main>
  );
};
