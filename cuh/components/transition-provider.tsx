"use client";

import {
  unstable_ViewTransition as ViewTransition,
  ViewTransitionInstance,
} from "react";

type InstanceParam = {
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions
}



export default function TransitionProvider({
  children,
  name,
  // oldInstance,
  // newInstance,
}: {
  children: React.ReactNode;
  name?: string;
  // oldInstance: InstanceParam,
  // newInstance: InstanceParam
}) {
  function onUpdate(instance: ViewTransitionInstance,) {
    console.log("update");
    //
    //   if (oldInstance) {
    //
    //     instance.old.animate(
    //       oldInstance.keyframes,
    //       oldInstance.options
    //     );
    //
    //   }
    //
    //   if (newInstance) {
    //
    //     console.log(newInstance)
    //     instance.new.animate(
    //       newInstance.keyframes,
    //       newInstance.options
    //     );
    //
    //   }
  }

  return (
    <ViewTransition onUpdate={(e) => {
      console.log(e)
    }} name={name ? name : "auto"}>
      {children}
    </ViewTransition>
  );
}
