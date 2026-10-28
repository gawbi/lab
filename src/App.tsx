import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { initSmoothScroll } from "./lib/smooth";
import { StatusBar } from "./components/StatusBar";
import { Hero } from "./components/Hero";
import { Systems } from "./components/Systems";
import { Research } from "./components/Research";
import { SystemLog } from "./components/SystemLog";

export default function App() {
  useEffect(() => initSmoothScroll(), []);

  return (
    <MotionConfig reducedMotion="user">
      <StatusBar />
      <main>
        <Hero />
        <Systems />
        <Research />
        <SystemLog />
      </main>
    </MotionConfig>
  );
}
