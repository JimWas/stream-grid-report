
import React from "react";
import { Livestream } from "@/types/livestream";
import HeroStream from "./HeroStream";

interface FeaturedStreamProps {
  stream: Livestream | null;
}

const FeaturedStream: React.FC<FeaturedStreamProps> = ({ stream }) => {
  if (!stream) return null;
  return <HeroStream stream={stream} />;
};

export default FeaturedStream;
