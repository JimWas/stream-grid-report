
import React from "react";
import { Livestream } from "@/types/livestream";
import HeroStream from "./HeroStream";

interface Props {
  stream: Livestream | null;
}

const StreamOfTheHour: React.FC<Props> = ({ stream }) =>
  stream ? (
    <div className="my-8 p-4 border-2 border-black">
      <h2 className="text-2xl font-bold font-mono uppercase text-center mb-4">
        STREAM OF THE HOUR
      </h2>
      <HeroStream stream={stream} />
    </div>
  ) : null;

export default StreamOfTheHour;
