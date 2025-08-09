import { useRouter } from "next/router";
import { FunctionComponent, MouseEventHandler } from "react";
import { MdOutlineArrowRightAlt } from "react-icons/md";

interface NavigationCalloutButtonProps {
  bgColor: string;
  fgColor: string;
  text: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}

const NavigationCalloutButton: FunctionComponent<
  NavigationCalloutButtonProps
> = ({
  bgColor = "bg-accent",
  fgColor = "text-white",
  text = "Click here",
  onClick = (e) => {},
}) => {
  const router = useRouter();
  return (
    <div
      className={`flex flex-row hover:cursor-pointer bg-${bgColor} px-3 py-2 gap-2`}
      onClick={onClick}
    >
      <div className={`font-bold text-${fgColor}`}>{text}</div>

      <MdOutlineArrowRightAlt
        className={`h-full text-${fgColor}`}
        size={20}
      ></MdOutlineArrowRightAlt>
    </div>
  );
};

export default NavigationCalloutButton;
